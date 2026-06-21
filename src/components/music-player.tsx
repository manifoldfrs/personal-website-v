"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { PixelWaves, type Playback, type WaveformData } from "./pixel-waves";

export type Track = {
        id: string;
        uri: string;
        name: string;
        artists: string;
        image: string | null;
        durationMs: number;
};

type EmbedEvent = {
        data: {
                isPaused: boolean;
                isBuffering: boolean;
                position: number;
                duration: number;
                playingURI: string;
        };
};

type EmbedController = {
        loadUri: (uri: string) => void;
        play: () => void;
        pause: () => void;
        resume: () => void;
        togglePlay: () => void;
        seek: (seconds: number) => void;
        addListener: (event: string, cb: (e: EmbedEvent) => void) => void;
};

type IframeApi = {
        createController: (
                el: HTMLElement,
                opts: {
                        uri: string;
                        width: string | number;
                        height: string | number;
                },
                cb: (controller: EmbedController) => void,
        ) => void;
};

declare global {
        interface Window {
                onSpotifyIframeApiReady?: (api: IframeApi) => void;
                __spotifyIframeApi?: IframeApi;
        }
}

const IFRAME_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

function makeOrder(n: number, keepFirst?: number): number[] {
        const arr = Array.from({ length: n }, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = arr[i]!;
                arr[i] = arr[j]!;
                arr[j] = tmp;
        }
        if (keepFirst !== undefined) {
                const idx = arr.indexOf(keepFirst);
                if (idx > 0) {
                        arr[idx] = arr[0]!;
                        arr[0] = keepFirst;
                }
        }
        return arr;
}

function seedFromId(id: string): number {
        let s = 0;
        for (let i = 0; i < id.length; i++)
                s = (s * 31 + id.charCodeAt(i)) % 997;
        return s / 100;
}

// --- icons ---
const IconPrev = (
        <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
        >
                <path d="M7 6h2v12H7zM20 6v12L9 12z" />
        </svg>
);
const IconNext = (
        <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
        >
                <path d="M15 6h2v12h-2zM4 6l11 6L4 18z" />
        </svg>
);
const IconPlay = (
        <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
        >
                <path d="M7 5l13 7L7 19z" />
        </svg>
);
const IconPause = (
        <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
        >
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
);
const IconShuffle = (
        <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
        >
                <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
        </svg>
);

const CTRL =
        "flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground";
const CTRL_ACTIVE =
        "flex h-8 w-8 items-center justify-center rounded-full border border-accent text-accent";
const PRIMARY =
        "flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent-bright";

