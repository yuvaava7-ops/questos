"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export function AnimatedHeadline({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const words = ref.current.querySelectorAll<HTMLElement>("[data-word]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => (w.style.opacity = "1"));
      return;
    }

    animate(words, {
      opacity: [0, 1],
      translateY: [16, 0],
      delay: stagger(60),
      duration: 700,
      ease: "outCubic",
    });
  }, []);

  const parts = text.split(" ");

  return (
    <h1 ref={ref} className={className}>
      {parts.map((word, i) => (
        <span key={i} data-word className="inline-block opacity-0">
          {word}
          {i < parts.length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  );
}
