"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

/** Fired by ScrollToWorks so a scroll mid-intro can finish it at once. */
export const FINISH_INTRO = "hero:finish-intro";

/**
 * Entrance only, played on load. The nav slides in on its own at 0s (see
 * NavMotion); this sequence starts one step after it, each step one second
 * after the previous one starts:
 *
 *   0s  the picture is already there, not animated: it is the largest
 *       thing on screen, so showing it at once keeps load time (LCP) low
 *   1s  the name, letter by letter, 200ms apart, rising from behind its own
 *       overflow-hidden wrapper
 *   2s  the write-up, typed out character by character, left then right
 *
 * Elements marked data-intro start hidden in CSS (globals.css) so nothing
 * flashes before this runs; a CSS fallback reveals them if script never does.
 */
export default function HeroMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const pending = scope.querySelectorAll<HTMLElement>("[data-intro]");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(pending, { visibility: "visible" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const name = scope.querySelector<HTMLElement>("[data-animate='name']");
        const intros = Array.from(
          scope.querySelectorAll<HTMLElement>("[data-animate='intro']")
        );

        const nameSplit = name
          ? SplitText.create(name, { type: "chars", aria: "auto" })
          : null;
        const introSplits = intros.map((el) =>
          // "hidden", not "auto": auto puts an aria-label on this plain div,
          // which ARIA does not allow (Lighthouse flags it). The letters are
          // hidden from screen readers only while the typing plays; the
          // split is reverted when it ends, restoring the plain text.
          SplitText.create(el, { type: "chars,words", aria: "hidden" })
        );

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            // Hand back plain text, so the exit ripple in ScrollToWorks can
            // split the name afresh and text wraps normally on resize.
            nameSplit?.revert();
            introSplits.forEach((s) => s.revert());
          },
        });

        gsap.set(pending, { visibility: "visible" });

        if (nameSplit) {
          // Each letter is invisible until its own turn, then fades in as
          // it slides up, so no part of it shows while it waits.
          gsap.set(nameSplit.chars, { yPercent: 150, autoAlpha: 0 });
          tl.to(
            nameSplit.chars,
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.9,
              stagger: 0.2,
            },
            1
          );
        }

        // Typing: each character appears at once, in order. The pace adapts
        // so each block types out in about two seconds whatever its length.
        let at = 2;
        introSplits.forEach((split) => {
          const chars = split.chars;
          if (!chars.length) return;
          const each = Math.min(0.035, 2 / chars.length);
          tl.from(
            chars,
            { autoAlpha: 0, duration: 0.01, ease: "none", stagger: each },
            at
          );
          at += chars.length * each;
        });

        const finish = () => tl.progress(1);
        window.addEventListener(FINISH_INTRO, finish);
        return () => window.removeEventListener(FINISH_INTRO, finish);
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="relative flex min-h-svh flex-1 flex-col">
      {children}
    </div>
  );
}
