"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { layout } from "./layout";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Fraction of each step, at each end, where nothing moves. The transition
 * happens in the middle, so every project has a stretch of scroll where it
 * sits still in focus. That gives natural resting points without snapping,
 * which fights ScrollSmoother's lag and can pull back to the previous project.
 */
const HOLD = 0.2;

/** Maps raw scroll steps to focus position, with a hold at every project. */
function focusFromScroll(raw: number, count: number) {
  const max = count - 1;
  if (raw >= max) return max;
  const k = Math.floor(raw);
  const f = raw - k;
  const t = Math.min(1, Math.max(0, (f - HOLD) / (1 - 2 * HOLD)));
  // smoothstep, so each transition eases in and out
  return k + t * t * (3 - 2 * t);
}

/**
 * Scroll drives one number, the focus position, from 0 to the last project.
 * On every update each card's position, size and caption opacity is computed
 * from that number by the same layout() the server used, and written to the
 * card's custom properties. Nothing is tweened independently, so nothing can
 * drift out of step.
 *
 * Values are in vw, so a resize needs no recalculation.
 *
 * No snapping: resting points come from HOLD instead, see above.
 *
 * Runs at 1024 and above. Reduced motion keeps the scroll-driven row, since
 * it is direct manipulation rather than autoplay, but drops the smoothing lag.
 */
export default function WorksMotion({
  children,
  count,
}: {
  children: React.ReactNode;
  count: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, reduce } = ctx.conditions as {
            isDesktop: boolean;
            reduce: boolean;
          };
          const scope = root.current;
          const section = scope?.parentElement;
          if (!isDesktop || !scope || !section || count < 2) return;

          const cards = Array.from(
            scope.querySelectorAll<HTMLElement>("[data-works='card']")
          );
          const bars = Array.from(
            scope.querySelectorAll<HTMLElement>("[data-works='bar']")
          );

          const state = { raw: 0 };
          let active = 0;

          const apply = () => {
            const p = focusFromScroll(state.raw, count);
            const L = layout(p, count);
            cards.forEach((card, j) => {
              card.style.setProperty("--l", `${L[j].left}vw`);
              card.style.setProperty("--w", `${L[j].w}vw`);
              card.style.setProperty("--h", `${L[j].h}vw`);
              card.style.setProperty("--o", String(L[j].o));
            });

            const next = Math.round(p);
            if (next !== active) {
              active = next;
              bars.forEach((bar, bi) => {
                bar.dataset.active = String(bi === next);
              });
            }
          };

          gsap.to(state, {
            raw: count - 1,
            ease: "none",
            onUpdate: apply,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${(count - 1) * window.innerHeight}`,
              pin: true,
              scrub: reduce ? true : 1,
            },
          });

          apply();
        }
      );

      return () => mm.revert();
    },
    { scope: root, dependencies: [count] }
  );

  return (
    <div ref={root} className="relative lg:h-full">
      {children}
    </div>
  );
}
