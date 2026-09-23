import { Content, isFilled } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import WorksMotion from "./WorksMotion";

export type WorksProps = SliceComponentProps<Content.WorksSlice>;

/**
 * One pinned section holding a horizontal track of project panels. Scrolling
 * down slides the track left; when it runs out, the pin releases and the next
 * section rises normally. The six Works frames in Figma are keyframes of this
 * sequence, one per project.
 *
 * Each panel shows its own cover plus a glimpse of the NEXT project's cover
 * at the right, bleeding past the panel edge. That second image is not a
 * secondary shot of the same project, it is the one coming up, and it links
 * straight to it.
 *
 * The last panel has no preview. Nothing follows it, so the empty right side
 * gives the sequence somewhere to end before the pin releases.
 *
 * Measured at 1728: cover 784x500 offset 26.4% from the left, preview 518x422
 * beside it. Heading and indicator sit outside the track so they hold still.
 */
const Works = async ({ slice }: WorksProps) => {
  const client = createClient();
  const projects = await client.getAllByType("project", {
    orderings: [{ field: "my.project.order" }],
  });

  if (projects.length === 0) return null;

  const isInk = slice.primary.surface !== "blush";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      data-surface={isInk ? "ink" : "blush"}
      className={`relative lg:h-svh lg:overflow-hidden ${
        isInk ? "bg-ink text-white" : "bg-blush text-ink"
      }`}
    >
      <WorksMotion count={projects.length}>
        <h2 className="font-display page-gutter pointer-events-none relative z-10 pt-[83px] text-heading tracking-[var(--tracking-heading)] lg:absolute lg:inset-x-0 lg:top-0">
          {slice.primary.heading}
        </h2>

        <div
          data-works="track"
          className="flex snap-x snap-mandatory overflow-x-auto lg:h-full lg:w-max lg:snap-none lg:overflow-visible"
        >
          {projects.map((project, i) => {
            const next = projects[i + 1];

            return (
              <article
                key={project.id}
                className="page-gutter relative flex min-h-[80svh] w-screen shrink-0 snap-start items-center lg:h-full"
              >
                <div className="flex w-full items-start gap-[3%]">
                  <div className="w-full lg:ml-[26.4%] lg:w-[47.1%]">
                    <PrismicNextLink document={project} className="group block">
                      {isFilled.image(project.data.cover) ? (
                        <div className="relative aspect-[784/500] w-full overflow-hidden">
                          <PrismicNextImage
                            field={project.data.cover}
                            fill
                            sizes="(min-width: 1024px) 47vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        </div>
                      ) : null}

                      <div className="pt-[19px]">
                        <p className="text-project">{project.data.title}</p>
                        <p className="text-[16px] opacity-50">
                          {[project.data.year, project.data.category]
                            .filter(Boolean)
                            .join(" - ")}
                        </p>
                      </div>
                    </PrismicNextLink>
                  </div>

                  {/* The next project, glimpsed. Clickable, so it can be
                      jumped to rather than scrolled to. */}
                  {next && isFilled.image(next.data.cover) ? (
                    <PrismicNextLink
                      document={next}
                      aria-label={`Next project: ${next.data.title}`}
                      className="group relative hidden aspect-[518/422] w-[31.1%] shrink-0 overflow-hidden opacity-90 transition-opacity duration-500 hover:opacity-100 lg:block"
                    >
                      <PrismicNextImage
                        field={next.data.cover}
                        fill
                        sizes="31vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </PrismicNextLink>
                  ) : null}
                </div>
              </article>
            );
          })}
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
