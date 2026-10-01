"use client";

// Tiny square-wave chiptune blips via WebAudio — no audio files. Muted state
// persists in localStorage; browsers only allow audio after a user gesture,
// which every call site here is (a tap).

const MUTE_KEY = "questos:muted";

let ctx: AudioContext | null = null;

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // storage blocked — mute just won't persist
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "square", gain = 0.06) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  amp.gain.setValueAtTime(gain, ctx.currentTime + start);
  amp.gain.setValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.02);
}

function ready(): boolean {
  if (isMuted() || typeof window === "undefined") return false;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return false;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return true;
}

export const sfx = {
  /** Quest checked off: the classic two-note coin. */
  coin() {
    if (!ready()) return;
    tone(988, 0, 0.07);
    tone(1319, 0.07, 0.22);
  },
  /** Quest un-checked / deleted. */
  undo() {
    if (!ready()) return;
    tone(330, 0, 0.08, "triangle", 0.08);
    tone(247, 0.08, 0.12, "triangle", 0.08);
  },
  /** Menu tap. */
  tap() {
    if (!ready()) return;
    tone(660, 0, 0.04);
  },
  /** Level-up fanfare. */
  levelUp() {
    if (!ready()) return;
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, i === 6 ? 0.45 : 0.1));
  },
};