export function MusicPlayer({
        tracks,
        playlistUri,
        playlistUrl,
}: {
        tracks: Track[];
        playlistUri: string;
        playlistUrl: string;
}) {
        const pathname = usePathname();
        const isAbout = pathname === "/about";
        const hasTracks = tracks.length > 0;

        const [slot, setSlot] = useState<HTMLElement | null>(null);

        const controllerRef = useRef<EmbedController | null>(null);
        const embedHostRef = useRef<HTMLDivElement | null>(null);

        const [isPaused, setIsPaused] = useState(true);
        const [shuffle, setShuffle] = useState(false);
        const [current, setCurrent] = useState<Track | null>(tracks[0] ?? null);

        const orderRef = useRef<number[]>(
                Array.from({ length: tracks.length }, (_, i) => i),
        );
        const posRef = useRef(0);
        const lastAdvanceRef = useRef(0);

        const playbackRef = useRef<Playback>({
                isPaused: true,
                positionMs: 0,
                durationMs: 0,
                fullDurationMs: tracks[0]?.durationMs ?? 0,
                lastUpdate: 0,
                trackSeed: tracks[0] ? seedFromId(tracks[0].id) : 0,
        });
        const waveformRef = useRef<WaveformData>(null);
        const waveformCache = useRef<Map<string, WaveformData>>(new Map());

        // Resolve the docked slot after commit (so the About page's target exists).
        useEffect(() => {
                const raf = requestAnimationFrame(() => {
                        setSlot(
                                isAbout
                                        ? document.getElementById("vibes-slot")
                                        : null,
                        );
                });
                return () => cancelAnimationFrame(raf);
        }, [isAbout]);

        const loadWaveform = useCallback(async (trackId: string) => {
                if (waveformCache.current.has(trackId)) {
                        waveformRef.current =
                                waveformCache.current.get(trackId) ?? null;
                        return;
                }
                waveformRef.current = null;
                try {
                        const res = await fetch(`/waveforms/${trackId}.json`);
                        if (res.ok) {
                                const data = (await res.json()) as WaveformData;
                                waveformCache.current.set(trackId, data);
                                waveformRef.current = data;
                        } else {
                                waveformCache.current.set(trackId, null);
                        }
                } catch {
                        waveformCache.current.set(trackId, null);
                }
        }, []);

        const goTo = useCallback(
                (newPos: number, play: boolean) => {
                        const controller = controllerRef.current;
                        if (!hasTracks || !controller) return;
                        const order = orderRef.current;
                        const len = order.length;
                        const p = ((newPos % len) + len) % len;
                        posRef.current = p;

                        const idx = order[p];
                        if (idx === undefined) return;
                        const track = tracks[idx];
                        if (!track) return;
                        setCurrent(track);
                        playbackRef.current.fullDurationMs = track.durationMs;
                        playbackRef.current.positionMs = 0;
                        playbackRef.current.durationMs = 0;
                        playbackRef.current.lastUpdate = performance.now();
                        playbackRef.current.trackSeed = seedFromId(track.id);
                        void loadWaveform(track.id);

                        controller.loadUri(track.uri);
                        if (play) controller.play();
                },
                [hasTracks, tracks, loadWaveform],
        );

        // initialize the IFrame API + controller once
        useEffect(() => {
                const host = embedHostRef.current;
                if (!host) return;

                const init = (api: IframeApi) => {
                        if (controllerRef.current) return;
                        api.createController(
                                host,
                                {
                                        uri: tracks[0]
                                                ? tracks[0].uri
                                                : playlistUri,
                                        width: "100%",
                                        height: "80",
                                },
                                (controller) => {
                                        controllerRef.current = controller;
                                        if (tracks[0])
                                                void loadWaveform(tracks[0].id);

                                        controller.addListener(
                                                "playback_update",
                                                (e) => {
                                                        const d = e.data;
                                                        setIsPaused(d.isPaused);
                                                        playbackRef.current.isPaused =
                                                                d.isPaused;
                                                        playbackRef.current.positionMs =
                                                                d.position;
                                                        playbackRef.current.durationMs =
                                                                d.duration;
                                                        playbackRef.current.lastUpdate =
                                                                performance.now();

                                                        const now =
                                                                performance.now();
                                                        if (
                                                                hasTracks &&
                                                                d.duration >
                                                                        1000 &&
                                                                d.position >=
                                                                        d.duration -
                                                                                500 &&
                                                                !d.isBuffering &&
                                                                now -
                                                                        lastAdvanceRef.current >
                                                                        1500
                                                        ) {
                                                                lastAdvanceRef.current =
                                                                        now;
                                                                goTo(
                                                                        posRef.current +
                                                                                1,
                                                                        true,
                                                                );
                                                        }
                                                },
                                        );
                                },
                        );
                };

                if (window.__spotifyIframeApi) {
                        init(window.__spotifyIframeApi);
                        return;
                }

                window.onSpotifyIframeApiReady = (api) => {
                        window.__spotifyIframeApi = api;
                        init(api);
                };
                if (
                        !document.querySelector(
                                `script[src="${IFRAME_API_SRC}"]`,
                        )
                ) {
                        const s = document.createElement("script");
                        s.src = IFRAME_API_SRC;
                        s.async = true;
                        document.body.appendChild(s);
                }
        }, [hasTracks, tracks, playlistUri, loadWaveform, goTo]);

        const onToggle = useCallback(() => {
                const c = controllerRef.current;
                if (!c) return;
                if (isPaused) c.resume();
                else c.pause();
        }, [isPaused]);
        const onNext = useCallback(
                () => goTo(posRef.current + 1, true),
                [goTo],
        );
        const onPrev = useCallback(
                () => goTo(posRef.current - 1, true),
                [goTo],
        );
        const onShuffle = useCallback(() => {
                if (!hasTracks) return;
                const next = !shuffle;
                setShuffle(next);
                const curIdx = orderRef.current[posRef.current] ?? 0;
                orderRef.current = next
                        ? makeOrder(tracks.length, curIdx)
                        : Array.from({ length: tracks.length }, (_, i) => i);
                posRef.current = next ? 0 : curIdx;
        }, [shuffle, hasTracks, tracks.length]);

        const trackUrl = current
                ? `https://open.spotify.com/track/${current.id}`
                : playlistUrl;

        const panel = (variant: "docked" | "floating") => {
                const docked = variant === "docked";
                const art = current?.image;
                return (
                        <div
                                className={
                                        docked
                                                ? "w-full"
                                                : "w-72 max-w-[calc(100vw-2rem)]"
                                }
                        >
                                <div className="rounded-xl border border-border bg-background/90 p-3 shadow-lg backdrop-blur-md">
                                        <div className="flex items-center gap-3">
                                                {art ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                                src={art}
                                                                alt=""
                                                                className="h-10 w-10 shrink-0 rounded"
                                                        />
                                                ) : (
                                                        <div className="h-10 w-10 shrink-0 rounded bg-secondary" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                        <p className="truncate font-sans text-sm font-medium text-foreground">
                                                                {current?.name ??
                                                                        "Vibes"}
                                                        </p>
                                                        <p className="truncate font-mono text-xs text-muted-foreground">
                                                                {current?.artists ??
                                                                        "Spotify"}
                                                        </p>
                                                </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
                                                <button
                                                        type="button"
                                                        onClick={onPrev}
                                                        disabled={!hasTracks}
                                                        aria-label="Previous"
                                                        className={CTRL}
                                                >
                                                        {IconPrev}
                                                </button>
                                                <button
                                                        type="button"
                                                        onClick={onToggle}
                                                        aria-label={
                                                                isPaused
                                                                        ? "Play"
                                                                        : "Pause"
                                                        }
                                                        className={PRIMARY}
                                                >
                                                        {isPaused
                                                                ? IconPlay
                                                                : IconPause}
                                                </button>
                                                <button
                                                        type="button"
                                                        onClick={onNext}
                                                        disabled={!hasTracks}
                                                        aria-label="Next"
                                                        className={CTRL}
                                                >
                                                        {IconNext}
                                                </button>
                                                <button
                                                        type="button"
                                                        onClick={onShuffle}
                                                        disabled={!hasTracks}
                                                        aria-label="Shuffle"
                                                        aria-pressed={shuffle}
                                                        className={
                                                                shuffle
                                                                        ? CTRL_ACTIVE
                                                                        : CTRL
                                                        }
                                                >
                                                        {IconShuffle}
                                                </button>
                                                <a
                                                        href={trackUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-auto font-mono text-[10px] tracking-wide text-muted-foreground transition-colors hover:text-accent"
                                                >
                                                        Powered by Spotify
                                                </a>
                                        </div>
                                </div>
                        </div>
                );
        };

        return (
                <>
                        {/* full-page ambient visualizer (reacts to playback) */}
                        <div
                                aria-hidden
                                className="pointer-events-none fixed inset-0 -z-10 opacity-50"
                        >
                                <PixelWaves
                                        playbackRef={playbackRef}
                                        waveformRef={waveformRef}
                                        columns={80}
                                        rows={36}
                                />
                        </div>

                        {/* audio engine: hidden, never moves (so it never reloads) */}
                        <div
                                aria-hidden
                                className="pointer-events-none fixed bottom-0 right-0 -z-10 h-20 w-[320px] opacity-[0.001]"
                        >
                                <div ref={embedHostRef} />
                        </div>

                        {!isAbout && (
                                <div className="fixed right-4 top-4 z-50">
                                        {panel("floating")}
                                </div>
                        )}
                        {isAbout && slot && createPortal(panel("docked"), slot)}
                </>
        );
}
