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

      // On phones the visible area grows as the browser's toolbars slide
      // away, and in-app browsers on iOS (Brave, Chrome, Firefox) do not
      // report that larger height through 100lvh. A footer shorter than the
      // screen stops short of the top and leaves the page showing above it.
      // The physical screen height is always at least as tall as any visible
      // area, so it is a safe floor for the footer on touch devices.
      const inner = footer.firstElementChild as HTMLElement | null;
      if (inner && window.matchMedia("(pointer: coarse)").matches) {
        const floor = Math.max(window.screen.height, window.innerHeight);
        if (inner.offsetHeight < floor) {
          inner.style.minHeight = `${floor}px`;
          ScrollTrigger.refresh();
        }
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Hidden on project pages that lead on to another project (see
      // globals.css); nothing to rise.
      if (footer.offsetHeight === 0) return;

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
    <div ref={root} data-footer className="relative z-10">
      {children}
    </div>
  );
}
