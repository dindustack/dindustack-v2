"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * One instance per panel, scoped to that panel. No pinning: each panel is a
 * normal full-viewport section, so the images just reveal as they arrive.
 *
 * The secondary image drifts slightly faster than the page, which reads as
 * depth against the static cover without needing a parallax plugin.
 */
export default function WorksMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-animate='cover'], [data-animate='caption']", {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 65%" },
        });

        mm.add("(min-width: 1024px)", () => {
          gsap.to("[data-animate='secondary']", {
            yPercent: -12,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="flex min-h-svh flex-1 flex-col">
      {children}
    </div>
  );
}
