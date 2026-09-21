import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import WorksMotion from "./WorksMotion";

export type WorksProps = SliceComponentProps<Content.WorksSlice>;

/**
 * Six separate full-viewport panels, not one pinned section you advance
 * through. The Figma file has six discrete 1084px Works frames, each with the
 * indicator in a different position, so each panel is its own scroll stop.
 *
 * That makes the indicator static per panel: panel three renders its third
 * bar tall. No JavaScript decides it.
 *
 * Measured at 1728: heading x=32 y=83; cover 784x500 at x=472 y=304; caption
 * at y=819; secondary 518x422 at x=1288, which runs 78px past the viewport.
 */
const Works = async ({ slice }: WorksProps) => {
  const client = createClient();
  const projects = await client.getAllByType("project", {
    orderings: [{ field: "my.project.order" }],
  });

  const isInk = slice.primary.surface !== "blush";

  return (
    <>
      {projects.map((project, i) => (
        <section
          key={project.id}
          data-slice-type={slice.slice_type}
          data-slice-variation={slice.variation}
          data-surface={isInk ? "ink" : "blush"}
          className={`page-gutter relative flex min-h-svh flex-col overflow-hidden ${
            isInk ? "bg-ink text-white" : "bg-blush text-ink"
          }`}
        >
          <WorksMotion>
            <h2 className="font-display pt-[83px] text-[var(--text-heading)] tracking-[var(--tracking-heading)]">
              {slice.primary.heading}
            </h2>

            <div className="relative mx-auto mt-auto mb-auto flex w-full max-w-[1664px] flex-col items-start gap-8 lg:flex-row lg:gap-[3%]">
              <div className="w-full lg:ml-[26.4%] lg:w-[47.1%]">
                {isFilled.image(project.data.cover) ? (
                  <PrismicNextLink
                    document={project}
                    data-animate="cover"
                    className="relative block aspect-[784/500] w-full overflow-hidden"
                  >
                    <PrismicNextImage
                      field={project.data.cover}
                      fill
                      sizes="(min-width: 1024px) 47vw, 100vw"
                      className="object-cover"
                    />
                  </PrismicNextLink>
                ) : null}

                <div data-animate="caption" className="pt-[19px]">
                  <p className="text-[var(--text-project)]">
                    {project.data.title}
                  </p>
                  <p className="text-[16px] opacity-50">
                    {project.data.year} - {project.data.category}
                  </p>
                </div>
              </div>

              {/* Bleeds past the right gutter on purpose. The section clips
                  it so the page never scrolls sideways. */}
              {isFilled.image(project.data.secondary) ? (
                <div
                  data-animate="secondary"
                  className="relative hidden aspect-[518/422] w-[31.1%] shrink-0 overflow-hidden opacity-90 sm:block"
                >
                  <PrismicNextImage
                    field={project.data.secondary}
                    fill
                    sizes="31vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div
              className="mx-auto flex items-end gap-[9px] pb-4"
              aria-label={`Project ${i + 1} of ${projects.length}`}
            >
              {projects.map((_, bar) => (
                <span
                  key={bar}
                  className={`w-[3px] bg-current ${
                    bar === i ? "h-4" : "h-2.5 opacity-50"
                  }`}
                />
              ))}
            </div>
          </WorksMotion>
        </section>
      ))}
    </>
  );
};

export default Works;
