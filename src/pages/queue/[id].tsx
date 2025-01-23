import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeCanvas), {
  ssr: false,
});

export default function QueuePage() {
  const router = useRouter();
  const { id } = router.query;
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    if (id) {
      setQrValue(`https://mosaic-waiting.vercel.app/queue/${id}`);
    }
  }, [id]);

  return (
    <div>
      <h1>대기열 QR 코드</h1>
      {qrValue && <QRCode value={qrValue} />}
    </div>
  );
}
