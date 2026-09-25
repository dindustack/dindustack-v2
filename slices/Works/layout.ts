/**
 * Pure layout for the Works row, shared by the server render and the scroll
 * animation so both produce identical positions.
 *
 * Measured from the 1728 Figma frame, expressed in vw:
 *   focused card 784x500   -> 45.37 x 28.94
 *   resting card 518x422   -> 29.98 x 24.42
 *   gap 32                 -> 1.85
 *   focus left edge x=472  -> 27.31
 */
export const FOCUS = { w: 45.37, h: 28.94 };
export const REST = { w: 29.98, h: 24.42 };
export const GAP = 1.85;
export const FOCUS_X = 27.31;

export type CardLayout = { left: number; w: number; h: number; o: number };

/**
 * p is the focus position: 0 means the first project is in focus, 1 the
 * second, and fractions are the transition between them.
 *
 * A card's focus weight is 1 when it is the focused card and falls to 0 one
 * step away, so exactly two cards are ever mid-resize. The anchor card k is
 * placed so that at the end of each step the incoming card sits exactly at
 * FOCUS_X; every other card is laid out edge to edge from it.
 */
export function layout(p: number, count: number): CardLayout[] {
  const max = Math.max(count - 1, 0);
  const pos = Math.min(Math.max(p, 0), max);
  const k = Math.min(Math.floor(pos), max);
  const t = pos - k;

  const sizes = Array.from({ length: count }, (_, j) => {
    const f = Math.max(0, 1 - Math.abs(j - pos));
    return {
      f,
      w: REST.w + (FOCUS.w - REST.w) * f,
      h: REST.h + (FOCUS.h - REST.h) * f,
    };
  });

  const left: number[] = new Array(count);
  left[k] = FOCUS_X - t * (REST.w + GAP);
  for (let j = k + 1; j < count; j++) left[j] = left[j - 1] + sizes[j - 1].w + GAP;
  for (let j = k - 1; j >= 0; j--) left[j] = left[j + 1] - GAP - sizes[j].w;

  return sizes.map((s, j) => ({
    left: left[j],
    w: s.w,
    h: s.h,
    // Caption only shows in the back half of focus, so the outgoing and
    // incoming titles cross-fade rather than overlap.
    o: Math.min(1, Math.max(0, (s.f - 0.5) * 2)),
  }));
}
