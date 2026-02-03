import React, { useEffect, useRef, useState } from "react";
import {
  FaPlay,
  FaPause,
  FaExpand,
  FaVolumeUp,
  FaVolumeMute,
  FaArrowLeft,
} from "react-icons/fa";
import { MdReplay10, MdForward10 } from "react-icons/md";
import Swal from "sweetalert2";

export type VideoQuestion = {
  id: string;
  timestamp: number;
  question: string;
  options: string[];
  correctOption: number;
};

export type VideoConfig = {
  preventFastForward: boolean;
  questions: VideoQuestion[];
};

type Props = {
  src: string;
  config?: VideoConfig;
  onClose: () => void;
};

const StudentVideoPlayer = ({ src, config, onClose }: Props) => {
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
  const [currentQuestion, setCurrentQuestion] = useState<VideoQuestion | null>(
    null,
  );

  // Colorful theme
  const colors = {
    primary: "bg-blue-400",
    secondary: "bg-yellow-300",
    accent: "bg-green-400",
    text: "text-gray-800",
  };

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
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
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

    if (optionIndex === currentQuestion.correctOption) {
      Swal.fire({
        title: "Correct!",
        text: "Great job! Continuing video...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        setAnsweredQuestions((prev) => [...prev, currentQuestion.id]);
        setCurrentQuestion(null);
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      });
    } else {
      Swal.fire({
        title: "Incorrect",
        text: "Try again!",
        icon: "error",
        confirmButtonColor: "#f87171",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 ${colors.primary}`}
        >
          <h2 className="text-xl font-bold text-white">Video Player</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40"
          >
            <FaArrowLeft />
          </button>
        </div>

        {/* Video Container */}
        <div
          ref={containerRef}
          className="group relative aspect-video w-full bg-black"
        >
          <video
            ref={videoRef}
            src={src}
            className="h-full w-full object-contain"
            onClick={togglePlay}
          />

          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {/* Progress Bar */}
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

          {/* Popup Question Overlay */}
          {currentQuestion && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
              <div className="animate-bounce-short w-full max-w-md scale-100 transform rounded-3xl bg-white p-6 shadow-2xl transition-all">
                <div className="mb-4 flex items-center justify-center">
                  <span className="text-3xl">🤔</span>
                </div>
                <h3 className="mb-6 text-center text-xl font-bold text-gray-800">
                  {currentQuestion.question}
                </h3>
                <div className="flex flex-col gap-3">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerQuestion(idx)}
                      className={`rounded-xl border-2 border-blue-100 bg-blue-50 px-4 py-3 text-left font-medium text-blue-900 transition-all hover:scale-105 hover:border-blue-300 hover:bg-blue-100 active:scale-95`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {config?.preventFastForward && (
          <div className="bg-yellow-50 px-4 py-2 text-center text-xs font-medium text-yellow-800">
            ⚠️ Fast-forwarding is disabled for this video.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentVideoPlayer;
