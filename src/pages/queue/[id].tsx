import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { firestore } from "@/firebase/firebase";
import { collection, getDocs } from "@firebase/firestore";

const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeCanvas), {
  ssr: false,
});

export default function QueuePage() {
  const router = useRouter();
  const { id, userId } = router.query;
  const [queueNumber, setQueueNumber] = useState(null);

  useEffect(() => {
    if (id && userId) {
      fetchQueueNumber(id as string, userId as string);
    }
  }, [id, userId]);

  const fetchQueueNumber = async (queueId: string, userId: string) => {
    const queueRef = collection(firestore, "queues", queueId, "users");
    const querySnapshot = await getDocs(queueRef);
    const user = querySnapshot.docs.find((doc) => doc.data().userId === userId);

    if (user) {
      setQueueNumber(user.data().queueNumber);
    }
  };

  return (
    <div>
      <h1>대기열 QR 코드</h1>
      {queueNumber ? <p>당신의 순번은 {queueNumber}번입니다.</p> : <p>대기열에 없습니다.</p>}

      <h2>대기열 QR 코드</h2>
      <QRCode value={`https://mosaic-waiting.vercel.app/queue/${id}?userId=${userId}`} />
    </div>
  );
}
