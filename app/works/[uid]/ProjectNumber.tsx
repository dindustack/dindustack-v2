"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** The project number last shown, kept across client-side navigations. */
let lastShown: number | null = null;

/** Seconds to wait so the roll plays as the cloth uncovers this corner. */
const DELAY = 0.6;

/**
 * The big project number, bottom left. Arriving from another project, each
 * digit that changes rolls: the old one slides up and out, paler, while the
 * new one rises into place (01 to 02: the 0 stays, the 1 rolls up to a 2).
 * Landing on a project directly, the number simply shows.
 *
 * The box keeps Figma's tight 0.71 line height, so the digits sit exactly
 * where the design puts them, but it is padded so nothing is cut: below,
 * for Gentium's old-style digits (3, 5, 6, 7, 9) that hang past the
 * baseline, and on the right, where the tight tracking trims the last
 * digit. The padding is subtracted from the bottom offset, so the number
 * does not move. The box still clips, so the roll stays masked.
 */
export default function ProjectNumber({ value }: { value: number }) {
  const root = useRef<HTMLParagraphElement>(null);
  const digits = String(value).padStart(2, "0").split("");

  useGSAP(
    () => {
      const prev = lastShown;
      lastShown = value;
      const scope = root.current;
      if (!scope || prev === null || prev === value) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const old = String(prev).padStart(2, "0").split("");
      const slots = Array.from(
        scope.querySelectorAll<HTMLElement>("[data-digit]")
      );
      const added: HTMLElement[] = [];
      const tl = gsap.timeline({
        delay: DELAY,
        defaults: { duration: 0.8, ease: "power3.inOut" },
        onComplete: () => added.forEach((el) => el.remove()),
      });

      slots.forEach((slot, i) => {
        if (old[i] === undefined || old[i] === digits[i]) return;
        const current = slot.querySelector<HTMLElement>("[data-current]");
        const out = document.createElement("span");
        out.textContent = old[i];
        out.setAttribute("aria-hidden", "true");
        Object.assign(out.style, { position: "absolute", left: "0", top: "0" });
        slot.appendChild(out);
        added.push(out);

        // As in the Figma frame: the old digit slides up and out, turning
        // pale, while the new one slides up from below in full colour. No
        // fades, so both stay solid while they pass each other.
        tl.fromTo(out, { yPercent: 0 }, { yPercent: -140, color: "#e8d9d4" }, 0);
        if (current) tl.fromTo(current, { yPercent: 140 }, { yPercent: 0 }, 0);
      });

      return () => {
        tl.kill();
        added.forEach((el) => el.remove());
      };
    },
    { scope: root, dependencies: [value] }
  );

  return (
    <p
      ref={root}
      aria-hidden
      className="hidden overflow-hidden font-bold text-[clamp(64px,8.8vw,152px)] leading-[0.71] tracking-[-0.04em] text-[#c7b7b1] pb-[0.22em] pr-[0.1em] lg:absolute lg:bottom-[calc(54px-0.22em)] lg:left-[3.94vw] lg:flex"
    >
      {digits.map((d, i) => (
        <span key={i} data-digit className="relative inline-block">
          <span data-current className="inline-block">
            {d}
          </span>
        </span>
      ))}
    </p>
  );
}
