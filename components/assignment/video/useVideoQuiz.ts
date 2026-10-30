import { useEffect, useMemo, useRef, useState } from "react";
import { QuestionOnVideo } from "../../../interfaces";
import { parseYouTubeId, YT_STATE } from "../../../utils/youtube";
import {
  canSeekTo,
  dueQuestion,
  shouldRewind,
  videoQuizScore,
} from "../../../utils/videoQuiz";
import type { YouTubeEmbedHandle } from "../../common/YouTubeEmbed";

/** How long the correct/incorrect feedback shows before the video resumes. */
export const FEEDBACK_MS = 3000;

type Options = {
  src: string;
  questions: QuestionOnVideo[];
  preventFastForward: boolean;
  reviewed: boolean;
  maxScore: number;
  /** Resolves true once the server has the score. */
  onSubmit: (score: number) => Promise<boolean>;
};

/**
 * The state of a video quiz: playback (an uploaded file or a YouTube video
 * behind one surface), the locked seek bar, the question that pauses the
 * video, its feedback, and the end screen.
 */
export function useVideoQuiz({
  src,
  questions,
  preventFastForward,
  reviewed,
  maxScore,
  onSubmit,
}: Options) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytRef = useRef<YouTubeEmbedHandle>(null);
  const youTubeId = useMemo(() => parseYouTubeId(src), [src]);
  // YouTube's own play button takes the first tap (mobile browsers may refuse
  // a play() from outside the iframe); after that Tatuga's controls sit on top.
  const [ytStarted, setYtStarted] = useState(false);
  const ytPlayingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const maxWatchedRef = useRef(0);
  const [answered, setAnswered] = useState<string[]>([]);
  const [question, setQuestion] = useState<QuestionOnVideo | null>(null);
  const [correct, setCorrect] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [selected, setSelected] = useState<number | null>(null);
  // Answered since the start (or a retry or a submit); the question on screen
  // counts as soon as it is answered.
  const answeredCount = answered.length + (feedback ? 1 : 0);
  const resumeTimer = useRef<number | undefined>(undefined);

  // One surface over the uploaded <video> and the YouTube player.
  const media = {
    play: () => {
      if (youTubeId) ytRef.current?.play();
      else void videoRef.current?.play();
    },
    pause: () => {
      if (youTubeId) ytRef.current?.pause();
      else videoRef.current?.pause();
    },
    seek: (seconds: number) => {
      if (youTubeId) ytRef.current?.seek(seconds);
      else if (videoRef.current) videoRef.current.currentTime = seconds;
    },
    setVolume: (v: number) => {
      if (youTubeId) ytRef.current?.setVolume(v);
      else if (videoRef.current) videoRef.current.volume = v;
    },
    setMuted: (m: boolean) => {
      if (youTubeId) ytRef.current?.setMuted(m);
      else if (videoRef.current) videoRef.current.muted = m;
    },
  };

  const tick = (now: number) => {
    // Seeking by any route (native controls, keyboard, a lock-screen scrub)
    // past what was watched is put back while the lock is on.
    if (
      shouldRewind({
        now,
        maxWatched: maxWatchedRef.current,
        preventFastForward,
        reviewed,
      })
    ) {
      media.seek(maxWatchedRef.current);
      return;
    }
    setCurrentTime(now);
    if (now > maxWatchedRef.current) maxWatchedRef.current = now;

    const due = dueQuestion(questions, now, answered);
    if (due) {
      media.pause();
      setPlaying(false);
      setQuestion(due);
    }
  };
  const tickRef = useRef(tick);
  tickRef.current = tick;

  const ended = () => {
    setPlaying(false);
    if (questions.length > 0) setShowEnd(true);
  };
  const endedRef = useRef(ended);
  endedRef.current = ended;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => tickRef.current(video.currentTime);
    const onMeta = () => setDuration(video.duration);
    const onEnded = () => endedRef.current();
    // Keep the play button honest when playback is controlled elsewhere
    // (the native fullscreen player on iOS, a lock-screen control).
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [youTubeId]);

  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  const togglePlay = () => {
    if (!videoRef.current && !youTubeId) return;
    if (playing) media.pause();
    else media.play();
    setPlaying(!playing);
  };

  /** The seek bar and keyboard: forward jumps are refused while locked. */
  const seekTo = (time: number) => {
    if (
      !canSeekTo({
        target: time,
        maxWatched: maxWatchedRef.current,
        preventFastForward,
        reviewed,
      })
    )
      return;
    media.seek(time);
    setCurrentTime(time);
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    media.setVolume(v);
    setMuted(v === 0);
  };
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    media.setMuted(next);
  };

  const answer = (optionIndex: number) => {
    if (!question || feedback) return;
    setSelected(optionIndex);
    const isCorrect = question.correctOptions.includes(optionIndex);
    setFeedback(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setCorrect((n) => n + 1);
    const done = question;
    resumeTimer.current = window.setTimeout(() => {
      setAnswered((prev) => [...prev, done.id]);
      setQuestion(null);
      setFeedback(null);
      setSelected(null);
      media.play();
      setPlaying(true);
    }, FEEDBACK_MS);
  };

  const reset = () => {
    media.seek(0);
    setCurrentTime(0);
    setAnswered([]);
    setCorrect(0);
    setShowEnd(false);
    maxWatchedRef.current = 0;
  };

  const retry = () => {
    if (submitting) return;
    setSubmitFailed(false);
    reset();
    media.play();
    setPlaying(true);
  };

  // The result is kept until the server confirms; a failure can be retried
  // with the same score (no re-watching).
  const [submitting, setSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitFailed(false);
    const ok = await onSubmit(
      videoQuizScore(maxScore, questions.length, correct),
    );
    setSubmitting(false);
    if (ok) reset();
    else setSubmitFailed(true);
  };

  return {
    videoRef,
    ytRef,
    youTubeId,
    ytStarted,
    setYtStarted,
    ytPlayingRef,
    playing,
    setPlaying,
    currentTime,
    duration,
    setDuration,
    volume,
    muted,
    question,
    feedback,
    selected,
    correct,
    answeredCount,
    showEnd,
    togglePlay,
    seekTo,
    changeVolume,
    toggleMute,
    answer,
    retry,
    submit,
    submitting,
    submitFailed,
    tick: (now: number) => tickRef.current(now),
    ended: () => endedRef.current(),
    ytState: YT_STATE,
  };
}
