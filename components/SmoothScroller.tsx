"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

/**
 * Initialised once, at the layout level. Slices never create their own
 * smoother; they assume this exists and use ordinary ScrollTrigger positions.
 *
 * smoothTouch stays off. Momentum scrolling on touch devices already feels
 * right, and overriding it makes pinned sections behave unpredictably.
 */
export default function SmoothScroller({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapper.current,
        content: content.current,
        smooth: 1.2,
        effects: true,
        smoothTouch: false,
      });

      // Fonts and images settle after hydration and shift layout in ways
      // React does not report. Without this, every trigger below the fold
      // is measured against a stale document height.
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      window.addEventListener("load", refresh);

      return () => {
        window.removeEventListener("load", refresh);
        smoother.kill();
      };
    },
    { scope: wrapper }
  );

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
