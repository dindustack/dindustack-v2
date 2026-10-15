"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const DESTINATION = "/works";

/** Picked up by PageTransition, which fades it away once /works has rendered. */
export const CURTAIN_ID = "page-curtain";

/**
 * The homepage is the hero alone: the first downward scroll carries the
 * visitor to the Works page.
 *
 * The exit is choreographed rather than cut:
 *   1. the letters of the name rise and slip away one after another
 *   2. the intro text and portrait drift up and dissolve just behind them
 *   3. a dome of ink, carrying the Works pattern, rises from below; its
 *      curved top flattens as it climbs until it fills the screen
 *   4. the route changes under it. The curtain is the Works background,
 *      same colour, same pattern, same tile alignment, so the swap is
 *      invisible, and the curtain then melts away to reveal the projects.
 *
 * Listens for every way of scrolling down: wheel and trackpad (with a
 * threshold so jitter does not trigger it), a swipe up on touch screens, and
 * ArrowDown, PageDown, Space and End. Reduced motion skips straight to /works.
 */
export default function ScrollToWorks() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(DESTINATION);

    const hero = document.querySelector<HTMLElement>('[data-slice-type="hero"]');
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let leaving = false;
    let wheelTotal = 0;
    let touchStartY: number | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let split: SplitText | null = null;

    const go = () => {
      if (leaving) return;
      leaving = true;

      if (reduce || !hero) {
        router.push(DESTINATION);
        return;
      }

      const name = hero.querySelector<HTMLElement>("[data-animate='name']");
      const intro = hero.querySelectorAll<HTMLElement>("[data-animate='intro']");
      const portrait = hero.querySelector<HTMLElement>("[data-animate='portrait']");

      // The rising curtain: ink with the Works pattern, a domed top edge.
      const curtain = document.createElement("div");
      curtain.id = CURTAIN_ID;
      curtain.setAttribute("aria-hidden", "true");
      curtain.className =
        "bg-ink [background-image:url(/patterns/works-print.svg)] [background-size:480px]";
      Object.assign(curtain.style, {
        position: "fixed",
        inset: "0",
        zIndex: "60",
        pointerEvents: "none",
        willChange: "transform",
      });
      document.body.appendChild(curtain);

      if (name) split = SplitText.create(name, { type: "chars" });

      timeline = gsap.timeline({
        onComplete: () => router.push(DESTINATION),
      });

      if (split) {
        timeline.to(
          split.chars,
          {
            yPercent: -115,
            rotate: -4,
            duration: 0.7,
            ease: "power3.in",
            stagger: { each: 0.022, from: "start" },
          },
          0
        );
      }

      timeline
        .to(
          intro,
          {
            y: -40,
            autoAlpha: 0,
            filter: "blur(6px)",
            duration: 0.7,
            ease: "power2.in",
            stagger: 0.08,
          },
          0.05
        )
        .to(
          portrait,
          {
            y: -60,
            scale: 0.9,
            autoAlpha: 0,
            filter: "blur(8px)",
            duration: 0.75,
            ease: "power2.in",
          },
          0.1
        )
        .fromTo(
          curtain,
          {
            yPercent: 100,
            borderTopLeftRadius: "50% 40vh",
            borderTopRightRadius: "50% 40vh",
          },
          {
            yPercent: 0,
            borderTopLeftRadius: "0% 0vh",
            borderTopRightRadius: "0% 0vh",
            duration: 0.8,
            ease: "expo.inOut",
          },
          0.3
        );
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom on trackpads
      if (e.deltaY <= 0) {
        wheelTotal = 0;
        return;
      }
      e.preventDefault();
      wheelTotal += e.deltaY;
      if (wheelTotal > 30) go();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY === null) return;
      const dy = touchStartY - (e.touches[0]?.clientY ?? touchStartY);
      if (dy > 0) e.preventDefault();
      if (dy > 50) go();
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (["ArrowDown", "PageDown", "End", " "].includes(e.key)) {
        e.preventDefault();
        go();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      // The curtain is left in place on purpose: PageTransition removes it
      // once the Works page is on screen.
      timeline?.kill();
      split?.revert();
    };
  }, [router]);

  return null;
}
