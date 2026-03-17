import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  FaExpand,
  FaPause,
  FaPlay,
  FaRedo,
  FaCheck,
  FaVolumeMute,
  FaVolumeUp,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { QuestionOnVideo } from "../../interfaces";

export type VideoConfig = {
  preventFastForward: boolean;
  questions: QuestionOnVideo[];
};

type Props = {
  src: string;
  config?: VideoConfig;
  cannotSummit?: boolean;
  onSubmit?: (score: number, total: number) => void;
};

export type StudentVideoPlayerRef = {
  togglePlay: () => void;
};

const StudentVideoPlayer = forwardRef<StudentVideoPlayerRef, Props>(
  ({ src, config, onSubmit, cannotSummit }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [maxTimeWatched, setMaxTimeWatched] = useState(0);
    const maxTimeWatchedRef = useRef(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
    const [currentQuestion, setCurrentQuestion] =
      useState<QuestionOnVideo | null>(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Feedback State
    const [feedbackStatus, setFeedbackStatus] = useState<
      "correct" | "incorrect" | null
    >(null);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<
      number | null
    >(null);

    // Colorful theme
    const colors = {
      primary: "bg-blue-400",
      secondary: "bg-yellow-300",
      accent: "bg-green-400",
      text: "text-gray-800",
    };

    useImperativeHandle(ref, () => ({
      togglePlay,
    }));

    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange,
        );
      };
    }, []);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        const now = video.currentTime;

        if (config?.preventFastForward) {
          if (now > maxTimeWatchedRef.current + 1) {
            video.currentTime = maxTimeWatchedRef.current;
            return;
          }
        }

        setCurrentTime(now);
        if (now > maxTimeWatchedRef.current) {
          maxTimeWatchedRef.current = now;
          setMaxTimeWatched(now);
        }

        // Check for questions
        if (config?.questions) {
          const question = config.questions.find(
            (q) =>
              Math.abs(q.timestamp - now) < 1 &&
              !answeredQuestions.includes(q.id) &&
              now > q.timestamp, // ensure we passed it slightly
          );

          if (question) {
            video.pause();
            setIsPlaying(false);
            setCurrentQuestion(question);
            // Optional: Exit fullscreen when question appears?
            // User didn't ask for this, but popup might be better in fullscreen now that we moved it.
          }
        }
      };

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        if (config?.questions && config.questions.length > 0) {
          setShowSummary(true);
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("ended", handleEnded);
      };
    }, [config, answeredQuestions]);

    const togglePlay = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
          // Force fullscreen on play
          if (!document.fullscreenElement && containerRef.current) {
            containerRef.current
              .requestFullscreen()
              .catch((err) => console.error("Fullscreen error:", err));
          }
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = Number(e.target.value);
      if (config?.preventFastForward && time > maxTimeWatchedRef.current) {
        // Prevent seeking forward
        return;
      }
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = Number(e.target.value);
      setVolume(vol);
      if (videoRef.current) {
        videoRef.current.volume = vol;
        setIsMuted(vol === 0);
      }
    };

    const toggleMute = () => {
      if (videoRef.current) {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        videoRef.current.muted = newMuted;
      }
    };

    const handleFullScreen = () => {
      if (containerRef.current) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          containerRef.current.requestFullscreen();
        }
      }
    };

    const handleAnswerQuestion = (optionIndex: number) => {
      if (!currentQuestion) return;
      setSelectedOptionIndex(optionIndex);

      const isCorrect = currentQuestion.correctOptions.some(
        (a) => a === optionIndex,
      );

      if (isCorrect) {
        setFeedbackStatus("correct");
        setCorrectAnswers((prev) => prev + 1);
      } else {
        setFeedbackStatus("incorrect");
      }

      setTimeout(() => {
        setAnsweredQuestions((prev) => [...prev, currentQuestion.id]);
        setCurrentQuestion(null);
        setFeedbackStatus(null);
        setSelectedOptionIndex(null);
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }, 3000);
    };

    const handleRetry = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        if (!document.fullscreenElement && containerRef.current) {
          containerRef.current
            .requestFullscreen()
            .catch((err) => console.error(err));
        }
      }
      setCurrentTime(0);
      setAnsweredQuestions([]);
      setCorrectAnswers(0);
      setShowSummary(false);
      setIsPlaying(true);
      setMaxTimeWatched(0);
      maxTimeWatchedRef.current = 0;
    };

    const handleSubmit = () => {
      if (onSubmit) {
        onSubmit(correctAnswers, config?.questions.length || 0);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        setCurrentTime(0);
        setAnsweredQuestions([]);
        setCorrectAnswers(0);
        setShowSummary(false);
        setIsPlaying(true);
        setMaxTimeWatched(0);
        maxTimeWatchedRef.current = 0;
        document.exitFullscreen();
      }
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
      <div className="relative h-max w-full max-w-5xl overflow-hidden rounded-3xl bg-white xl:h-full">
        {/* External Header (Visible when not in fullscreen) */}
        {!isFullscreen && (
          <div
            className={`flex items-center justify-between px-6 py-4 ${colors.primary}`}
          >
            <h2 className="text-xl font-bold text-white">Video Player</h2>
            {config?.questions && config.questions.length > 0 && (
              <div className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                {correctAnswers} / {config.questions.length} Correct
              </div>
            )}
          </div>
        )}

        {/* Video Container (includes overlays for fullscreen support) */}
        <div
          ref={containerRef}
          className="group relative aspect-video w-full bg-black"
        >
          {/* Fullscreen Header Overlay */}
          {isFullscreen && (
            <div className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <h2 className="text-xl font-bold text-white">Video Player</h2>
              {config?.questions && config.questions.length > 0 && (
                <div className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                  {correctAnswers} / {config.questions.length} Correct
                </div>
              )}
            </div>
          )}

          {/* Summary Overlay */}
          {showSummary && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="animate-bounce-short flex max-h-[90%] w-full max-w-md scale-100 flex-col items-center justify-center overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl transition-all">
                <h2 className="mb-4 text-3xl font-bold text-gray-800">
                  Video Completed! 🎉
                </h2>
                <div className="mb-8 flex flex-col items-center gap-2">
                  <span className="text-gray-600">You scored</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-blue-500">
                      {correctAnswers}
                    </span>
                    <span className="text-2xl text-gray-400">
                      / {config?.questions.length || 0}
                    </span>
                  </div>
                  <span className="text-gray-600">questions correct</span>
                </div>

                <div className="flex w-full gap-4 text-sm">
                  <button
                    onClick={handleRetry}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-3 font-bold text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <FaRedo /> Retry
                  </button>
                  {!cannotSummit && (
                    <button
                      onClick={handleSubmit}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 font-bold text-white shadow-lg transition hover:bg-blue-600 hover:shadow-blue-200"
                    >
                      <FaCheck /> Submit Work
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Popup Question Overlay */}
          {currentQuestion && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="animate-bounce-short max-h-[90%] w-full max-w-md scale-100 transform overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl transition-all">
                <div className="mb-4 flex items-center justify-center">
                  <span className="text-3xl">🤔</span>
                </div>
                <h3 className="mb-6 text-center text-xl font-bold text-gray-800">
                  {currentQuestion.question}
                </h3>
                <div className="flex flex-col gap-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const isCorrect =
                      feedbackStatus &&
                      currentQuestion.correctOptions.includes(idx);
                    const isWrong =
                      feedbackStatus === "incorrect" &&
                      isSelected &&
                      !currentQuestion.correctOptions.includes(idx);

                    let btnClass =
                      "rounded-xl border-2 border-blue-100 bg-blue-50 px-4 py-3 text-left font-medium text-blue-900 transition-all";

                    if (feedbackStatus) {
                      // Disable hover effects when feedback is showing
                      if (isCorrect) {
                        btnClass =
                          "rounded-xl border-2 border-green-500 bg-green-100 px-4 py-3 text-left font-medium text-green-900 transition-all";
                      } else if (isWrong) {
                        btnClass =
                          "rounded-xl border-2 border-red-500 bg-red-100 px-4 py-3 text-left font-medium text-red-900 transition-all";
                      } else {
                        btnClass =
                          "rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-left font-medium text-gray-400 opacity-60";
                      }
                    } else {
                      btnClass +=
                        " hover:scale-105 hover:border-blue-300 hover:bg-blue-100 active:scale-95";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerQuestion(idx)}
                        disabled={feedbackStatus !== null}
                        className={`${btnClass} flex items-center justify-between`}
                      >
                        <span>{option}</span>
                        {isCorrect && <FaCheckCircle className="text-xl" />}
                        {isWrong && <FaTimesCircle className="text-xl" />}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Message */}
                {feedbackStatus === "incorrect" && (
                  <div className="mt-4 animate-pulse text-center font-medium text-red-500">
                    The answer you just submitted is not right.
                  </div>
                )}

                {/* Countdown Bar */}
                {feedbackStatus && (
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: "100%",
                        animation: "countdown 2s linear forwards",
                      }}
                    />
                    <style jsx>{`
                      @keyframes countdown {
                        from {
                          width: 100%;
                        }
                        to {
                          width: 0%;
                        }
                      }
                    `}</style>
                  </div>
                )}
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            src={src}
            className="h-full w-full object-contain"
            onClick={togglePlay}
          />

          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {/* Progress Bar Container */}
            <div className="relative mb-2 flex items-center">
              {/* Markers */}
              {duration > 0 &&
                config?.questions.map((q, i) => (
                  <div
                    key={i}
                    className="pointer-events-none absolute top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-white bg-yellow-400 shadow-sm"
                    style={{
                      left: `${(q.timestamp / duration) * 100}%`,
                    }}
                    title={`Question ${i + 1}`}
                  />
                ))}

              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/30 accent-blue-400"
                style={{
                  background: `linear-gradient(to right, #60a5fa ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="text-2xl transition hover:text-blue-300"
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>

                <div className="group/vol flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-xl transition hover:text-blue-300"
                  >
                    {isMuted || volume === 0 ? (
                      <FaVolumeMute />
                    ) : (
                      <FaVolumeUp />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-1 w-20 cursor-pointer rounded-lg accent-blue-400"
                  />
                </div>

                <span className="font-mono text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={handleFullScreen}
                className="text-xl transition hover:text-blue-300"
              >
                <FaExpand />
              </button>
            </div>
          </div>
        </div>

        {config?.preventFastForward && (
          <div className="bg-yellow-50 px-4 py-2 text-center text-xs font-medium text-yellow-800">
            ⚠️ Fast-forwarding is disabled for this video.
          </div>
        )}
      </div>
    );
  },
);

StudentVideoPlayer.displayName = "StudentVideoPlayer";

export default StudentVideoPlayer;
