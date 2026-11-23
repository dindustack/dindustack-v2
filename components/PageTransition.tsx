"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

const OVERLAY_ID = "page-transition";

/** The cloth effect and three.js, loaded only when a page has project links. */
type ClothModule = typeof import("./clothTransition");
let clothModule: Promise<ClothModule> | null = null;
const loadCloth = () => (clothModule ??= import("./clothTransition"));

/** The running cloth sheet, flown away and torn down once the new page is in. */
let activeCloth: import("./clothTransition").ClothHandle | null = null;
/** The card image hidden while the cloth lifts off it. */
let hiddenFrame: HTMLElement | null = null;

/** Loads a CORS-clean copy of the image for WebGL, or fails within 800ms. */
function loadTextureImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    const timer = window.setTimeout(() => reject(new Error("timeout")), 800);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("image"));
    };
    image.src = src;
  });
}

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
      const src = img.currentSrc || img.src;

      // The plain zoom: a copy of the image grows to fill the screen.
      const zoom = () => {
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

      // Cloth first; if WebGL, the module or the image is not available in
      // time, fall back to the plain zoom above.
      (async () => {
        try {
          const cloth = await loadCloth();
          if (!cloth.supportsCloth()) throw new Error("webgl");
          const image = await loadTextureImage(src);

          const host = document.createElement("div");
          host.id = OVERLAY_ID;
          host.setAttribute("aria-hidden", "true");
          Object.assign(host.style, {
            position: "fixed",
            inset: "0",
            zIndex: "60",
            pointerEvents: "none",
          });
          document.body.appendChild(host);

          const handle = cloth.playCloth({
            host,
            image,
            from: rect,
            onCovered: () => router.push(href),
          });
          activeCloth = handle;

          // The sheet now sits over the card; hide the card so nothing is
          // left behind as it lifts off.
          frame.style.visibility = "hidden";
          hiddenFrame = frame;
        } catch {
          zoom();
        }
      })();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // The route has changed: fade the covering image away to reveal the page.
  useEffect(() => {
    const overlay = document.getElementById(OVERLAY_ID);
    const cloth = activeCloth;
    if (overlay && cloth) {
      // Cloth: once the new page has rendered beneath it, the sheet is
      // pulled off to the right, revealing the project.
      activeCloth = null;
      window.setTimeout(() => {
        void cloth.flyAway().then(() => {
          cloth.dispose();
          if (hiddenFrame) {
            hiddenFrame.style.visibility = "";
            hiddenFrame = null;
          }
          overlay.remove();
          busy.current = false;
        });
      }, 200);
    } else if (overlay) {
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.6,
        delay: 0.2,
        ease: "power2.out",
        onComplete: () => {
          if (hiddenFrame) {
            hiddenFrame.style.visibility = "";
            hiddenFrame = null;
          }
          overlay.remove();
          busy.current = false;
        },
      });
    }

    // Warm up the cloth effect while the visitor looks at the projects, so
    // a click does not wait for it to download.
    if (document.querySelector("a[data-transition]")) {
      const idle =
        window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
      idle(() => void loadCloth().catch(() => {}));
    }

    // The ink curtain from the homepage hero (slices/Hero/ScrollToWorks).
    // It matches the Works background exactly, so it can linger a beat and
    // then melt away slowly, letting the projects surface out of the ink.
    const curtain = document.getElementById("page-curtain");
    if (curtain) {
      gsap.to(curtain, {
        autoAlpha: 0,
        duration: 0.6,
        delay: 0.05,
        ease: "power2.out",
        onComplete: () => curtain.remove(),
      });
    }
  }, [pathname]);

  return null;
}
