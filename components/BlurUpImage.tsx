"use client";

import { useEffect, useRef, useState } from "react";
import { ImageField, asImageSrc } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

/**
 * An image that shows a blurred preview instantly and sharpens as the real
 * one arrives. The preview is a tiny (32px) version from Prismic's image
 * service, a few hundred bytes, stretched and blurred to fill the frame.
 * When the full image has loaded it fades in over it while its own blur
 * clears, so the picture appears to come into focus.
 *
 * Fills its parent, which must be positioned and clip its overflow.
 */
export default function BlurUpImage({
  field,
  sizes,
  eager = false,
}: {
  field: ImageField;
  sizes: string;
  eager?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const preview = asImageSrc(field, { w: 32, q: 40 });

  // An image already in the browser cache can finish loading before React
  // attaches onLoad; catch that case on mount.
  useEffect(() => {
    const img = box.current?.querySelector<HTMLImageElement>("img[data-full]");
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div ref={box} className="absolute inset-0">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
        />
      ) : null}
      <PrismicNextImage
        field={field}
        fill
        data-full
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-[opacity,filter] duration-700 ease-out motion-reduce:transition-none ${
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
        }`}
      />
    </div>
  );
}
