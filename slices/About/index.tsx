"use client";
import { Content, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import AboutMotion from "./AboutMotion";

export type AboutProps = SliceComponentProps<Content.AboutSlice>;

const About = ({ slice }: AboutProps) => {
  const isInk = slice.primary.surface === "ink";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={`content-shell flex min-h-svh items-start py-24 lg:pt-41 lg:pb-24 ${
        isInk ? "bg-ink text-white" : "bg-blush text-ink"
      }`}
    >
      <AboutMotion>
        <div className="mx-auto flex w-full max-w-292.5 flex-col gap-16 lg:flex-row lg:items-start lg:justify-between lg:gap-45.25">
          <div
            data-about="prose"
            className="flex w-full flex-col gap-4.5 text-prose leading-[1.45] lg:w-113"
          >
            {slice.primary.paragraphs.map((item, i) =>
              isFilled.richText(item.text) ? (
                <div data-animate="paragraph" key={i}>
                  <PrismicRichText field={item.text} />
                </div>
              ) : null,
            )}
          </div>

          {/*
            The window. Fixed height on desktop so the track can travel through
            it; below lg it becomes a natively scrollable strip instead, because
            a pinned scrub has nowhere to go on a short viewport.
          */}
          <div
            data-about="window"
            className="w-full snap-y snap-mandatory overflow-y-auto lg:h-[min(772px,71svh)] lg:w-135 lg:overflow-hidden"
          >
            <div data-about="track" className="flex flex-col gap-11.25">
              {slice.primary.images.map((item, i) =>
                isFilled.image(item.image) ? (
                  <div
                    key={i}
                    className="relative aspect-3/4 w-full shrink-0 snap-start overflow-hidden"
                  >
                    <PrismicNextImage
                      field={item.image}
                      fill
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      sizes="(min-width: 1024px) 540px, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </AboutMotion>
    </section>
  );
};

export default About;
