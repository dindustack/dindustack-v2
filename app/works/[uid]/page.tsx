import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { createClient } from "@/prismicio";

type Params = { uid: string };

/**
 * Placeholder detail view so project links resolve. It renders the right
 * content in a plain stack. The designed Work details layout, with its pinned
 * horizontal strip of screenshots, replaces the body of this page next.
 */
export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;
  const client = createClient();
  const project = await client
    .getByUID("project", uid)
    .catch(() => notFound());

  return (
    <main
      data-surface="blush"
      className="page-gutter min-h-svh bg-blush pb-24 pt-[120px] text-ink"
    >
      <div className="max-w-[373px]">
        <h1 className="font-display text-heading tracking-[var(--tracking-heading)]">
          {project.data.title}
        </h1>
        <p className="mt-2 opacity-50">
          {[project.data.year, project.data.category].filter(Boolean).join(" - ")}
        </p>

        {isFilled.richText(project.data.summary) ? (
          <div className="mt-8">
            <PrismicRichText field={project.data.summary} />
          </div>
        ) : null}

        {isFilled.link(project.data.visit_url) ? (
          <PrismicNextLink
            field={project.data.visit_url}
            className="mt-6 inline-block underline underline-offset-4"
          >
            Visit site
          </PrismicNextLink>
        ) : null}
      </div>

      <div className="mt-16 flex flex-col gap-10">
        {project.data.gallery.map((item, i) =>
          isFilled.image(item.image) ? (
            <div key={i} className="relative aspect-[1033/603] w-full max-w-[1033px]">
              <PrismicNextImage
                field={item.image}
                fill
                sizes="(min-width: 1080px) 1033px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null
        )}
      </div>
    </main>
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
