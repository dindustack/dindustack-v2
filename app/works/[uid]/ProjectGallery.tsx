"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Desktop: pins the Work details section and slides the screenshot strip left
 * through its window as you scroll. The pin lasts exactly as long as the
 * strip has to travel, then releases. Bars follow the screenshot in view.
 *
 * Text fades up as the page is revealed from the zoom transition. It uses
 * from(), so with JavaScript off everything is simply visible.
 *
 * Below 1024 nothing is pinned; the screenshots stack.
 */
export default function ProjectGallery({
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
          if (!scope) return;

          if (!reduce) {
            gsap.from(scope.querySelectorAll("[data-animate='detail']"), {
              y: 16,
              autoAlpha: 0,
              duration: 0.7,
              stagger: 0.08,
              delay: 0.35,
              ease: "power2.out",
            });
          }

          const section = scope.parentElement;
          const view = scope.querySelector<HTMLElement>("[data-gallery='window']");
          const strip = scope.querySelector<HTMLElement>("[data-gallery='strip']");
          const bars = Array.from(
            scope.querySelectorAll<HTMLElement>("[data-gallery='bar']")
          );
          if (!isDesktop || !section || !view || !strip || count < 2) return;

          const travel = () => Math.max(0, strip.scrollWidth - view.clientWidth);
          if (travel() === 0) return;

          let active = 0;

          gsap.to(strip, {
            x: () => -travel(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${travel()}`,
              pin: true,
              scrub: reduce ? true : 1,
              invalidateOnRefresh: true,
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
