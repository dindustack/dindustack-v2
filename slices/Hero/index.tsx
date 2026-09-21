import { FC } from "react";
import { Content, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import HeroMotion from "./HeroMotion";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero: FC<HeroProps> = ({ slice }) => {
  const isInk = slice.primary.surface === "ink";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      data-surface={isInk ? "ink" : "blush"}
      className={`page-gutter flex min-h-svh flex-col ${
        isInk ? "bg-ink text-white" : "bg-blush text-ink"
      }`}
    >
      <HeroMotion>
        <div className="flex flex-1 items-center justify-center py-32">
          <div className="flex w-full max-w-272 flex-col items-center gap-12 lg:flex-row lg:gap-24">
            {isFilled.richText(slice.primary.intro_left) ? (
              <div
                data-animate="intro"
                className="order-2 w-full text-[16px] leading-5.75 lg:order-1 lg:w-72.5"
              >
                <PrismicRichText field={slice.primary.intro_left} />
              </div>
            ) : null}

            {isFilled.image(slice.primary.portrait) ? (
              <div
                data-animate="portrait"
                className="relative order-1 aspect-316/393 w-65 shrink-0 overflow-hidden bg-rose lg:order-2 lg:w-79"
              >
                <PrismicNextImage
                  field={slice.primary.portrait}
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 316px, 260px"
                  className="object-cover"
                />
              </div>
            ) : null}

            {isFilled.richText(slice.primary.intro_right) ? (
              <div
                data-animate="intro"
                className="order-3 w-full text-[16px] leading-5.75 lg:w-72.5"
              >
                <PrismicRichText field={slice.primary.intro_right} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Full bleed within the gutter. Never allowed to wrap: the
            composition depends on the name spanning gutter to gutter. */}
        <div className="overflow-hidden pb-[11svh]">
          <h1 data-animate="name" className="hero-name">
            {slice.primary.name}
          </h1>
        </div>
      </HeroMotion>
    </section>
  );
};

export default Hero;