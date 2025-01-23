import Queue from "@/components/Queue";
import { serviceUrl } from "@/constants/serviceurl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { InitialPageMeta } from "@/components/MetaData";

export default function QueuePage() {
  const router = useRouter();
  const [OGTitle] = useState("MOSAICSEOUL WAITING");
  const [OGUrl, setOGUrl] = useState(serviceUrl);

  useEffect(() => {
    setOGUrl(serviceUrl + router.asPath);
  }, [router.asPath]);

  return (
    <>
      <InitialPageMeta title={OGTitle} url={OGUrl} />
      <Queue />
    </>
  );
}
