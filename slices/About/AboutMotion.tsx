"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Two behaviours, both scoped to this slice so they revert on unmount.
 *
 * The prose paragraphs stagger in once. The image track scrubs upward through
 * its masked window while the section is pinned, which is what the Figma frame
 * implies: a 772px window holding roughly 4545px of images.
 *
 * Neither runs below 1024 or under reduced motion. In those cases the window
 * is a natively scrollable strip, handled in CSS, so nothing is unreachable.
 */
export default function AboutMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.from("[data-animate='paragraph']", {
            y: 24,
            autoAlpha: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: root.current, start: "top 65%" },
          });

          const track =
            root.current?.querySelector<HTMLElement>("[data-about='track']");
          const window_ =
            root.current?.querySelector<HTMLElement>("[data-about='window']");
          if (!track || !window_) return;

          // Measured in a function so invalidateOnRefresh can recompute it
          // after fonts load or the viewport changes.
          const travel = () => track.scrollHeight - window_.clientHeight;

          gsap.to(track, {
            y: () => -travel(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => `+=${travel()}`,
              pin: true,
              pinSpacing: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }
      );

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="w-full">
      {children}
    </div>
  );
}
