import React, { useEffect, useRef, useState } from "react";
import {
  LuArrowLeft,
  LuMaximize,
  LuPause,
  LuPlay,
  LuAlertTriangle,
  LuVolume2,
  LuVolumeX,
} from "react-icons/lu";
import { assignmentPageLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import {
  canFullscreenElements,
  enterFullscreen,
  enterNativeVideoFullscreen,
  exitFullscreen,
  getFullscreenElement,
} from "../../utils/fullscreen";
import { canSeekTo } from "../../utils/videoQuiz";

type Props = {
  src: string;
  name: string;
  lang: Language;
  preventFastForward: boolean;
  onClose: () => void;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const controlBtn =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full text-2xl text-white active:bg-white/20";

/**
 * A teacher's video file, filling its (sheet) container: a back/close button
 * in the header, the video, then always-visible controls. When fast-forward
 * is prevented the student can't seek past what they have watched.
 */
function FileAssignmentVideoPlayer({
  src,
  name,
  lang,
  preventFastForward,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const maxWatchedRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const now = video.currentTime;
      if (preventFastForward && now > maxWatchedRef.current + 1) {
        video.currentTime = maxWatchedRef.current;
        return;
      }
      setCurrentTime(now);
      if (now > maxWatchedRef.current) maxWatchedRef.current = now;
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    // Keep the play button in sync when playback is controlled elsewhere,
    // e.g. iOS's native fullscreen player.
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handlePause);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handlePause);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [preventFastForward]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    if (
      !canSeekTo({
        target,
        maxWatched: maxWatchedRef.current,
        preventFastForward,
        reviewed: false,
      })
    )
      return;
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    setIsMuted(next);
    videoRef.current.muted = next;
  };

  const handleFullScreen = () => {
    if (getFullscreenElement()) {
      exitFullscreen();
    } else if (canFullscreenElements()) {
      if (containerRef.current) enterFullscreen(containerRef.current);
    } else if (videoRef.current) {
      // iPhone: no element fullscreen, so use iOS's own video player.
      enterNativeVideoFullscreen(videoRef.current);
    }
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black font-Anuphan text-white"
      style={{
        paddingTop: "var(--safe-top)",
        paddingBottom: "var(--safe-bottom)",
      }}
    >
      <div className="flex shrink-0 items-center gap-2 px-2 py-2">
        <button
          type="button"
          onClick={onClose}
          aria-label={assignmentPageLanguage.closeViewer(lang)}
          className={controlBtn}
        >
          <LuArrowLeft aria-hidden />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-sm font-bold">{name}</h2>
      </div>

      <div
        ref={containerRef}
        className="flex min-h-0 flex-1 flex-col justify-center bg-black"
      >
        <video
          ref={videoRef}
          src={src}
          playsInline
          className="max-h-full w-full object-contain"
          onClick={togglePlay}
        />
      </div>

      <div className="shrink-0 px-3 pb-2 pt-1">
        {preventFastForward && (
          <p className="mb-1 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-[#FFCD1B]">
            <LuAlertTriangle aria-hidden />
            {assignmentPageLanguage.fastForwardOff(lang)}
          </p>
        )}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step="any"
          value={currentTime}
          onChange={handleSeek}
          aria-label={assignmentPageLanguage.seek(lang)}
          className="block h-6 w-full cursor-pointer appearance-none rounded-full accent-[#569DF8]"
          style={{
            background: `linear-gradient(to right, #569DF8 ${percent}%, rgba(255,255,255,.3) ${percent}%) center / 100% 6px no-repeat`,
          }}
        />
        <div className="mt-1 flex items-center gap-1">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              isPlaying
                ? assignmentPageLanguage.pause(lang)
                : assignmentPageLanguage.play(lang)
            }
            className={controlBtn}
          >
            {isPlaying ? <LuPause aria-hidden /> : <LuPlay aria-hidden />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={
              isMuted
                ? assignmentPageLanguage.unmute(lang)
                : assignmentPageLanguage.mute(lang)
            }
            className={controlBtn}
          >
            {isMuted ? <LuVolumeX aria-hidden /> : <LuVolume2 aria-hidden />}
          </button>
          <span className="flex-1 text-center font-mono text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            type="button"
            onClick={handleFullScreen}
            aria-label={assignmentPageLanguage.fullscreen(lang)}
            className={controlBtn}
          >
            <LuMaximize aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileAssignmentVideoPlayer;
