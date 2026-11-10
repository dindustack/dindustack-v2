"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { layout, REST, GAP } from "./layout";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

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
          const captions = cards.map((c) =>
            c.querySelector<HTMLElement>("[data-works='caption']")
          );
          const bars = Array.from(
            scope.querySelectorAll<HTMLElement>("[data-works='bar']")
          );
          const row = scope.querySelector<HTMLElement>("[data-works='row']");

          const state = { raw: 0 };
          let active = 0;

          // Captions are timed, not scrubbed: the incoming title waits for
          // its project to arrive, then rises from below out of a blur. The
          // outgoing one fades quickly so the two never overlap.
          const present = captions.filter((c): c is HTMLElement => !!c);
          gsap.set(present, { opacity: 0, y: 24, filter: "blur(8px)" });
          if (captions[0]) {
            gsap.set(captions[0], { opacity: 1, y: 0, filter: "blur(0px)" });
          }

          const showCaption = (next: number, prev: number) => {
            const out = captions[prev];
            const inn = captions[next];
            if (out) {
              gsap.to(out, {
                opacity: 0,
                y: -8,
                filter: "blur(4px)",
                duration: reduce ? 0 : 0.3,
                ease: "power2.in",
                overwrite: true,
              });
            }
            if (inn) {
              gsap.fromTo(
                inn,
                { opacity: 0, y: 24, filter: "blur(8px)" },
                {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  duration: reduce ? 0 : 0.8,
                  delay: reduce ? 0 : 0.15,
                  ease: "power3.out",
                  overwrite: true,
                }
              );
            }
          };

          const apply = () => {
            const p = focusFromScroll(state.raw, count);
            const L = layout(p, count);
            cards.forEach((card, j) => {
              card.style.setProperty("--l", `${L[j].left}vw`);
              card.style.setProperty("--w", `${L[j].w}vw`);
              card.style.setProperty("--h", `${L[j].h}vw`);
              card.style.setProperty("--b", `${L[j].b}px`);
            });

            const next = Math.round(p);
            if (next !== active) {
              showCaption(next, active);
              active = next;
              bars.forEach((bar, bi) => {
                bar.dataset.active = String(bi === next);
              });
            }
          };

          const tween = gsap.to(state, {
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
          const st = tween.scrollTrigger!;

          // One project step is one screen height of scroll.
          const scrollFor = (index: number) =>
            st.start + index * window.innerHeight;

          const scrollTo = (y: number, smooth: boolean) => {
            const clamped = Math.min(st.end, Math.max(st.start, y));
            const smoother = ScrollSmoother.get();
            if (smoother) smoother.scrollTo(clamped, smooth);
            else window.scrollTo({ top: clamped, behavior: smooth ? "smooth" : "auto" });
          };

          const currentScroll = () =>
            ScrollSmoother.get()?.scrollTop() ?? window.scrollY;

          // Keyboard: left and right arrows move one project while the row
          // is on screen. Ignored while typing in a field.
          const onKey = (e: KeyboardEvent) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            const t = e.target as HTMLElement | null;
            if (t?.closest("input, textarea, select, [contenteditable]")) return;
            const y = currentScroll();
            if (y < st.start - 2 || y > st.end + 2) return;
            e.preventDefault();
            const target = Math.min(
              count - 1,
              Math.max(0, active + (e.key === "ArrowRight" ? 1 : -1))
            );
            scrollTo(scrollFor(target), !reduce);
          };
          window.addEventListener("keydown", onKey);

          // Drag: pulling the row sideways scrolls the page, so the row
          // moves under the pointer. One card width of drag is one step.
          // A drag that moved is not a click, so it will not open a project.
          let dragStartX = 0;
          let dragStartY = 0;
          let dragging = false;
          let moved = false;
          const STEP_PX = () => ((REST.w + GAP) * window.innerWidth) / 100;

          const onDown = (e: PointerEvent) => {
            if (e.pointerType === "touch" || e.button !== 0) return;
            dragging = true;
            moved = false;
            dragStartX = e.clientX;
            dragStartY = currentScroll();
          };
          const onMove = (e: PointerEvent) => {
            if (!dragging) return;
            const dx = e.clientX - dragStartX;
            if (!moved && Math.abs(dx) < 6) return;
            if (!moved) {
              moved = true;
              row?.setAttribute("data-dragging", "true");
            }
            scrollTo(
              dragStartY - (dx / STEP_PX()) * window.innerHeight,
              false
            );
          };
          const onUp = () => {
            if (!dragging) return;
            dragging = false;
            row?.removeAttribute("data-dragging");
            if (!moved) return;
            // Settle on the nearest project.
            const raw = (currentScroll() - st.start) / window.innerHeight;
            scrollTo(scrollFor(Math.round(raw)), !reduce);
          };
          const onClick = (e: MouseEvent) => {
            if (moved) {
              e.preventDefault();
              e.stopPropagation();
              moved = false;
            }
          };
          const onDragStart = (e: DragEvent) => e.preventDefault();

          row?.addEventListener("pointerdown", onDown);
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
          row?.addEventListener("click", onClick, true);
          row?.addEventListener("dragstart", onDragStart);

          apply();

          return () => {
            window.removeEventListener("keydown", onKey);
            row?.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            row?.removeEventListener("click", onClick, true);
            row?.removeEventListener("dragstart", onDragStart);
            row?.removeAttribute("data-dragging");
          };
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
