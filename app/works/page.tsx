import type { Metadata } from "next";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function WorksPage() {
  const client = createClient();
  const page = await client.getSingle("works_page");

  return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle("works_page");

  return {
    title: page.data.meta_title || "Works",
    description: page.data.meta_description,
    openGraph: page.data.meta_image.url
      ? { images: [{ url: page.data.meta_image.url }] }
      : undefined,
  };
}