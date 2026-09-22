import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function Works() {
  const client = createClient();
  const page = await client.getSingle("works");

  return <SliceZone slices={page.data.slices} components={components} />;
}
