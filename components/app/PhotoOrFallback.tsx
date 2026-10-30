import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { defaultBlurHash } from "../../data";
import { decodeBlurhashToCanvas } from "../../utils";

type Props = {
  src: string | null | undefined;
  blurHash?: string | null;
  sizes: string;
  className?: string;
  /** Shown when there is no photo, or it will not load. */
  fallback: React.ReactNode;
};

/** A photo that fills its parent, blurred in while it loads. */
export function PhotoOrFallback({
  src,
  blurHash,
  sizes,
  className = "object-cover",
  fallback,
}: Props) {
  // Remember which photo failed, so a new src gets a fresh try.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  // The blur is drawn on a canvas, which the server doesn't have: made after
  // mount, so the server's markup and the first client render agree. It is
  // only for a photo still loading: one that is already there (cached, or
  // loaded before hydration) gets none, and the blur goes once it loads.
  const imgRef = useRef<HTMLImageElement>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [blur, setBlur] = useState<string | null>(null);
  useEffect(() => {
    if (!src || imgRef.current?.complete) return;
    setBlur(decodeBlurhashToCanvas(blurHash || defaultBlurHash));
  }, [src, blurHash]);
  if (!src || failedSrc === src) return <>{fallback}</>;
  const showBlur = blur !== null && loadedSrc !== src;
  return (
    <Image
      ref={imgRef}
      src={src}
      alt=""
      fill
      sizes={sizes}
      placeholder={showBlur ? "blur" : "empty"}
      blurDataURL={showBlur ? blur : undefined}
      className={className}
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailedSrc(src)}
    />
  );
}
