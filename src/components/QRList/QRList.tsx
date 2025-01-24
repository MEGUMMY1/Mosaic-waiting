import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";
import dynamic from "next/dynamic";
import Link from "next/link";
import { serviceUrl } from "@/constants/serviceurl";
import styles from "./QRList.module.scss";
import Image from "next/image";
import { deleteQueue } from "@/services/queueService";
import firebase from "firebase/compat/app";

const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeCanvas), {
  ssr: false,
});

interface QueueData {
  id: string;
  date: firebase.firestore.Timestamp;
  formattedDate: string;
  storeName: string;
  maxQueues: number;
}

export default function QRList() {
  const [qrCodes, setQRCodes] = useState<QueueData[]>([]);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCodes = async () => {
      const queuesRef = collection(firestore, "dailyQueues");
      const q = query(queuesRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);

      const codes: QueueData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        formattedDate: doc.data().date.toDate().toLocaleDateString(),
      })) as QueueData[];

      setQRCodes(codes);
    };

    fetchQRCodes();
  }, []);

  const handleQRView = (queueId: string) => {
    setSelectedQR(`${serviceUrl}/queue/${queueId}`);
  };

  const handleDeleteQueue = async (queueId: string) => {
    const confirmed = window.confirm("이 QR 코드를 삭제하시겠습니까?");
    if (confirmed) {
      const success = await deleteQueue(queueId);
      if (success) {
        setQRCodes((prev) => prev.filter((queue) => queue.id !== queueId));
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleCloseOverlay = () => {
    setSelectedQR(null);
  };

  return (
    <div className={styles.container}>
      <Link href="/">
        <Image
          src="/image/left.svg"
          width={40}
          height={40}
          alt="뒤로가기"
          className={styles.backBtn}
        />
      </Link>
      <Link href="/">
        <Image src="/image/mosaic.jpg" width={120} height={120} alt="logo" />
      </Link>
      <h1 className={styles.title}>QR 코드 목록</h1>
      <div className={styles.tableContainer}>
        <table className={styles.qrTable}>
          <thead>
            <tr>
              <th>날짜</th>
              <th>QR 코드</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {qrCodes.map((queue) => (
              <tr key={queue.id}>
                <td>{queue.formattedDate}</td>
                <td>
                  <button onClick={() => handleQRView(queue.id)} className={styles.btn}>
                    QR 보기
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDeleteQueue(queue.id)} className={styles.btn}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedQR && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <QRCode value={selectedQR} />
            <Image
              src="/image/x-full.svg"
              width={40}
              height={40}
              alt="닫기"
              className={styles.closeBtn}
              onClick={handleCloseOverlay}
            />
          </div>
        </div>
      )}
    </div>
  );
}
