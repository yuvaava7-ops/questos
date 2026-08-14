"use client";

import { useEffect, useRef } from "react";

// All-intra encoded (every frame is a keyframe, see public/camera-hero/) so
// currentTime seeks are instant enough to drive frame-by-frame from scroll
// position, Apple-product-page style, instead of just looping playback.
export function ScrollScrubHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setFrame(progress: number) {
      if (!video || !video.duration) return;
      const time = progress * video.duration;
      if (Number.isFinite(time)) video.currentTime = time;
    }

    function onScroll() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      setFrame(progress);
    }

    let ticking = false;
    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    }

    function handleLoaded() {
      // Safari/iOS can leave a seeked frame undrawn until playback has
      // started at least once — prime the decoder, then hand control to scroll.
      video?.play()
        .then(() => video?.pause())
        .catch(() => {})
        .finally(() => (reducedMotion ? setFrame(0.5) : onScroll()));
    }

    video.addEventListener("loadedmetadata", handleLoaded);
    if (!reducedMotion) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline preload="auto">
          <source src="/camera-hero/camera-scrub.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/30" />
        <p className="pointer-events-none absolute bottom-10 text-[12.5px] font-medium text-text-faint">
          Scroll to see it in motion
        </p>
      </div>
    </div>
  );
}
