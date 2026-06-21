"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { PixelWaves, type Playback, type WaveformData } from "./pixel-waves";
import {
        beginAuth,
        disconnect,
        getValidToken,
        isConfigured,
        isConnected,
} from "@/lib/spotify/auth";

export type Track = {
        id: string;
        uri: string;
        name: string;
        artists: string;
        image: string | null;
        durationMs: number;
};

// --- Spotify embed (preview) iFrame API ---
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

// --- Spotify Web Playback SDK (full tracks, Premium) ---
type WebPlaybackTrack = {
        id: string;
        uri: string;
        name: string;
        artists: { name: string }[];
        album: { images: { url: string }[] };
};
type WebPlaybackState = {
        paused: boolean;
        position: number;
        duration: number;
        track_window: { current_track: WebPlaybackTrack };
};
type SpotifyPlayer = {
        connect: () => Promise<boolean>;
        disconnect: () => void;
        addListener: (event: string, cb: (payload: unknown) => void) => boolean;
        togglePlay: () => Promise<void>;
        nextTrack: () => Promise<void>;
        previousTrack: () => Promise<void>;
        seek: (ms: number) => Promise<void>;
        setVolume: (v: number) => Promise<void>;
        getCurrentState: () => Promise<WebPlaybackState | null>;
};
type SpotifyPlayerCtor = new (opts: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
}) => SpotifyPlayer;

declare global {
        interface Window {
                onSpotifyIframeApiReady?: (api: IframeApi) => void;
                __spotifyIframeApi?: IframeApi;
                onSpotifyWebPlaybackSDKReady?: () => void;
                Spotify?: { Player: SpotifyPlayerCtor };
        }
}

const IFRAME_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";
const SDK_SRC = "https://sdk.scdn.co/spotify-player.js";

