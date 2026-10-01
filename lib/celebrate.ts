"use client";

const COLORS = ["#ffd24a", "#fff6c9", "#4ad8ff", "#ff9a3c", "#5bd96a"];
const PARTICLE_COUNT = 14;

// Square-pixel burst plus a floating "+N XP" at a quest checkbox. Elements are
// appended to document.body (outside React's tree) so they survive the
// re-render that follows the server action, and animated with the Web
// Animations API using steps() easing so motion stays choppy like a 16-bit game.
export function celebrateAt(origin: HTMLElement, xp: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const size = i % 3 === 0 ? 8 : 4;
    const p = document.createElement("div");
    Object.assign(p.style, {
      position: "fixed",
      left: `${x - size / 2}px`,
      top: `${y - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      background: COLORS[i % COLORS.length],
      pointerEvents: "none",
      zIndex: "9999",
    });
    document.body.appendChild(p);

    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 28 + Math.random() * 36;
    const anim = p.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 14}px)`, opacity: 0 },
      ],
      { duration: 600, easing: "steps(6)", fill: "forwards" },
    );
    anim.onfinish = () => p.remove();
  }

  const label = document.createElement("div");
  label.textContent = `+${xp} XP`;
  Object.assign(label.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y - 20}px`,
    transform: "translateX(-50%)",
    fontFamily: "var(--font-pixel), monospace",
    fontSize: "12px",
    color: "#ffd24a",
    textShadow: "2px 0 #0b0820, -2px 0 #0b0820, 0 2px #0b0820, 0 -2px #0b0820",
    pointerEvents: "none",
    zIndex: "9999",
  });
  document.body.appendChild(label);
  label.animate(
    [
      { transform: "translate(-50%, 0)", opacity: 1 },
      { transform: "translate(-50%, -44px)", opacity: 0 },
    ],
    { duration: 900, easing: "steps(9)", fill: "forwards" },
  ).onfinish = () => label.remove();
}
