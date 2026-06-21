/**
 * Spotify Authorization Code + PKCE flow (client-side, no secret).
 * Used to get a Premium user's token for the Web Playback SDK (full-track playback).
 * Tokens live in localStorage; refreshed on demand.
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? ""

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
].join(" ")

const STORE_KEY = "spotify_tokens"
const VERIFIER_KEY = "spotify_pkce_verifier"
const RETURN_KEY = "spotify_return_to"

export type Tokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export function isConfigured(): boolean {
  return CLIENT_ID.length > 0
}

function redirectUri(): string {
  return `${window.location.origin}/callback`
}

function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  const values = crypto.getRandomValues(new Uint8Array(length))
  let out = ""
  for (let i = 0; i < length; i++) out += chars.charAt(values[i]! % chars.length)
  return out
}

function base64url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes)
  let str = ""
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]!)
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function challenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
  return base64url(digest)
}

function store(t: Tokens) {
  localStorage.setItem(STORE_KEY, JSON.stringify(t))
}

function read(): Tokens | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? (JSON.parse(raw) as Tokens) : null
  } catch {
    return null
  }
}

export function isConnected(): boolean {
  return read() !== null
}

export function disconnect() {
  localStorage.removeItem(STORE_KEY)
}

export function consumeReturnPath(): string {
  const p = sessionStorage.getItem(RETURN_KEY)
  sessionStorage.removeItem(RETURN_KEY)
  return p || "/"
}

export async function beginAuth(): Promise<void> {
  if (!CLIENT_ID) return
  const verifier = randomString(64)
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  sessionStorage.setItem(RETURN_KEY, window.location.pathname)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: await challenge(verifier),
  })
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function completeAuth(code: string): Promise<boolean> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  if (!verifier || !CLIENT_ID) return false
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }).toString(),
  })
  sessionStorage.removeItem(VERIFIER_KEY)
  if (!res.ok) return false
  const d = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number }
  store({ accessToken: d.access_token, refreshToken: d.refresh_token, expiresAt: Date.now() + d.expires_in * 1000 })
  return true
}

export async function getValidToken(): Promise<string | null> {
  const t = read()
  if (!t || !CLIENT_ID) return null
  if (Date.now() < t.expiresAt - 60_000) return t.accessToken

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: t.refreshToken,
    }).toString(),
  })
  if (!res.ok) {
    disconnect()
    return null
  }
  const d = (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number }
  const next: Tokens = {
    accessToken: d.access_token,
    refreshToken: d.refresh_token ?? t.refreshToken,
    expiresAt: Date.now() + d.expires_in * 1000,
  }
  store(next)
  return next.accessToken
}
