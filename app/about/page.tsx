import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function About() {
  const client = createClient();
  const page = await client.getSingle("about");

  return (
    <>
      {/* The page's main heading, for screen readers and outlines. The
          design opens straight into the story, so it is not shown. */}
      <h1 className="sr-only">About</h1>
      <SliceZone slices={page.data.slices} components={components} />
    </>
  );
}

/** SEO from the About page's Page data tab in Prismic. */
export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle("about");

  return {
    title: page.data.meta_title || "About",
    description: page.data.meta_description || undefined,
    openGraph: page.data.meta_image.url
      ? { images: [{ url: page.data.meta_image.url }] }
      : undefined,
  };
}
