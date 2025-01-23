import Head from "next/head";
import { InitialPageMetaProps } from "./MetaData.type";
import { serviceUrl } from "@/constants/serviceurl";

export function InitialPageMeta({ title, url }: InitialPageMetaProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="og:url" content={url ?? serviceUrl} />
    </Head>
  );
}
