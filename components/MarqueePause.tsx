"use client";

import { useState } from "react";

/**
 * Stops and restarts the footer's moving email line. Anything that moves on
 * its own for more than five seconds needs a way to stop it (WCAG 2.2.2).
 * It sets a flag on the footer that globals.css reads.
 */
export default function MarqueePause() {
  const [paused, setPaused] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={(e) => {
        const next = !paused;
        setPaused(next);
        e.currentTarget
          .closest("footer")
          ?.toggleAttribute("data-marquee-paused", next);
      }}
      className="cursor-pointer transition-opacity hover:opacity-60 motion-reduce:hidden"
    >
      {paused ? "Play motion" : "Pause motion"}
    </button>
  );
}
