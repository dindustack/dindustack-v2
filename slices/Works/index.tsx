import type { CSSProperties } from "react";
import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import WorksMotion from "./WorksMotion";
import { layout } from "./layout";

export type WorksProps = SliceComponentProps<Content.WorksSlice>;

/**
 * One continuous row of projects, each appearing once. The project in focus
 * is large with its caption beneath; its neighbours are smaller, the previous
 * one partly off the left edge and the next partly off the right. Scrolling
 * brings each project into focus in turn, then the pin releases.
 *
 * Each card's position and size live in CSS custom properties (--l, --w,
 * --h, --o) that only the desktop classes read. The server writes them for
 * the first project in focus; the client rewrites them from a single scroll
 * value. Mobile ignores them and stacks the projects vertically.
 */
const Works = async ({ slice }: WorksProps) => {
  const client = createClient();
  const projects = await client.getAllByType("project", {
    orderings: [{ field: "my.project.order" }],
  });

  if (projects.length === 0) return null;

  const isInk = slice.primary.surface !== "blush";
  const initial = layout(0, projects.length);

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      data-surface={isInk ? "ink" : "blush"}
      className={`relative pb-16 lg:h-svh lg:overflow-hidden lg:pb-0 ${
        isInk
          ? // Faint hand-drawn pattern over ink. The faintness is baked into
            // the SVG's colour, so there is no overlay layer to sit on top of
            // the project cards. Swap the file to change the pattern.
            "bg-ink text-white [background-image:url(/patterns/works-print.svg)] [background-size:480px]"
          : "bg-blush text-ink"
      }`}
    >
      <WorksMotion count={projects.length}>
        <h2 className="font-display page-gutter relative z-10 pt-[83px] text-heading tracking-[var(--tracking-heading)]">
          {slice.primary.heading}
        </h2>

        <div
          data-works="row"
          className="mt-10 flex flex-col gap-12 px-[var(--gutter)] lg:absolute lg:inset-x-0 lg:top-[28%] lg:mt-0 lg:block lg:px-0"
        >
          {projects.map((project, i) => (
            <article
              key={project.id}
              data-works="card"
              style={
                {
                  "--l": `${initial[i].left}vw`,
                  "--w": `${initial[i].w}vw`,
                  "--h": `${initial[i].h}vw`,
                  "--o": initial[i].o,
                } as CSSProperties
              }
              className="w-full lg:absolute lg:left-[var(--l)] lg:top-0 lg:w-[var(--w)]"
            >
              <PrismicNextLink
                document={project}
                data-transition
                className="group block"
              >
                <div
                  data-transition-image
                  className="relative aspect-[784/500] w-full overflow-hidden lg:aspect-auto lg:h-[var(--h)]"
                >
                  {isFilled.image(project.data.cover) ? (
                    <PrismicNextImage
                      field={project.data.cover}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 1024px) 46vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>

                <div className="pt-[19px] lg:opacity-[var(--o)]">
                  <p className="text-project">{project.data.title}</p>
                  <p className="text-[16px] opacity-50">
                    {[project.data.year, project.data.category]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                </div>
              </PrismicNextLink>
            </article>
          ))}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-end gap-[9px] lg:flex"
        >
          {projects.map((_, i) => (
            <span
              key={i}
              data-works="bar"
              data-active={i === 0}
              className="h-2.5 w-[3px] bg-current opacity-50 transition-all duration-300 data-[active=true]:h-4 data-[active=true]:opacity-100"
            />
          ))}
        </div>
      </WorksMotion>
    </section>
  );
};

export default Works;
