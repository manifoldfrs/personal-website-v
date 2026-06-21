"use client"

import { useEffect, useRef, type RefObject } from "react"

export type Playback = {
  isPaused: boolean
  positionMs: number // position reported by the embed
  durationMs: number // duration of what is loaded (preview ~30s or full track)
  fullDurationMs: number // full track length from the Spotify API
  lastUpdate: number // performance.now() at the last playback_update
  trackSeed: number // per-track seed for procedural variety
}

export type WaveformData = {
  fps: number
  bins: number
  frames: number[][] // each frame: `bins` values, 0..255
} | null

// Superman-over-navy palette
const RED_LOW = [112, 14, 26] as const
const RED_HIGH = [255, 42, 72] as const // a touch brighter than #e60026
const YELLOW = [252, 234, 14] as const // #fcea0e

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

/**
 * histography.io-style grid of pixel dots that act as a spectrum.
 * Synced to precomputed FFT frames when the full track is playing and data exists,
 * otherwise a procedural animation that reacts to play/pause and position.
 */
export function PixelWaves({
  playbackRef,
  waveformRef,
  columns,
  rows,
}: {
  playbackRef: RefObject<Playback>
  waveformRef: RefObject<WaveformData>
  columns: number
  rows: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const heightsRef = useRef<number[]>(new Array(columns).fill(0))

  useEffect(() => {
    heightsRef.current = new Array(columns).fill(0)
  }, [columns])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      raf = requestAnimationFrame(draw)
      const pb = playbackRef.current
      const wf = waveformRef.current
      const rect = canvas.getBoundingClientRect()
      const W = rect.width
      const H = rect.height
      ctx.clearRect(0, 0, W, H)
      if (W <= 0 || H <= 0) return

      const now = performance.now()
      let posMs = pb.positionMs
      if (!pb.isPaused) posMs += now - pb.lastUpdate
      const t = now / 1000

      // true sync requires precomputed data AND full-track playback (not a ~30s preview)
      const isFull =
        pb.fullDurationMs > 0 && pb.durationMs > 0 && Math.abs(pb.durationMs - pb.fullDurationMs) < 4000
      const synced = !!wf && isFull

      const heights = heightsRef.current
      const cols = heights.length

      for (let c = 0; c < cols; c++) {
        let target = 0
        if (pb.isPaused) {
          // gentle idle shimmer
          target = 0.05 + 0.04 * (0.5 + 0.5 * Math.sin(t * 1.1 + c * 0.45))
        } else if (synced && wf) {
          const frameIdx = Math.min(
            wf.frames.length - 1,
            Math.max(0, Math.floor((posMs / 1000) * wf.fps)),
          )
          const frame = wf.frames[frameIdx]
          const bin = Math.min(wf.bins - 1, Math.floor((c / cols) * wf.bins))
          target = (frame?.[bin] ?? 0) / 255
        } else {
          // procedural spectrum: layered sines + flicker, seeded per track
          const s = pb.trackSeed
          const base =
            0.5 * Math.abs(Math.sin(c * 0.5 + t * 2.1 + s)) +
            0.3 * Math.abs(Math.sin(c * 0.23 - t * 1.3 + s * 2)) +
            0.2 * Math.abs(Math.sin(c * 0.11 + t * 3.7 + s * 3))
          const flicker = 0.82 + 0.18 * hash(c * 7.3 + Math.floor(t * 12))
          const envelope = 0.45 + 0.55 * Math.sin((c / cols) * Math.PI)
          target = base * flicker * envelope * 0.9
        }

        target = Math.max(0, Math.min(1, target))
        const smoothing = pb.isPaused ? 0.05 : synced ? 0.55 : 0.3
        const h = heights[c] ?? 0
        heights[c] = h + (target - h) * smoothing
      }

      const colW = W / cols
      const rowH = H / rows
      const dot = Math.min(colW, rowH) * 0.6

      for (let c = 0; c < cols; c++) {
        const lit = Math.round((heights[c] ?? 0) * rows)
        const cx = c * colW + colW / 2
        for (let r = 0; r < rows; r++) {
          const on = r < lit
          const level = rows > 1 ? r / (rows - 1) : 0
          const cy = H - (r + 0.5) * rowH
          let cr: number
          let cg: number
          let cb: number
          let alpha: number
          if (on) {
            if (level > 0.85) {
              cr = YELLOW[0]
              cg = YELLOW[1]
              cb = YELLOW[2]
            } else {
              cr = lerp(RED_LOW[0], RED_HIGH[0], level)
              cg = lerp(RED_LOW[1], RED_HIGH[1], level)
              cb = lerp(RED_LOW[2], RED_HIGH[2], level)
            }
            alpha = 0.9
          } else {
            cr = RED_LOW[0]
            cg = RED_LOW[1]
            cb = RED_LOW[2]
            alpha = 0.14
          }
          ctx.fillStyle = `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${alpha})`
          ctx.beginPath()
          ctx.arc(cx, cy, dot / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [playbackRef, waveformRef, rows])

  return <canvas ref={canvasRef} className="h-full w-full" />
}
