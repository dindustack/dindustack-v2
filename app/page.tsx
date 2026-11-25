import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function Home() {
  const client = createClient();
  const page = await client.getSingle("homepage");

  return <SliceZone slices={page.data.slices} components={components} />;
}

/** SEO from the homepage's Page data tab in Prismic. The title is used as
 *  written, without the "| Chinwendu Agbaetuo" the other pages get. */
export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle("homepage");

  return {
    title: { absolute: page.data.meta_title || "Chinwendu Agbaetuo" },
    description: page.data.meta_description || undefined,
    openGraph: page.data.meta_image.url
      ? { images: [{ url: page.data.meta_image.url }] }
      : undefined,
  };
}
