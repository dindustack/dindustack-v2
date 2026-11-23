"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { OVERLAY_ID, loadCloth, startCloth } from "@/components/clothNav";

/**
 * Leads a project page on to the next project.
 *
 * Nothing extra is shown or scrolled. When the visitor has reached the end
 * of the page (the last screenshot in view), the next scroll down plays the
 * same cloth as clicking a Works card: the next project's cover lifts off
 * where the last screenshot is and billows up to fill the screen, then the
 * next project opens under it and PageTransition sends the sheet off to the right.
 * Without WebGL it falls back to a plain zoom and fade.
 *
 * The next cover is preloaded on arrival so the zoom shows it straight away.
 * The data-next-project marker also hides the footer on this page (see
 * globals.css); only the last project ends with the footer.
 *
 * Listens for wheel and trackpad (with a threshold so jitter does not
 * trigger it), a swipe up on touch screens, and ArrowDown, PageDown, Space
 * and End. Reduced motion opens the next project without the zoom.
 */


export default function NextProject({
  href,
  image,
}: {
  href: string;
  image: string;
}) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(href);
    // Same CORS mode as the cloth's texture load, so that one hits the cache.
    const preload = new Image();
    preload.crossOrigin = "anonymous";
    preload.src = image;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void loadCloth().catch(() => {});
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let leaving = false;
    let wheelTotal = 0;
    let touchStartY: number | null = null;

    const atEnd = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 4;

    const go = () => {
      if (leaving) return;
      leaving = true;

      if (reduce) {
        router.push(href);
        return;
      }

      // Grow out of the last screenshot, or from the screen centre if it is
      // not on screen.
      const shots = document.querySelectorAll<HTMLElement>(
        "[data-gallery='strip'] > *"
      );
      const last = shots[shots.length - 1];
      const r = last?.getBoundingClientRect();
      const onScreen =
        r && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
      const start = onScreen
        ? { left: r.left, top: r.top, width: r.width, height: r.height }
        : {
            left: window.innerWidth * 0.3,
            top: window.innerHeight * 0.3,
            width: window.innerWidth * 0.4,
            height: window.innerHeight * 0.4,
          };

      void startCloth({
        from: start,
        src: image,
        onCovered: () => router.push(href),
      }).then((started) => {
        if (!started) zoom(start);
      });
    };

    // Fallback: the plain zoom, faded in over the last screenshot.
    const zoom = (start: { left: number; top: number; width: number; height: number }) => {
      const overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.setAttribute("aria-hidden", "true");
      Object.assign(overlay.style, {
        position: "fixed",
        left: `${start.left}px`,
        top: `${start.top}px`,
        width: `${start.width}px`,
        height: `${start.height}px`,
        overflow: "hidden",
        zIndex: "60",
        pointerEvents: "none",
        opacity: "0",
      });

      const img = document.createElement("img");
      img.src = image;
      img.alt = "";
      Object.assign(img.style, {
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      });
      overlay.appendChild(img);
      document.body.appendChild(overlay);

      gsap
        .timeline({ onComplete: () => router.push(href) })
        .to(overlay, { opacity: 1, duration: 0.25, ease: "power1.out" }, 0)
        .to(
          overlay,
          {
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            duration: 0.9,
            ease: "power3.inOut",
          },
          0
        );
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.deltaY <= 0 || !atEnd()) {
        wheelTotal = 0;
        return;
      }
      wheelTotal += e.deltaY;
      if (wheelTotal > 30) go();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY === null || !atEnd()) return;
      const dy = touchStartY - (e.touches[0]?.clientY ?? touchStartY);
      if (dy > 50) go();
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          "a, button, input, textarea, select, [contenteditable], [role='button']"
        )
      )
        return;
      if (!atEnd()) return;
      if (["ArrowDown", "PageDown", "End", " "].includes(e.key)) {
        e.preventDefault();
        go();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [href, image, router]);

  return <div data-next-project hidden aria-hidden />;
}
