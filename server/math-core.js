// server/math-core.js
export const phi = (1 + Math.sqrt(5)) / 2;
export const GOLDEN_ANGLE = 360 * (1 - 1/phi);
export function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6)
    if (n % i === 0 || n % (i+2) === 0) return false;
  return true;
}
