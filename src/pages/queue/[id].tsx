import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { auth, firestore } from "@/firebase/firebase";
import { collection, getDocs, query, orderBy, limit, addDoc } from "@firebase/firestore";
import { signInAnonymously } from "@firebase/auth";

const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeCanvas), {
  ssr: false,
});

export default function QueuePage() {
  const router = useRouter();
  const { id } = router.query;
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const loginAsAnonymous = async () => {
        const user = await signInAnonymously(auth);
        setUserId(user.user.uid);
        addUserToQueue(user.user.uid, id as string);
      };
      loginAsAnonymous();
    }
  }, [id]);

  const addUserToQueue = async (userId: string, queueId: string) => {
    const queueRef = collection(firestore, "queues", queueId, "users");
    const q = query(queueRef, orderBy("queueNumber", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    let newQueueNumber = 1;
    if (!querySnapshot.empty) {
      const lastUser = querySnapshot.docs[0];
      newQueueNumber = lastUser.data().queueNumber + 1;
    }

    await addDoc(queueRef, {
      userId,
      queueNumber: newQueueNumber,
      createdAt: new Date(),
    });

    setQueueNumber(newQueueNumber);
  };

  return (
    <div>
      <h1>대기열 QR 코드</h1>
      {queueNumber !== null ? (
        <p>당신의 순번은 {queueNumber}번입니다.</p>
      ) : (
        <p>대기열에 없습니다.</p>
      )}
      <h2>대기열 QR 코드</h2>
      <QRCode value={`https://your-website.com/queue/${id}`} />
    </div>
  );
}
