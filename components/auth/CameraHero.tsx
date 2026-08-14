"use client";

import { useEffect, useRef } from "react";

// 240 frames (30fps, 8s) of a rotating camera, encoded down to a couple MB of
// video rather than shipped as raw frames — see public/camera-hero/.
export function CameraHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Respect the OS-level motion preference: freeze on the first frame
    // instead of looping.
    videoRef.current?.pause();
  }, []);

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-card border border-border bg-[#e4e4e6]">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/camera-hero/camera-loop.webm" type="video/webm" />
        <source src="/camera-hero/camera-loop.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      <div className="pointer-events-none absolute bottom-5 left-5 right-5">
        <p className="text-lg font-extrabold text-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          Every rep, every commit, every frame counts.
        </p>
      </div>
    </div>
  );
}
