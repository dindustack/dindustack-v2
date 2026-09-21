import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function About() {
  const client = createClient();
  const page = await client.getSingle("about");

  return <SliceZone slices={page.data.slices} components={components} />;
}
