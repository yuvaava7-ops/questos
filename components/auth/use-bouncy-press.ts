"use client";

import { useRef } from "react";
import { animate } from "animejs";

// Small press micro-interaction shared by the auth submit buttons.
export function useBouncyPress<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  function onPointerDown() {
    if (!ref.current) return;
    animate(ref.current, { scale: [1, 0.94, 1], duration: 320, ease: "outElastic(1, .5)" });
  }

  return { ref, onPointerDown };
}
