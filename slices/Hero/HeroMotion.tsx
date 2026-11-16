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
 *   0s  up to ten pictures flash through the portrait box, ~100ms each,
 *       landing on the portrait (which is underneath all along, so the box
 *       is never empty and load time, LCP, stays low)
 *   ~.8s the name, letter by letter, rising from behind its own
 *       overflow-hidden wrapper, in about a second
 *   then the write-up, typed out character by character, left then right,
 *       once the name has fully landed
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

        // 1. Pictures flash through the portrait box, about 100ms each,
        //    then the last one goes and the portrait underneath remains.
        const flashes = Array.from(
          scope.querySelectorAll<HTMLElement>("[data-flash]")
        );
        const STEP = 0.1;
        flashes.forEach((img, i) => {
          tl.set(img, { visibility: "visible" }, i * STEP);
          if (i > 0) tl.set(flashes[i - 1], { visibility: "hidden" }, i * STEP);
        });
        const flashEnd = flashes.length * STEP;
        if (flashes.length) {
          tl.set(flashes[flashes.length - 1], { visibility: "hidden" }, flashEnd);
        }

        // 2. The name starts as the flashing is about to end and takes
        //    about a second.
        const nameStart = flashes.length ? Math.max(0, flashEnd - 0.2) : 0.3;
        const NAME_STAGGER = 0.035;
        const NAME_DURATION = 0.5;
        let nameEnd = nameStart;

        if (nameSplit) {
          // Each letter is invisible until its own turn, then fades in as
          // it slides up, so no part of it shows while it waits.
          gsap.set(nameSplit.chars, { yPercent: 150, autoAlpha: 0 });
          tl.to(
            nameSplit.chars,
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: NAME_DURATION,
              stagger: NAME_STAGGER,
            },
            nameStart
          );
          nameEnd =
            nameStart +
            (nameSplit.chars.length - 1) * NAME_STAGGER +
            NAME_DURATION;
        }

        // 3. Once the name has fully landed, the write-up types out: each
        // character appears at once, in order, each block in about two
        // seconds whatever its length.
        let at = nameEnd;
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
