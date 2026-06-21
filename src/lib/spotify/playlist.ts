/**
 * Playlist track list.
 *
 * Spotify blocks app-only (client-credentials) access to playlist *items*, so the
 * list is fetched once via a user login and committed as static data. Regenerate
 * after changing the playlist:  bun scripts/fetch-tracks.ts
 *
 * The data is all public (id/uri/name/artists/art/duration) — safe to commit.
 * No Spotify API call or credentials are needed at runtime.
 */

import tracksData from "./tracks.json"

const PLAYLIST_ID = "27YnAWdvBHYT7Ekhko0Vwp"

export const PLAYLIST_URI = `spotify:playlist:${PLAYLIST_ID}`
export const PLAYLIST_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`

export type SpotifyTrack = {
  id: string
  uri: string
  name: string
  artists: string
  image: string | null
  durationMs: number
}

export async function getPlaylistTracks(): Promise<SpotifyTrack[]> {
  return tracksData as unknown as SpotifyTrack[]
}
