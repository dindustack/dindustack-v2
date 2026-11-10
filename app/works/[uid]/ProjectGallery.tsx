"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

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
          // Thumbnails live in the section, beside this wrapper's content.
          const thumbs = Array.from(
            (scope.parentElement ?? scope).querySelectorAll<HTMLButtonElement>(
              "[data-gallery='thumb']"
            )
          );
          if (!isDesktop || !section || !view || !strip || count < 2) return;

          const travel = () => Math.max(0, strip.scrollWidth - view.clientWidth);
          if (travel() === 0) return;

          let active = 0;
          const items = Array.from(strip.children) as HTMLElement[];

          // How far the strip must slide to bring screenshot i to the left
          // of the window. Clamped, so the last few simply reach the end.
          const offsetOf = (i: number) =>
            Math.min(
              travel(),
              Math.max(0, (items[i]?.offsetLeft ?? 0) - (items[0]?.offsetLeft ?? 0))
            );

          const markActive = (next: number) => {
            if (next === active) return;
            active = next;
            thumbs.forEach((t, i) => {
              if (i === next) t.setAttribute("aria-current", "true");
              else t.removeAttribute("aria-current");
            });
          };

          const tween = gsap.to(strip, {
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
                // The screenshot in view is the last one whose stop the
                // strip has reached (half way to the next counts as there).
                const x = self.progress * travel();
                let next = 0;
                for (let i = 0; i < items.length; i++) {
                  const here = offsetOf(i);
                  const prev = i > 0 ? offsetOf(i - 1) : 0;
                  if (x >= (here + prev) / 2) next = i;
                }
                markActive(next);
              },
            },
          });

          // Clicking a thumbnail scrolls to where its screenshot is in view.
          // One pixel of scroll moves the strip one pixel, so the target is
          // the pin's start plus that screenshot's offset.
          const st = tween.scrollTrigger!;
          const onThumb = (e: Event) => {
            const i = Number((e.currentTarget as HTMLElement).dataset.index);
            const y = st.start + offsetOf(i);
            const smoother = ScrollSmoother.get();
            if (smoother) smoother.scrollTo(y, !reduce);
            else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
          };
          thumbs.forEach((t) => t.addEventListener("click", onThumb));

          return () => {
            thumbs.forEach((t) => t.removeEventListener("click", onThumb));
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
