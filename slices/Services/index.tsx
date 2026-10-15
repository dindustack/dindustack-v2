"use client";

import { useRef, useState } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type ServicesProps = SliceComponentProps<Content.ServicesSlice>;

/**
 * "What i do". One sentence names every service; on desktop the section pins
 * and scrolling walks through them one at a time, lighting up that keyword and
 * swapping in its numbered row underneath. Below lg there is no pin: every
 * keyword stays lit and the rows stack as a plain list.
 */
const Services = ({ slice }: ServicesProps) => {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const services = slice.primary.services.filter((s) => s.keyword);
  const count = services.length;

  useGSAP(
    () => {
      if (count < 2) return;
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const section = root.current;
        if (!section) return;

        // Each service gets roughly two thirds of a screen of scrolling. The
        // pin starts with the section filling the screen and releases with its
        // bottom at the bottom of the screen, so the footer arrives straight
        // after without the two ever moving at once.
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${(count - 1) * window.innerHeight * 0.65}`,
          pin: section,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: (self) =>
            setActive(Math.min(count - 1, Math.floor(self.progress * count))),
        });

        return () => {
          st.kill();
          setActive(0);
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [count] }
  );

  return (
    <section
      ref={root}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="content-shell flex min-h-svh flex-col bg-blush py-24 text-ink lg:pt-[11.6svh] lg:pb-[7svh]"
    >
      <div className="mx-auto flex w-full max-w-373 flex-1 flex-col">
        {slice.primary.label ? (
          <p className="text-[18px] leading-[1.39] italic">
            {slice.primary.label}
          </p>
        ) : null}

        <p className="mt-10 font-display text-[clamp(2.5rem,5.1vw,5.5rem)] leading-[1.41] tracking-[-0.02em] lg:mt-[7svh]">
          I{" "}
          {services.map((service, i) => {
            const isActive = i === active;
            return (
              <span key={i}>
                {i > 0 ? ", " : ""}
                {i > 0 && i === count - 1 ? "and " : ""}
                {service.verb ? `${service.verb} ` : ""}
                <em
                  className={`font-accent font-light italic underline decoration-1 underline-offset-[0.14em] transition-[color,text-decoration-color] duration-500 ease-out motion-reduce:transition-none ${
                    isActive
                      ? "text-black decoration-black"
                      : "text-black decoration-black lg:text-black/12 lg:decoration-black/3"
                  }`}
                >
                  {service.keyword}
                </em>
              </span>
            );
          })}
          .
        </p>

        <div className="mt-16 lg:mt-auto">
          <div className="flex flex-col lg:grid lg:border-t lg:border-black/40">
            {services.map((service, i) => {
              const isActive = i === active;
              return (
                <div
                  key={i}
                  className={`border-t border-black/40 py-8 transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none lg:col-start-1 lg:row-start-1 lg:border-t-0 lg:pt-16 lg:pb-0 ${
                    isActive
                      ? "lg:translate-y-0 lg:opacity-100"
                      : "lg:pointer-events-none lg:translate-y-3 lg:opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                    <span className="text-[20px] leading-[1.15]">
                      ({String(i + 1).padStart(2, "0")})
                    </span>
                    <h3 className="text-[24px] leading-[1.1] tracking-[-0.01em] lg:ml-18 lg:text-[28px] lg:leading-[0.93]">
                      {service.title}
                    </h3>
                    <p className="max-w-130 text-[20px] leading-[1.33] tracking-[0.01em] italic lg:ml-36 lg:text-[24px]">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
