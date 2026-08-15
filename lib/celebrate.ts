"use client";

import { animate } from "animejs";

const COLORS = ["#c8a15c", "#e2c07a", "#7c9a6b"];
const PARTICLE_COUNT = 10;

// Small gold particle burst for quest-complete moments. Particles are
// appended to document.body (outside React's tree) so they survive the
// re-render that follows the server action, instead of getting unmounted
// mid-animation.
export function celebrateAt(origin: HTMLElement) {
  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const particles: HTMLDivElement[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement("div");
    p.style.position = "fixed";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = "5px";
    p.style.height = "5px";
    p.style.borderRadius = "50%";
    p.style.background = COLORS[i % COLORS.length];
    p.style.pointerEvents = "none";
    p.style.zIndex = "9999";
    p.style.opacity = "0";
    document.body.appendChild(p);
    particles.push(p);
  }

  particles.forEach((p, i) => {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.4;
    const distance = 32 + Math.random() * 28;
    animate(p, {
      translateX: Math.cos(angle) * distance,
      translateY: Math.sin(angle) * distance - 10,
      scale: [0, 1, 0.4],
      opacity: [0, 1, 0],
      duration: 550 + Math.random() * 150,
      ease: "outCubic",
      onComplete: () => p.remove(),
    });
  });
}
