"use client"

import { useEffect, useRef, type RefObject } from "react"

export type Playback = {
  isPaused: boolean
  positionMs: number // position reported by the embed / SDK
  durationMs: number // duration of what is loaded (preview ~30s or full track)
  fullDurationMs: number // full track length from the Spotify API
  lastUpdate: number // performance.now() at the last playback update
  trackSeed: number // per-track seed for procedural variety
}

export type WaveformData = {
  fps: number
  bins: number
  frames: number[][] // each frame: `bins` values, 0..255
} | null

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

// Hot gradient: deep red -> red -> orange -> yellow at the peaks
const STOPS: { at: number; c: readonly [number, number, number] }[] = [
  { at: 0, c: [96, 12, 24] },
  { at: 0.45, c: [255, 42, 72] },
  { at: 0.75, c: [255, 122, 40] },
  { at: 1, c: [252, 234, 14] },
]

function ramp(level: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, level))
  for (let i = 1; i < STOPS.length; i++) {
    const a = STOPS[i - 1]!
    const b = STOPS[i]!
    if (x <= b.at) {
      const t = (x - a.at) / (b.at - a.at || 1)
      return [lerp(a.c[0], b.c[0], t), lerp(a.c[1], b.c[1], t), lerp(a.c[2], b.c[2], t)]
    }
  }
  const last = STOPS[STOPS.length - 1]!.c
  return [last[0], last[1], last[2]]
}

/**
 * histography.io-style grid of pixel dots that act as a spectrum, juiced with a
 * hot color ramp, additive bloom on the peaks, and a beat-driven pulse.
 * Synced to precomputed FFT frames on full-track playback; procedural otherwise.
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
  const pulseRef = useRef(0)

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

      const isFull =
        pb.fullDurationMs > 0 && pb.durationMs > 0 && Math.abs(pb.durationMs - pb.fullDurationMs) < 4000
      const synced = !!wf && isFull

      // current FFT frame (synced mode)
      let frame: number[] | undefined
      if (synced && wf) {
        const frameIdx = Math.min(wf.frames.length - 1, Math.max(0, Math.floor((posMs / 1000) * wf.fps)))
        frame = wf.frames[frameIdx]
      }

      // beat pulse: bass energy when synced, a synthesized kick otherwise
      let pulseTarget = 0
      if (!pb.isPaused) {
        if (frame) {
          const n = Math.min(3, frame.length)
          let s = 0
          for (let i = 0; i < n; i++) s += frame[i] ?? 0
          pulseTarget = n > 0 ? s / n / 255 : 0
        } else {
          pulseTarget = Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI * 4 + pb.trackSeed), 6)
        }
      }
      pulseRef.current += (pulseTarget - pulseRef.current) * 0.35
      const pulse = pulseRef.current

      const heights = heightsRef.current
      const cols = heights.length

      for (let c = 0; c < cols; c++) {
        let target = 0
        if (pb.isPaused) {
          target = 0.05 + 0.04 * (0.5 + 0.5 * Math.sin(t * 1.1 + c * 0.45))
        } else if (synced && frame) {
          const bin = Math.min(wf!.bins - 1, Math.floor((c / cols) * wf!.bins))
          target = (frame[bin] ?? 0) / 255
        } else {
          const s = pb.trackSeed
          const base =
            0.5 * Math.abs(Math.sin(c * 0.5 + t * 2.1 + s)) +
            0.3 * Math.abs(Math.sin(c * 0.23 - t * 1.3 + s * 2)) +
            0.2 * Math.abs(Math.sin(c * 0.11 + t * 3.7 + s * 3))
          const flicker = 0.82 + 0.18 * hash(c * 7.3 + Math.floor(t * 12))
          const envelope = 0.45 + 0.55 * Math.sin((c / cols) * Math.PI)
          target = (base * flicker * envelope * 0.9 + pulse * 0.12) * 1
        }
        target = Math.max(0, Math.min(1, target))
        const smoothing = pb.isPaused ? 0.05 : synced ? 0.55 : 0.3
        const h = heights[c] ?? 0
        heights[c] = h + (target - h) * smoothing
      }

      const colW = W / cols
      const rowH = H / rows
      // cap peaks below the top so the spectrum stays out of the reading area
      const maxLit = Math.max(1, rows - 30)
      const baseDot = Math.min(colW, rowH) * 0.55
      const dot = baseDot * (1 + 0.25 * pulse)
      const litAlpha = Math.min(1, 0.85 + 0.12 * pulse)

      // pass 1: the full dot matrix (dim grid + lit columns)
      for (let c = 0; c < cols; c++) {
        const lit = Math.round((heights[c] ?? 0) * maxLit)
        const cx = c * colW + colW / 2
        for (let r = 0; r < rows; r++) {
          const on = r < lit
          const level = maxLit > 1 ? r / (maxLit - 1) : 0
          const cy = H - (r + 0.5) * rowH
          if (on) {
            const [cr, cg, cb] = ramp(level)
            ctx.fillStyle = `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${litAlpha})`
          } else {
            ctx.fillStyle = "rgba(96, 12, 24, 0.12)"
          }
          ctx.beginPath()
          ctx.arc(cx, cy, dot / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // pass 2: additive bloom on the bright peaks
      ctx.globalCompositeOperation = "lighter"
      const glowAlpha = 0.14 + 0.22 * pulse
      for (let c = 0; c < cols; c++) {
        const lit = Math.round((heights[c] ?? 0) * maxLit)
        const cx = c * colW + colW / 2
        for (let r = 0; r < lit; r++) {
          const level = maxLit > 1 ? r / (maxLit - 1) : 0
          const cy = H - (r + 0.5) * rowH
          const [cr, cg, cb] = ramp(level)
          ctx.fillStyle = `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${glowAlpha})`
          ctx.beginPath()
          ctx.arc(cx, cy, dot * 1.7, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalCompositeOperation = "source-over"
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [playbackRef, waveformRef, rows])

  return <canvas ref={canvasRef} className="h-full w-full" />
}
