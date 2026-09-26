import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import ProjectGallery from "./ProjectGallery";

type Params = { uid: string };

/**
 * Work details, from the Figma "Work details" frame at 1728:
 *   text column x=168 w=373, bottom-aligned with the screenshots
 *   screenshots 1033x603 on white, 116 apart, starting at x=655
 *   row bottom 240px above the frame bottom
 *   bars bottom centre, P - 1..6 pager bottom right
 *
 * On desktop the section pins and the screenshot strip slides left through a
 * window that begins at the text column's edge, so the text stays readable.
 * The bars track which screenshot is in view. The pager jumps between
 * projects in their Works order.
 *
 * Below 1024: no pin, text first, screenshots stacked.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;
  const client = createClient();

  const [project, projects] = await Promise.all([
    client.getByUID("project", uid).catch(() => null),
    client.getAllByType("project", {
      orderings: [{ field: "my.project.order" }],
    }),
  ]);
  if (!project) notFound();

  const gallery = project.data.gallery.filter((item) =>
    isFilled.image(item.image)
  );

  return (
    <section
      data-surface="blush"
      className="relative bg-blush text-ink lg:h-svh lg:overflow-hidden"
    >
      <ProjectGallery count={gallery.length}>
        <div className="flex flex-col gap-12 px-[var(--gutter)] pb-10 pt-[120px] lg:absolute lg:inset-x-0 lg:bottom-[22.2svh] lg:flex-row lg:items-end lg:gap-0 lg:p-0 lg:pl-[9.72vw]">
          <div className="flex w-full max-w-[373px] flex-col gap-[42px] lg:w-[max(21.59vw,280px)] lg:max-w-none lg:shrink-0">
            <div className="flex flex-col gap-[19px]">
              <div data-animate="detail" className="flex flex-col gap-[2px]">
                <h1 className="text-[22px] font-bold leading-tight">
                  {project.data.title}
                </h1>
                {project.data.year ? <p>{project.data.year}</p> : null}
              </div>

              {isFilled.richText(project.data.summary) ? (
                <div data-animate="detail">
                  <PrismicRichText field={project.data.summary} />
                </div>
              ) : null}
            </div>

            {isFilled.link(project.data.visit_url) ? (
              <PrismicNextLink
                field={project.data.visit_url}
                data-animate="detail"
                className="inline-flex items-center gap-[2px] self-start text-[15px] font-bold leading-none hover:opacity-60"
              >
                Visit website
                <ArrowUpRight />
              </PrismicNextLink>
            ) : null}
          </div>

          {/* The window. Vertical padding lets the card shadows breathe;
              the matching negative margin keeps the bottom edges aligned
              with the text column. */}
          <div
            data-gallery="window"
            className="w-full lg:-my-[60px] lg:min-w-0 lg:flex-1 lg:overflow-hidden lg:py-[60px]"
          >
            <div
              data-gallery="strip"
              className="flex flex-col gap-8 lg:w-max lg:flex-row lg:gap-[6.71vw] lg:pl-[6.6vw] lg:pr-[2.31vw]"
            >
              {gallery.map((item, i) => (
                <div
                  key={i}
                  className="relative aspect-[1033/603] w-full shrink-0 overflow-hidden bg-white shadow-[8px_3px_39px_7px_rgba(150,150,150,0.2)] lg:h-[min(34.9vw,62svh)] lg:w-auto"
                >
                  <PrismicNextImage
                    field={item.image}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {gallery.length > 1 ? (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-end gap-[9px] lg:flex"
          >
            {gallery.map((_, i) => (
              <span
                key={i}
                data-gallery="bar"
                data-active={i === 0}
                className="h-2.5 w-[3px] bg-ink transition-all duration-300 data-[active=true]:h-4"
              />
            ))}
          </div>
        ) : null}

        <nav
          aria-label="Projects"
          className="flex items-center gap-[2px] px-[var(--gutter)] pb-10 text-[14px] font-bold leading-none text-umber lg:absolute lg:bottom-6 lg:right-[var(--gutter)] lg:p-0"
        >
          <span className="tracking-[-0.06em]">P</span>
          <span className="tracking-[-0.06em]">-</span>
          <ul className="ml-[2px] flex items-center gap-2">
            {projects.map((p, i) => (
              <li key={p.id}>
                <PrismicNextLink
                  document={p}
                  aria-current={p.id === project.id ? "page" : undefined}
                  aria-label={p.data.title ?? `Project ${i + 1}`}
                  className={
                    p.id === project.id
                      ? "text-umber"
                      : "text-black/10 transition-colors hover:text-umber"
                  }
                >
                  {i + 1}
                </PrismicNextLink>
              </li>
            ))}
          </ul>
        </nav>
      </ProjectGallery>
    </section>
  );
}

/**
 * The Figma arrow icon, from public/icons/right-up-arrow.svg. Inlined with
 * currentColor so it follows the link's colour and hover state.
 */
function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.66797 4.66699H11.3346V11.3337" />
      <path d="M4.66797 11.3337L11.3346 4.66699" />
    </svg>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const projects = await client.getAllByType("project");
  return projects.map((project) => ({ uid: project.uid }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const project = await client.getByUID("project", uid).catch(() => null);
  return { title: project?.data.title ?? "Project" };
}
