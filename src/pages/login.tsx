import Login from "@/components/Login";
import { serviceUrl } from "@/constants/serviceurl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { InitialPageMeta } from "@/components/MetaData";

export default function LoginPage() {
  const router = useRouter();
  const [OGTitle] = useState("LOGIN | MOSAICSEOUL WAITING");
  const [OGUrl, setOGUrl] = useState(serviceUrl);

  useEffect(() => {
    setOGUrl(serviceUrl + router.asPath);
  }, [router.asPath]);

  return (
    <>
      <InitialPageMeta title={OGTitle} url={OGUrl} />
      <Login />
    </>
  );
}
