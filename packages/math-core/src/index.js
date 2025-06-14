// Path: packages/math-core/src/index.js

/* @spiral/math-core
 * ------------------------------------------------------------------
 *  Golden-ratio mathematics & timing helpers used across Spiral-OS
 * ------------------------------------------------------------------ */

export const phi            = (1 + Math.sqrt(5)) / 2;           // 1.618033…
export const GOLDEN_ANGLE   = 360 * (1 - 1 / phi);              // 137.507764° optimal disk-packing
export const omega          = 0.000437;                         // Rood wobble offset
export const BEAT_DIVISOR   = 4;                                // PRIIVI3 → 3-on / 1-off
export const FPS_DESIGN     = 90;                               // reference VR framerate (not hard-wired)

/* ------------------------------------------------------------------ *
 *  Utility helpers
 * ------------------------------------------------------------------ */

/** positive modulo that always yields [0, m) even for negatives */
const mod = (x, m) => ((x % m) + m) % m;

/** Golden-angle hue generator (degree value 0-360) */
export const phiHue = n => mod(GOLDEN_ANGLE * n, 360);

/** PRIIVI3 off-beat detector (true on every 4th frame) */
export const isOffBeat = frame => frame % BEAT_DIVISOR === BEAT_DIVISOR - 1;

/** ZCM alignment score (0-1) for a given loop index  */
export const zcm = loop => Math.abs(mod(Math.pow(phi, loop) + omega, 1));

/* ------------------------------------------------------------------ *
 *  Small deterministic prime check (good up to 1e9, enough here)
 * ------------------------------------------------------------------ */
export function isPrime (n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  const limit = Math.floor(Math.sqrt(n));
  for (let i = 5; i <= limit; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ *
 *  Convenience helpers for spiral-position generation
 * ------------------------------------------------------------------ */

/** 3-D logarithmic φ-helix position for index n  */
export function phiHelixPosition (n, {
  radialScale = 0.35, verticalPitch = 0.12,
} = {}) {
  const r   = radialScale * Math.pow(phi, n / 12);
  const th  = n * GOLDEN_ANGLE * Math.PI / 180;
  return [
    r * Math.cos(th),
    n * verticalPitch,
    -r * Math.sin(th)
  ];
}
