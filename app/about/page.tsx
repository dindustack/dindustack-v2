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

export const metadata: Metadata = { title: "About" };
