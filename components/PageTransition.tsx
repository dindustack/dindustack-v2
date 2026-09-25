"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

const OVERLAY_ID = "page-transition";

/**
 * Image-zoom page transition, mounted once in the root layout.
 *
 * Any link marked data-transition that contains an element marked
 * data-transition-image takes part. On click, a fixed copy of that image is
 * placed exactly over the original and grown to fill the viewport; when it
 * covers the screen the route changes underneath it. When the new route has
 * rendered, the copy fades away to reveal it.
 *
 * The copy lives on document.body, outside the page and outside
 * ScrollSmoother, so it survives the route change and is unaffected by
 * scroll transforms.
 *
 * Modified clicks (new tab, etc.) and reduced motion fall through to normal
 * navigation.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[data-transition]"
      );
      if (!link || link.target === "_blank") return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      const frame = link.querySelector<HTMLElement>("[data-transition-image]");
      const img = frame?.querySelector<HTMLImageElement>("img");
      if (!frame || !img) return;

      // Capture phase on document runs before next/link's own handler, which
      // skips navigation when the default has already been prevented.
      e.preventDefault();
      if (busy.current) return;

      const href = url.pathname + url.search + url.hash;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }

      busy.current = true;
      router.prefetch(href);

      const rect = frame.getBoundingClientRect();
      const overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.setAttribute("aria-hidden", "true");
      Object.assign(overlay.style, {
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        overflow: "hidden",
        zIndex: "60",
        pointerEvents: "none",
      });

      const copy = document.createElement("img");
      copy.src = img.currentSrc || img.src;
      copy.alt = "";
      Object.assign(copy.style, {
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      });

      overlay.appendChild(copy);
      document.body.appendChild(overlay);

      gsap.to(overlay, {
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: () => router.push(href),
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // The route has changed: fade the covering image away to reveal the page.
  useEffect(() => {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    gsap.to(overlay, {
      autoAlpha: 0,
      duration: 0.6,
      delay: 0.2,
      ease: "power2.out",
      onComplete: () => {
        overlay.remove();
        busy.current = false;
      },
    });
  }, [pathname]);

  return null;
}
