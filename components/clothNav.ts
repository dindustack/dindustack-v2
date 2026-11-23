import type { ClothHandle } from "./clothTransition";

/**
 * Shared plumbing for the cloth page transition, used by both ways of
 * opening a project: clicking a Works card (PageTransition) and scrolling
 * past the end of a project to the next one (NextProject).
 *
 * The cloth itself (and three.js) is loaded on demand, so it never weighs
 * on a page's first load.
 */

/** Same id as the zoom overlay, so PageTransition finds either one. */
export const OVERLAY_ID = "page-transition";

type ClothModule = typeof import("./clothTransition");
let clothModule: Promise<ClothModule> | null = null;
export const loadCloth = () => (clothModule ??= import("./clothTransition"));

/** The running sheet, handed to PageTransition to fly away on the new page. */
let activeCloth: ClothHandle | null = null;
export function takeActiveCloth() {
  const cloth = activeCloth;
  activeCloth = null;
  return cloth;
}

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
 * Lifts `src` as cloth from the `from` box to fill the screen and calls
 * onCovered when it lies flat over everything. Resolves false, having shown
 * nothing, if WebGL, the module or the image is not available, so the
 * caller can fall back to its plain zoom.
 */
export async function startCloth({
  from,
  src,
  onCovered,
}: {
  from: { left: number; top: number; width: number; height: number };
  src: string;
  onCovered: () => void;
}): Promise<boolean> {
  try {
    const cloth = await loadCloth();
    if (!cloth.supportsCloth()) return false;
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

    activeCloth = cloth.playCloth({ host, image, from, onCovered });
    return true;
  } catch {
    return false;
  }
}
