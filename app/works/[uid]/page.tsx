import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asImageSrc, isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";
import ProjectGallery from "./ProjectGallery";
import NextProject from "./NextProject";
import ProjectNumber from "./ProjectNumber";
import BlurUpImage from "@/components/BlurUpImage";

type Params = { uid: string };

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
    isFilled.image(item.image),
  );

  // Projects lead on to the next one in Works order. The last project has
  // none, so it ends with the footer instead.
  const position = projects.findIndex((p) => p.id === project.id);
  const next = position >= 0 ? projects[position + 1] : undefined;

  return (
    <>
      <section
        data-surface="blush"
        className="relative bg-blush text-ink lg:h-svh lg:overflow-hidden"
      >
        <ProjectGallery count={gallery.length}>
          {/* Big pale title behind the page, top left; the screenshots
              pass over it. Decorative: the real heading is in the column. */}
          <p
            aria-hidden
            className="pointer-events-none absolute left-[3.94vw] top-0 hidden whitespace-nowrap font-bold text-[14.47vw] leading-[1.15] tracking-[-0.04em] text-[#e8d9d4] lg:block"
          >
            {project.data.title}
          </p>

          <div className="flex flex-col gap-12 px-[var(--gutter)] pb-10 pt-30 lg:absolute lg:inset-x-0 lg:bottom-[17.5svh] lg:flex-row lg:items-start lg:gap-0 lg:p-0 lg:pl-[3.94vw]">

            <div className="flex w-full max-w-102.5 flex-col gap-10.5 lg:w-[max(23.73vw,300px)] lg:max-w-none lg:shrink-0 lg:gap-[9.26vw] lg:pt-[3.125vw]">

              <div className="flex flex-col gap-4.75">
                <div data-animate="detail" className="flex flex-col gap-6">
                  <h1 className="font-bold text-[clamp(40px,3.7vw,64px)] leading-[0.9] tracking-[-0.04em] text-[#222]">
                    {project.data.title}
                  </h1>
                  {project.data.year ? (
                    <p className="text-[24px] leading-none">{project.data.year}</p>
                  ) : null}
                </div>

                {isFilled.richText(project.data.summary) ? (
                  <div data-animate="detail" className="text-prose leading-[1.45]">
                    <PrismicRichText field={project.data.summary} />
                  </div>
                ) : null}
              </div>

              {isFilled.link(project.data.visit_url) ? (
                <PrismicNextLink
                  field={project.data.visit_url}
                  data-animate="detail"
                  className="-my-1.5 inline-flex items-center gap-1 self-start py-1.5 text-[15px] font-bold uppercase leading-none tracking-[0.04em] hover:opacity-60"
                >
                  Visit website
                  <ArrowUpRight />
                </PrismicNextLink>
              ) : null}
            </div>

            <div
              data-gallery="window"
              className="w-full lg:-my-15 lg:ml-[2.5vw] lg:min-w-0 lg:flex-1 lg:overflow-hidden lg:py-15 lg:[-webkit-mask-image:linear-gradient(to_right,transparent,black_1.1vw)] lg:mask-[linear-gradient(to_right,transparent,black_1.1vw)]"
            >
              <div
                data-gallery="strip"
                className="flex flex-col gap-8 lg:w-max lg:flex-row lg:gap-[6.71vw] lg:pl-[4.1vw] lg:pr-[2.31vw]"
              >
                {gallery.map((item, i) => (
                  <div
                    key={i}
                    className="relative aspect-1033/603 w-full shrink-0 overflow-hidden bg-white shadow-[8px_3px_39px_7px_rgba(150,150,150,0.2)] lg:h-[min(34.9vw,62svh)] lg:w-auto"
                  >
                    <BlurUpImage
                      field={item.image}
                      eager={i === 0}
                      sizes="(min-width: 1024px) 60vw, 100vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/*
            Thumbnails of the screenshots, bottom right. Each scrolls the
            strip to its screenshot (ProjectGallery wires the clicks and
            marks the one in view). Desktop only: below lg the screenshots
            simply stack.
          */}
          {gallery.length > 1 ? (
            <ul
              aria-label="Screenshots"
              className="absolute bottom-4.25 right-[var(--gutter)] hidden items-end gap-0.75 lg:flex"
            >
              {gallery.map((item, i) => (
                <li key={i}>
                  <button
                    type="button"
                    data-gallery="thumb"
                    data-index={i}
                    aria-current={i === 0 ? "true" : undefined}
                    aria-label={`Show screenshot ${i + 1} of ${gallery.length}`}
                    className="relative block h-11.5 w-19.75 cursor-pointer overflow-hidden rounded-[2px] opacity-35 transition-opacity duration-300 hover:opacity-100 aria-[current=true]:opacity-100"
                  >
                    <PrismicNextImage
                      field={item.image}
                      fill
                      alt=""
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {/* Big project number, bottom left above the pager. It rolls
              from the previous project's number on arrival. */}
          {position >= 0 ? <ProjectNumber value={position + 1} /> : null}

          <nav
            aria-label="Projects"
            className="flex items-center gap-0.5 px-[var(--gutter)] pb-10 text-[14px] font-bold leading-none text-umber lg:absolute lg:bottom-6 lg:left-[3.94vw] lg:p-0"
          >
            <span aria-hidden className="tracking-nav">Project</span>
            <span aria-hidden className="mx-1 h-px w-23 bg-umber" />
            {/* Each number is a 24px target; the boxes touch, which keeps
                the numbers evenly spaced without extra gap. */}
            <ul className="flex items-center">
              {projects.map((p, i) => (
                <li key={p.id}>
                  <PrismicNextLink
                    document={p}
                    aria-current={p.id === project.id ? "page" : undefined}
                    aria-label={`Project ${i + 1}${p.data.title ? `: ${p.data.title}` : ""}`}
                    className={`inline-flex h-6 min-w-6 items-center justify-center ${
                      p.id === project.id
                        ? "text-umber"
                        : "text-black/60 transition-colors hover:text-umber"
                    }`}
                  >
                    {i + 1}
                  </PrismicNextLink>
                </li>
              ))}
            </ul>
          </nav>
        </ProjectGallery>
      </section>

      {next?.url && isFilled.image(next.data.cover) ? (
        <NextProject
          href={next.url}
          image={asImageSrc(next.data.cover, { w: 2400 }) ?? ""}
        />
      ) : null}
    </>
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
      strokeWidth={1.25}
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
