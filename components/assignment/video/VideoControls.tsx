import React from "react";
import {
  LuMaximize,
  LuMinimize,
  LuPause,
  LuPlay,
  LuVolume2,
  LuVolumeX,
} from "react-icons/lu";
import { assignmentPageLanguage } from "../../../data/languages";
import { Language } from "../../../interfaces";

type Props = {
  lang: Language;
  playing: boolean;
  muted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  /** Question times in seconds, drawn as yellow markers on the seek bar. */
  markers: number[];
  expanded: boolean;
  /** A question is open: no play or seek until it is answered. */
  disabled?: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolume: (v: number) => void;
  onSeek: (t: number) => void;
  onToggleExpand: () => void;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const btn =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full text-2xl text-white active:bg-white/20";

/** Always-visible controls under the video (touch has no hover). */
export default function VideoControls({
  lang,
  playing,
  muted,
  volume,
  currentTime,
  duration,
  markers,
  expanded,
  disabled = false,
  onTogglePlay,
  onToggleMute,
  onVolume,
  onSeek,
  onToggleExpand,
}: Props) {
  const t = assignmentPageLanguage;
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
  return (
    <div className="px-3 pb-2 pt-1 text-white">
      <div className="relative flex h-11 items-center">
        {duration > 0 &&
          markers.map((time, i) => (
            <span
              key={i}
              title={t.questionMarker(lang, i + 1)}
              className="pointer-events-none absolute top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#FFCD1B] shadow-sm"
              style={{ left: `${(time / duration) * 100}%` }}
            />
          ))}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step="any"
          value={currentTime}
          disabled={disabled}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label={t.seek(lang)}
          className="block h-11 w-full cursor-pointer appearance-none rounded-full accent-[#569DF8]"
          style={{
            background: `linear-gradient(to right, #569DF8 ${percent}%, rgba(255,255,255,.3) ${percent}%) center / 100% 6px no-repeat`,
          }}
        />
      </div>
      <div className="mt-1 flex items-center gap-1">
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={disabled}
          aria-label={playing ? t.pause(lang) : t.play(lang)}
          className={btn}
        >
          {playing ? <LuPause aria-hidden /> : <LuPlay aria-hidden />}
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? t.unmute(lang) : t.mute(lang)}
          className={btn}
        >
          {muted || volume === 0 ? (
            <LuVolumeX aria-hidden />
          ) : (
            <LuVolume2 aria-hidden />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={muted ? 0 : volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          aria-label={t.volume(lang)}
          className="hidden h-1 w-16 cursor-pointer rounded-lg accent-[#569DF8] min-[420px]:block"
        />
        <span className="flex-1 text-center font-mono text-xs font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={expanded ? t.exitFullscreen(lang) : t.fullscreen(lang)}
          className={btn}
        >
          {expanded ? <LuMinimize aria-hidden /> : <LuMaximize aria-hidden />}
        </button>
      </div>
    </div>
  );
}
