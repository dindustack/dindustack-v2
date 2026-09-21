"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Entrance only. No ScrollTrigger: the hero is above the fold, so it should
 * play on load rather than wait for a scroll position it may never reach.
 *
 * The name rises from behind its own overflow-hidden wrapper, which is why
 * that wrapper exists in the component rather than being a stray div.
 */
export default function HeroMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from("[data-animate='name']", {
          yPercent: 110,
          duration: 1.1,
        })
          .from(
            "[data-animate='portrait']",
            { autoAlpha: 0, scale: 1.04, duration: 0.9 },
            0.1,
          )
          .from(
            "[data-animate='intro']",
            { y: 16, autoAlpha: 0, duration: 0.8, stagger: 0.1 },
            0.35,
          );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex min-h-svh flex-1 flex-col">
      {children}
    </div>
  );
}
