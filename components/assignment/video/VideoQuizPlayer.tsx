import React, { useEffect, useRef, useState } from "react";
import { LuLock } from "react-icons/lu";
import { assignmentPageLanguage } from "../../../data/languages";
import { QuestionOnVideo } from "../../../interfaces";
import { useGetLanguage } from "../../../react-query";
import {
  canFullscreenElements,
  enterFullscreen,
  exitFullscreen,
  getFullscreenElement,
} from "../../../utils/fullscreen";
import YouTubeEmbed from "../../common/YouTubeEmbed";
import { useIsFramed } from "../../app/useIsFramed";
import VideoControls from "./VideoControls";
import VideoEndScreen from "./VideoEndScreen";
import VideoQuestionSheet from "./VideoQuestionSheet";
import { useVideoQuiz } from "./useVideoQuiz";

type Props = {
  src: string;
  questions: QuestionOnVideo[];
  preventFastForward: boolean;
  reviewed: boolean;
  maxScore: number;
  onSubmit: (score: number) => void;
  /** Where "Next video" goes (reviewed quizzes), if there is a next one. */
  onNext?: () => void;
  onStateChange?: (s: { playing: boolean; questionOpen: boolean }) => void;
};

/**
 * The video quiz player. Fullscreen: outside the phone frame it uses the
 * browser's element fullscreen on the container (video, controls and the
 * question sheet together); inside the frame, or where the browser has no
 * element fullscreen (iPhone), the container expands over the phone screen.
 */
export default function VideoQuizPlayer({
  src,
  questions,
  preventFastForward,
  reviewed,
  maxScore,
  onSubmit,
  onNext,
  onStateChange,
}: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const t = assignmentPageLanguage;
  const framed = useIsFramed();
  const containerRef = useRef<HTMLDivElement>(null);
  // Expanded by CSS (inside the frame / no element fullscreen), or browser fullscreen.
  const [expanded, setExpanded] = useState(false);
  const [nativeFs, setNativeFs] = useState(false);
  const full = expanded || nativeFs;

  const quiz = useVideoQuiz({
    src,
    questions,
    preventFastForward,
    reviewed,
    maxScore,
    onSubmit,
    onStateChange,
  });

  useEffect(() => {
    const sync = () =>
      setNativeFs(
        getFullscreenElement() === containerRef.current &&
          !!containerRef.current,
      );
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  // Esc collapses the expanded player (but never skips an open question).
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && quiz.question === null) setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded, quiz.question]);

  const toggleExpand = () => {
    if (expanded) setExpanded(false);
    else if (getFullscreenElement()) exitFullscreen();
    else if (framed || !canFullscreenElements()) setExpanded(true);
    else if (containerRef.current) enterFullscreen(containerRef.current);
  };

  const ytWaiting = quiz.youTubeId !== null && !quiz.ytStarted;
  const questionIndex = quiz.question
    ? questions.findIndex((q) => q.id === quiz.question?.id)
    : -1;
  const locked = preventFastForward && !reviewed;
  const sideInset = {
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        data-no-swipe
        className={`relative flex flex-col overflow-hidden bg-black ${
          expanded
            ? "fixed inset-0 z-50"
            : nativeFs
              ? "h-full w-full"
              : "rounded-[20px]"
        }`}
        style={
          expanded
            ? {
                paddingTop: "var(--safe-top)",
                paddingBottom: "var(--safe-bottom)",
                ...sideInset,
              }
            : nativeFs
              ? sideInset
              : undefined
        }
      >
        <div
          className={`relative bg-black ${full ? "min-h-0 flex-1" : "aspect-video w-full"}`}
        >
          {quiz.youTubeId ? (
            <>
              <YouTubeEmbed
                ref={quiz.ytRef}
                videoId={quiz.youTubeId}
                controls={false}
                className="h-full w-full"
                onReady={(d) => quiz.setDuration(d)}
                onTime={(time, d) => {
                  if (d > 0) quiz.setDuration(d);
                  if (quiz.ytPlayingRef.current) quiz.tick(time);
                }}
                onStateChange={(state) => {
                  quiz.ytPlayingRef.current = state === quiz.ytState.PLAYING;
                  if (state === quiz.ytState.PLAYING) {
                    quiz.setYtStarted(true);
                    quiz.setPlaying(true);
                  } else if (state === quiz.ytState.PAUSED) {
                    quiz.setPlaying(false);
                  } else if (state === quiz.ytState.ENDED) {
                    quiz.ended();
                  }
                }}
              />
              {quiz.ytStarted && (
                <div
                  className="absolute inset-0"
                  onClick={quiz.togglePlay}
                  aria-hidden
                />
              )}
            </>
          ) : (
            <video
              ref={quiz.videoRef}
              src={src}
              playsInline
              className="h-full w-full object-contain"
              onClick={quiz.togglePlay}
            />
          )}
          {locked && !ytWaiting && (
            <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
              <LuLock aria-hidden />
              {t.noSkipping(lang)}
            </span>
          )}
        </div>

        {!ytWaiting && (
          <VideoControls
            lang={lang}
            playing={quiz.playing}
            muted={quiz.muted}
            volume={quiz.volume}
            currentTime={quiz.currentTime}
            duration={quiz.duration}
            markers={questions.map((q) => q.timestamp)}
            expanded={full}
            onTogglePlay={quiz.togglePlay}
            onToggleMute={quiz.toggleMute}
            onVolume={quiz.changeVolume}
            onSeek={quiz.seekTo}
            onToggleExpand={toggleExpand}
          />
        )}

        {quiz.question && (
          <VideoQuestionSheet
            lang={lang}
            question={quiz.question}
            index={questionIndex}
            total={questions.length}
            feedback={quiz.feedback}
            selected={quiz.selected}
            onAnswer={quiz.answer}
          />
        )}
        {quiz.showEnd && (
          <VideoEndScreen
            lang={lang}
            correct={quiz.correct}
            total={questions.length}
            reviewed={reviewed}
            onNext={onNext}
            onRetry={quiz.retry}
            onSubmit={quiz.submit}
          />
        )}
      </div>

      {reviewed && (
        <p className="rounded-xl bg-[#FFF6D6] px-3 py-2 text-center text-xs font-bold text-[#8A5E00]">
          {t.reviewedVideoNotice(lang)}
        </p>
      )}
    </div>
  );
}
