import React, { useEffect, useRef, useState } from "react";
import { LuLock, LuMinimize } from "react-icons/lu";
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
  /** Resolves true once the server has the score. */
  onSubmit: (score: number) => Promise<boolean>;
  /** Where "Next video" goes (reviewed quizzes), if there is a next one. */
  onNext?: () => void;
  onStateChange?: (s: {
    playing: boolean;
    questionOpen: boolean;
    expanded: boolean;
  }) => void;
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

  // Tell the page when the video plays, a question is open, or it is expanded
  // (the Your-work peek must stay out of the way of all three).
  useEffect(() => {
    onStateChange?.({
      playing: quiz.playing,
      questionOpen: quiz.question !== null,
      expanded: full,
    });
  }, [quiz.playing, quiz.question, full, onStateChange]);

  // A question opens over the whole phone screen (video and seek bar stay
  // above the sheet); it collapses again afterwards unless the student
  // expanded the player themselves.
  const autoExpandedRef = useRef(false);
  const fullRef = useRef(full);
  fullRef.current = full;
  const questionOpen = quiz.question !== null;
  useEffect(() => {
    if (questionOpen && !fullRef.current) {
      autoExpandedRef.current = true;
      setExpanded(true);
    } else if (!questionOpen && autoExpandedRef.current) {
      autoExpandedRef.current = false;
      setExpanded(false);
    }
  }, [questionOpen]);

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
    // Whatever the student does with it, it is theirs from now on.
    autoExpandedRef.current = false;
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
        className={`flex flex-col overflow-hidden bg-black ${
          // relative and fixed cannot both be set: Tailwind emits relative
          // later, so it would win and the expand would never happen.
          expanded
            ? "fixed inset-0 z-50"
            : nativeFs
              ? "relative h-full w-full"
              : "relative rounded-[20px]"
        }`}
        style={
          expanded
            ? {
                paddingTop: "var(--safe-top)",
                paddingBottom: "var(--safe-bottom)",
                ...sideInset,
              }
            : nativeFs
              ? {
                  paddingTop: "env(safe-area-inset-top)",
                  paddingBottom: "env(safe-area-inset-bottom)",
                  ...sideInset,
                }
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

        {full && (quiz.question || quiz.showEnd) && (
          // Always reachable: above the question sheet and the end screen.
          <button
            type="button"
            onClick={toggleExpand}
            aria-label={t.exitFullscreen(lang)}
            style={{
              top: "max(8px, env(safe-area-inset-top))",
              right: "max(8px, env(safe-area-inset-right))",
            }}
            className="absolute z-40 grid h-11 w-11 place-items-center rounded-full bg-black/60 text-xl text-white active:bg-black/80"
          >
            <LuMinimize aria-hidden />
          </button>
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
            submitting={quiz.submitting}
            submitFailed={quiz.submitFailed}
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
