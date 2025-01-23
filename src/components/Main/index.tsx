import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createQueue } from "@/services/queueService";
import { useAuth } from "@/hooks/useAuth";
import { serviceUrl } from "@/constants/serviceurl";
import styles from "./Main.module.scss";
import Button from "../Button";
import Input from "../Input";
import Image from "next/image";
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { firestore } from "@/firebase/firebase";

const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeCanvas), {
  ssr: false,
});

export default function Main() {
  const { user, logout } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [maxQueues, setMaxQueues] = useState(0);
  const [qrValue, setQrValue] = useState("");

  const handleCreateQueue = async () => {
    if (user) {
      const id = await createQueue(user.uid, storeName, maxQueues);
      setQrValue(`${serviceUrl}/queue/${id}`);

      // 큐 생성 후 Firebase에서 리셋 상태 확인
      const queueSnapshot = await getDoc(doc(firestore, "users", user.uid, "queues", id));
      const queueData = queueSnapshot.data();

      if (queueData && queueData.lastReset) {
        // 마지막 리셋 시간 이후로 대기열을 새로 시작했는지 확인
        const lastReset = queueData.lastReset.toDate();
        const now = new Date();
        const resetTime = new Date(now.setHours(7, 0, 0, 0)); // 현재 7시로 설정
        if (lastReset < resetTime) {
          // 대기열을 초기화하고 시작
          await updateDoc(doc(firestore, "users", user.uid, "queues", id), {
            currentNumber: 0,
            activeQueues: 0,
          });
        }
      }
    }
  };

  const handleCloseOverlay = () => {
    setQrValue("");
  };

  return (
    <div className={styles.container}>
      <Link href="/">
        <Image
          src="/image/mosaic.jpg"
          width={120}
          height={120}
          alt="logo"
          style={{ cursor: "pointer" }}
        />
      </Link>
      <h1 className={styles.title}>MOSAICSEOUL WAITING</h1>
      <div className={styles.section}>
        {user ? (
          <>
            <p className={styles.email}>{user.email}</p>
            <Input
              placeholder="매장 이름 (WEST | EAST)"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            <Input
              isNumber
              placeholder="최대 대기 인원 수(숫자만)"
              value={maxQueues || ""}
              onChange={(e) => {
                const value = e.target.value;
                setMaxQueues(value === "" ? 0 : Number(value));
              }}
            />
            <div className={styles.btns}>
              <Button onClick={handleCreateQueue}>대기열 생성</Button>
              <Button onClick={logout} isLight>
                로그아웃
              </Button>
            </div>
            {qrValue && (
              <div className={styles.overlay}>
                <div className={styles.overlayContent}>
                  <QRCode value={qrValue} />
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
          </>
        ) : (
          <Link href="/login">
            <Button>로그인</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
