"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Pins the Works section and converts vertical scroll into horizontal travel
 * of the project track. The indicator is driven from the same progress value,
 * so it can never disagree with what is on screen.
 *
 * Snapping settles the track on a whole project when scrolling stops, which
 * keeps each panel's composition intact rather than resting between two.
 *
 * Indicator updates write a data attribute directly instead of setting React
 * state, because onUpdate fires every frame and a re-render per frame would
 * stutter the scrub.
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
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const section = root.current?.parentElement;
          const track =
            root.current?.querySelector<HTMLElement>("[data-works='track']");
          const bars = Array.from(
            root.current?.querySelectorAll<HTMLElement>("[data-works='bar']") ??
              []
          );
          if (!section || !track || count < 2) return;

          const distance = () => track.scrollWidth - window.innerWidth;
          let active = 0;

          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              snap: {
                snapTo: 1 / (count - 1),
                duration: { min: 0.2, max: 0.5 },
                ease: "power1.inOut",
              },
              onUpdate: (self) => {
                const next = Math.round(self.progress * (count - 1));
                if (next === active) return;
                active = next;
                bars.forEach((bar, i) => {
                  bar.dataset.active = String(i === next);
                });
              },
            },
          });
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
