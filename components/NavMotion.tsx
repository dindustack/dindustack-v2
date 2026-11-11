"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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

  // Tone: look at what sits under the middle of the nav bar and take its
  // surface. Checked on scroll (once per frame), resize and route change.
  const pathname = usePathname();
  useEffect(() => {
    const header = root.current?.querySelector<HTMLElement>("[data-nav-header]");
    if (!header) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = header.getBoundingClientRect().bottom / 2;
      const x = window.innerWidth / 2;
      const under = document
        .elementsFromPoint(x, y)
        .find((el) => !header.contains(el) && el.closest("[data-surface]"));
      const surface = under?.closest<HTMLElement>("[data-surface]")?.dataset.surface;
      header.dataset.tone = surface === "ink" ? "white" : "ink";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    // Again once the new page has laid out and ScrollSmoother has reset.
    const late = window.setTimeout(update, 400);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(late);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return (
    <div ref={root} className="contents">
      {children}
    </div>
  );
}
