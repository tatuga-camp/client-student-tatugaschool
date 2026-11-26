import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { LuPlay } from "react-icons/lu";

const PdfThumb = dynamic(() => import("./PdfThumb"), { ssr: false });

/**
 * A thumbnail is decoration: if drawing it throws (pdf.js on a browser it
 * does not support, a chunk that fails to load), the card keeps its icon
 * instead of the crash taking the whole assignment page down.
 */
class ThumbBoundary extends React.Component<
  { onError: () => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("[TeacherFileThumb] Preview failed:", error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type Props = {
  kind: "image" | "pdf" | "video";
  url: string;
  /** Shown while the preview loads, and for good when it cannot load. */
  fallback: React.ReactNode;
};

/** A preview of a teacher's file: the image, a PDF's page 1 or a video frame. */
export default function TeacherFileThumb({ kind, url, fallback }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [seen, setSeen] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const resize = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    resize.observe(el);
    // Nothing is fetched until the card is near the viewport.
    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          near.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    near.observe(el);
    return () => {
      resize.disconnect();
      near.disconnect();
    };
  }, []);

  const fail = () => setFailed(true);
  const show = seen && !failed;

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="relative h-[120px] overflow-hidden bg-[#EEF1F6]"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {fallback}
      </div>
      {show && kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          draggable={false}
          onError={fail}
          className="relative h-full w-full object-cover"
        />
      )}
      {show && kind === "pdf" && width > 0 && (
        <div className="relative">
          <ThumbBoundary onError={fail}>
            <PdfThumb url={url} width={width} onError={fail} />
          </ThumbBoundary>
        </div>
      )}
      {show && kind === "video" && (
        <>
          <video
            // The fragment makes browsers paint a frame, not a blank poster.
            src={url.includes("#") ? url : `${url}#t=0.1`}
            preload="metadata"
            muted
            playsInline
            tabIndex={-1}
            onError={fail}
            className="pointer-events-none relative h-full w-full bg-black object-cover"
          />
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-icon-color shadow">
            <LuPlay />
          </span>
        </>
      )}
    </div>
  );
}
