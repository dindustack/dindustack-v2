"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Nav() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const dark = Array.from(
        document.querySelectorAll<HTMLElement>('[data-surface="ink"]'),
      );

      dark.forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 40px",
          end: "bottom 40px",
          onToggle: ({ isActive }) =>
            root.current?.classList.toggle("text-blush", isActive),
        });
      });
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      className="page-gutter fixed inset-x-0 top-0 z-50 text-ink transition-colors duration-300"
    >
      <div className="relative flex items-start justify-between">
        <Link
          href="/"
          className="font-mark pt-4.5 text-[15px] font-black leading-6 tracking-[-0.07em]"
        >
          D.S
        </Link>

        <nav className="font-display flex w-33.5 justify-between pt-6 text-[16px] uppercase tracking-nav">
          <Link href="/works" className="hover:opacity-60">
            works
          </Link>
          <Link href="/about" className="hover:opacity-60">
            about
          </Link>
        </nav>
      </div>
    </header>
  );
}