type Mode = "loading" | "sdk" | "embed";

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
        "flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent-bright disabled:opacity-40";

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
        const [mode, setMode] = useState<Mode>("loading");
        const [isPaused, setIsPaused] = useState(true);
        const [shuffle, setShuffle] = useState(false);
        const [current, setCurrent] = useState<Track | null>(tracks[0] ?? null);
        const [sdkReady, setSdkReady] = useState(false);
        const [premiumError, setPremiumError] = useState(false);
        const [sdkErrorMsg, setSdkErrorMsg] = useState<string | null>(null);

        // embed (preview) engine
        const controllerRef = useRef<EmbedController | null>(null);
        const embedHostRef = useRef<HTMLDivElement | null>(null);
        const orderRef = useRef<number[]>(
                Array.from({ length: tracks.length }, (_, i) => i),
        );
        const posRef = useRef(0);
        const lastAdvanceRef = useRef(0);

        // SDK (full-track) engine
        const playerRef = useRef<SpotifyPlayer | null>(null);
        const deviceIdRef = useRef<string | null>(null);

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

        // decide mode after mount (reads localStorage; avoids hydration mismatch)
        useEffect(() => {
                const id = requestAnimationFrame(() => {
                        setMode(
                                isConfigured() && isConnected()
                                        ? "sdk"
                                        : "embed",
                        );
                });
                return () => cancelAnimationFrame(id);
        }, []);

        // resolve the docked slot after commit
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

        // ---- embed (preview) mode ----
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

        useEffect(() => {
                if (mode !== "embed") return;
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
        }, [mode, hasTracks, tracks, playlistUri, loadWaveform, goTo]);

        // ---- SDK (full-track) mode ----
        useEffect(() => {
                if (mode !== "sdk") return;
                let player: SpotifyPlayer | null = null;

                const setup = () => {
                        if (!window.Spotify) return;
                        player = new window.Spotify.Player({
                                name: "hbb.dev",
                                getOAuthToken: (cb) => {
                                        void getValidToken().then((t) => {
                                                if (t) cb(t);
                                        });
                                },
                                volume: 0.7,
                        });
                        playerRef.current = player;

                        player.addListener("ready", (payload) => {
                                const { device_id } = payload as {
                                        device_id: string;
                                };
                                console.log("[spotify sdk] ready, device", device_id);
                                deviceIdRef.current = device_id;
                                setSdkReady(true);
                        });
                        player.addListener("not_ready", () => {
                                deviceIdRef.current = null;
                                setSdkReady(false);
                        });
                        player.addListener(
                                "player_state_changed",
                                (payload) => {
                                        const state =
                                                payload as WebPlaybackState | null;
                                        if (!state) return;
                                        setIsPaused(state.paused);
                                        playbackRef.current.isPaused =
                                                state.paused;
                                        playbackRef.current.positionMs =
                                                state.position;
                                        playbackRef.current.durationMs =
                                                state.duration;
                                        playbackRef.current.fullDurationMs =
                                                state.duration;
                                        playbackRef.current.lastUpdate =
                                                performance.now();
                                        const tk =
                                                state.track_window
                                                        ?.current_track;
                                        if (tk) {
                                                playbackRef.current.trackSeed =
                                                        seedFromId(tk.id);
                                                setCurrent({
                                                        id: tk.id,
                                                        uri: tk.uri,
                                                        name: tk.name,
                                                        artists: tk.artists
                                                                .map(
                                                                        (a) =>
                                                                                a.name,
                                                                )
                                                                .join(", "),
                                                        image:
                                                                tk.album
                                                                        ?.images?.[0]
                                                                        ?.url ??
                                                                null,
                                                        durationMs: state.duration,
                                                });
                                                void loadWaveform(tk.id);
                                        }
                                },
                        );
                        const fail = (label: string) => (payload: unknown) => {
                                const message =
                                        (payload as { message?: string })?.message ??
                                        "unknown";
                                console.error(`[spotify sdk] ${label}:`, message, payload);
                                setSdkErrorMsg(`${label}: ${message}`);
                                if (label === "account_error") setPremiumError(true);
                                disconnect();
                        };
                        player.addListener("initialization_error", fail("initialization_error"));
                        player.addListener("authentication_error", fail("authentication_error"));
                        player.addListener("account_error", fail("account_error"));
                        player.addListener("playback_error", (e) =>
                                console.error("[spotify sdk] playback_error:", e),
                        );
                        void player.connect().then((ok) => {
                                console.log("[spotify sdk] connect() ->", ok);
                        });
                };

                if (window.Spotify) {
                        setup();
                } else {
                        window.onSpotifyWebPlaybackSDKReady = setup;
                        if (
                                !document.querySelector(
                                        `script[src="${SDK_SRC}"]`,
                                )
                        ) {
                                const s = document.createElement("script");
                                s.src = SDK_SRC;
                                s.async = true;
                                document.body.appendChild(s);
                        }
                }

                return () => {
                        player?.disconnect();
                };
        }, [mode, loadWaveform]);

        const sdkToggle = useCallback(async () => {
                const player = playerRef.current;
                if (!player) return;
                const state = await player.getCurrentState();
                if (!state) {
                        const token = await getValidToken();
                        const device = deviceIdRef.current;
                        if (!token || !device) return;
                        await fetch(
                                `https://api.spotify.com/v1/me/player/play?device_id=${device}`,
                                {
                                        method: "PUT",
                                        headers: {
                                                Authorization: `Bearer ${token}`,
                                                "Content-Type":
                                                        "application/json",
                                        },
                                        body: JSON.stringify({
                                                uris: tracks.map((t) => t.uri),
                                        }),
                                },
                        );
                } else {
                        await player.togglePlay();
                }
        }, [tracks]);

        const sdkShuffle = useCallback(async () => {
                const next = !shuffle;
                setShuffle(next);
                const token = await getValidToken();
                const device = deviceIdRef.current;
                if (!token || !device) return;
                await fetch(
                        `https://api.spotify.com/v1/me/player/shuffle?state=${next}&device_id=${device}`,
                        {
                                method: "PUT",
                                headers: { Authorization: `Bearer ${token}` },
                        },
                );
        }, [shuffle]);

        // ---- unified controls ----
        const onToggle = useCallback(() => {
                if (mode === "sdk") {
                        void sdkToggle();
                        return;
                }
                const c = controllerRef.current;
                if (!c) return;
                if (isPaused) c.resume();
                else c.pause();
        }, [mode, isPaused, sdkToggle]);

        const onNext = useCallback(() => {
                if (mode === "sdk") {
                        void playerRef.current?.nextTrack();
                        return;
                }
                goTo(posRef.current + 1, true);
        }, [mode, goTo]);

        const onPrev = useCallback(() => {
                if (mode === "sdk") {
                        void playerRef.current?.previousTrack();
                        return;
                }
                goTo(posRef.current - 1, true);
        }, [mode, goTo]);

        const onShuffle = useCallback(() => {
                if (mode === "sdk") {
                        void sdkShuffle();
                        return;
                }
                if (!hasTracks) return;
                const next = !shuffle;
                setShuffle(next);
                const curIdx = orderRef.current[posRef.current] ?? 0;
                orderRef.current = next
                        ? makeOrder(tracks.length, curIdx)
                        : Array.from({ length: tracks.length }, (_, i) => i);
                posRef.current = next ? 0 : curIdx;
        }, [mode, sdkShuffle, shuffle, hasTracks, tracks.length]);

        const onConnect = useCallback(() => {
                void beginAuth();
        }, []);
        const onDisconnect = useCallback(() => {
                disconnect();
                playerRef.current?.disconnect();
                window.location.reload();
        }, []);

        const controlsDisabled = mode === "sdk" ? !sdkReady : !hasTracks;
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
                                                        disabled={
                                                                controlsDisabled
                                                        }
                                                        aria-label="Previous"
                                                        className={CTRL}
                                                >
                                                        {IconPrev}
                                                </button>
                                                <button
                                                        type="button"
                                                        onClick={onToggle}
                                                        disabled={
                                                                controlsDisabled
                                                        }
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
                                                        disabled={
                                                                controlsDisabled
                                                        }
                                                        aria-label="Next"
                                                        className={CTRL}
                                                >
                                                        {IconNext}
                                                </button>
                                                <button
                                                        type="button"
                                                        onClick={onShuffle}
                                                        disabled={
                                                                controlsDisabled
                                                        }
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

                                        {isConfigured() &&
                                                mode !== "loading" && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                                {mode ===
                                                                "sdk" ? (
                                                                        <button
                                                                                type="button"
                                                                                onClick={
                                                                                        onDisconnect
                                                                                }
                                                                                className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-accent"
                                                                        >
                                                                                {sdkReady
                                                                                        ? "Disconnect Spotify"
                                                                                        : "Connecting Spotify…"}
                                                                        </button>
                                                                ) : (
                                                                        <button
                                                                                type="button"
                                                                                onClick={
                                                                                        onConnect
                                                                                }
                                                                                className="font-mono text-[10px] text-accent transition-colors hover:text-accent-bright"
                                                                        >
                                                                                Connect
                                                                                Spotify
                                                                                for
                                                                                full
                                                                                songs
                                                                                →
                                                                        </button>
                                                                )}
                                                                {sdkErrorMsg && (
                                                                        <span className="font-mono text-[10px] text-destructive">
                                                                                {premiumError
                                                                                        ? "Premium required"
                                                                                        : sdkErrorMsg}
                                                                        </span>
                                                                )}
                                                        </div>
                                                )}
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
                                        columns={96}
                                        rows={44}
                                />
                        </div>

                        {/* embed audio engine (preview mode): hidden, never moves */}
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
