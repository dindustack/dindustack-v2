"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);



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

          const section = root.current?.parentElement;
          const track =
            root.current?.querySelector<HTMLElement>("[data-about='track']");
          const window_ =
            root.current?.querySelector<HTMLElement>("[data-about='window']");
          if (!section || !track || !window_) return;

          // Measured in a function so invalidateOnRefresh can recompute it
          // after fonts load or the viewport changes.
          const travel = () => track.scrollHeight - window_.clientHeight;

          gsap.to(track, {
            y: () => -travel(),
            ease: "none",
            scrollTrigger: {
              // Pin the whole section, not this inner wrapper, and pin it when
              // its bottom edge reaches the bottom of the screen. The section
              // is at least a viewport tall, so this keeps its top padding in
              // place (nothing slides up under the nav), and the pin releases
              // exactly as the next thing, the footer, starts to arrive. The
              // footer moves this section as it rises over it, so the two must
              // never run at the same time.
              trigger: section,
              start: "bottom bottom",
              end: () => `+=${travel()}`,
              pin: section,
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
