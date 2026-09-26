"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Makes the footer rise over the end of whatever page it follows.
 *
 * The page wrapper (the data-page div in the layout) is moved down by exactly
 * as far as the page scrolls while the footer comes up. The two cancel out, so
 * the page appears to hold still while the footer, stacked above it, slides
 * over it.
 *
 * It must be the wrapper, not the last section: under ScrollSmoother, GSAP
 * pins a section by transforming that section itself, so moving the section
 * here would fight the pin (Works, project pages, About).
 *
 * The footer lives in the layout and persists across routes, so this re-runs
 * on every page change to find the new page's last section.
 */
export default function FooterMotion({
  children,
}: {
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const footer = root.current;
      if (!footer) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // The last visible element before the footer. Skips anything hidden or
      // zero-height that the framework may insert.
      let prev = footer.previousElementSibling as HTMLElement | null;
      while (prev && (prev.offsetHeight === 0 || prev.hidden)) {
        prev = prev.previousElementSibling as HTMLElement | null;
      }
      if (!prev) return;

      const tween = gsap.fromTo(
        prev,
        { y: 0 },
        {
          y: () => window.innerHeight,
          ease: "none",
          scrollTrigger: {
            trigger: footer,
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(prev, { clearProps: "transform" });
      };
    },
    { dependencies: [pathname], revertOnUpdate: true }
  );

  return (
    <div ref={root} className="relative z-10">
      {children}
    </div>
  );
}
