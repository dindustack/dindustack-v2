import { FC } from "react";
import { Content, asHTML, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import HeroMotion from "./HeroMotion";
import ScrollToWorks from "./ScrollToWorks";

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
      {/* First scroll down leaves for the Works page. */}
      <ScrollToWorks />
      <HeroMotion>
        <div className="flex flex-1 items-center justify-center py-32 lg:absolute lg:inset-x-0 lg:top-[24svh] lg:py-0">
          <div className="flex w-full max-w-272 flex-col items-center gap-12 lg:flex-row lg:gap-24">
            {isFilled.richText(slice.primary.intro_left) ? (
              <div
                data-animate="intro"
                data-intro
                className="order-2 w-full text-[16px] leading-5.75 lg:order-1 lg:w-72.5 lg:text-[18px] lg:leading-normal"
              >
                {/* Static HTML, not React children: the entrance splits this
                    text into letters, and React must not be tracking nodes
                    that the split replaces (see escapeHTML below). */}
                <div dangerouslySetInnerHTML={{ __html: asHTML(slice.primary.intro_left) }} />
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
                data-intro
                className="order-3 w-full text-[16px] leading-5.75 lg:w-72.5 lg:text-[18px] lg:leading-normal"
              >
                <div dangerouslySetInnerHTML={{ __html: asHTML(slice.primary.intro_right) }} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-auto pb-[11svh] lg:pb-[4svh]">
          {/* Clips the letters as they rise. No padding of its own, so a
              letter waiting below is fully out of sight. */}
          <div className="hero-name-clip">
            <h1
              data-animate="name"
              data-intro
              className="hero-name"
              dangerouslySetInnerHTML={{ __html: escapeHTML(slice.primary.name ?? "") }}
            />
          </div>
        </div>
      </HeroMotion>
    </section>
  );
};

/**
 * The name and write-up are split into letters by GSAP's SplitText, which
 * swaps out their text nodes and later puts fresh ones back. If React still
 * owned those nodes it would try to remove ones that are no longer there
 * ("Node.removeChild: The node to be removed is not a child of this node").
 * Rendering them as static HTML keeps React out of their insides.
 */
function escapeHTML(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default Hero;