"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * First-load entrance for the nav, at the same moment: the logo slides in
 * from the left and the links from the right, both fading in. The nav lives
 * in the layout and persists across routes, so this plays once per visit.
 */
export default function NavMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const logo = "[data-nav='logo']";
      const links = "[data-nav='links']";
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([logo, links], { visibility: "visible" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            defaults: { duration: 0.9, ease: "power3.out" },
            // Hand transforms back to CSS so the hover scale can work.
            onComplete: () => gsap.set([logo, links], { clearProps: "transform" }),
          })
          .fromTo(logo, { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }, 0)
          .fromTo(links, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1 }, 0);
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="contents">
      {children}
    </div>
  );
}
