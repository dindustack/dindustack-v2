import { Content, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import AboutMotion from "./AboutMotion";

export type AboutProps = SliceComponentProps<Content.AboutSlice>;

/**
 * Measured at 1728: prose column 452px at x=278, image column 540px at x=911,
 * both 772px tall starting at y=164. The image column's contents run to roughly
 * 4545px, so it is a masked window the images travel through, not a stack.
 */
const About = ({ slice }: AboutProps) => {
  const isInk = slice.primary.surface === "ink";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={`content-shell flex min-h-svh items-center py-24 lg:py-0 ${
        isInk ? "bg-ink text-white" : "bg-blush text-ink"
      }`}
    >
      <AboutMotion>
        <div className="mx-auto flex w-full max-w-[1170px] flex-col gap-16 lg:flex-row lg:items-start lg:justify-between lg:gap-[181px]">
          <div
            data-about="prose"
            className="flex w-full flex-col gap-[18px] text-[19px] leading-[1.45] lg:w-[452px]"
          >
            {slice.primary.paragraphs.map((item, i) =>
              isFilled.richText(item.text) ? (
                <div data-animate="paragraph" key={i}>
                  <PrismicRichText field={item.text} />
                </div>
              ) : null
            )}
          </div>

          {/*
            The window. Fixed height on desktop so the track can travel through
            it; below lg it becomes a natively scrollable strip instead, because
            a pinned scrub has nowhere to go on a short viewport.
          */}
          <div
            data-about="window"
            className="w-full snap-y snap-mandatory overflow-y-auto lg:h-[min(772px,71svh)] lg:w-[540px] lg:overflow-hidden"
          >
            <div data-about="track" className="flex flex-col gap-[45px]">
              {slice.primary.images.map((item, i) =>
                isFilled.image(item.image) ? (
                  <div
                    key={i}
                    className="relative aspect-[3/4] w-full shrink-0 snap-start overflow-hidden"
                  >
                    <PrismicNextImage
                      field={item.image}
                      fill
                      sizes="(min-width: 1024px) 540px, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      </AboutMotion>
    </section>
  );
};

export default About;
