import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  getCurrentQueueStatus,
  getYesterdayQueue,
  createNextDayQueue,
} from "@/services/queueService";
import { useAuth } from "@/hooks/useAuth";
import { serviceUrl } from "@/constants/serviceurl";
import styles from "./Main.module.scss";
import Button from "../Button";
import Image from "next/image";

const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeCanvas), {
  ssr: false,
});

export default function Main() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [qrValue, setQrValue] = useState("");
  const [queueStatus, setQueueStatus] = useState({
    maxQueues: 0,
    currentActiveQueues: 0,
    currentNumber: 0,
  });

  // 로그인한 사용자만 접근하도록 체크
  // useEffect(() => {
  //   if (!user || !user.email) {
  //     // 이메일 로그인한 사용자가 아니면 로그인 페이지로 리다이렉트
  //     router.replace("/login"); // `push` 대신 `replace` 사용
  //   }
  // }, [user, router]);

  useEffect(() => {
    const fetchQueueData = async () => {
      if (user) {
        const yesterdayQueue = await getYesterdayQueue();

        if (yesterdayQueue) {
          const queueId = yesterdayQueue.id;
          setQrValue(`${serviceUrl}/queue/${queueId}`);

          try {
            const status = await getCurrentQueueStatus(queueId);
            setQueueStatus(status);
          } catch (error) {
            alert("오전 7시부터 대기열 정보를 볼 수 있습니다.");
            setQueueStatus({
              maxQueues: 0,
              currentActiveQueues: 0,
              currentNumber: 0,
            });
          }
        } else {
          alert("어제 생성된 대기 QR코드가 없습니다.");
        }
      }
    };

    fetchQueueData();
  }, [user]);

  const handleCreateNextDayQueue = async () => {
    try {
      const queueId = await createNextDayQueue();
      alert("내일 날짜의 대기 QR코드가 생성되었습니다.");
      setQrValue(`${serviceUrl}/queue/${queueId}`);
    } catch (error) {
      console.error(error);
      alert("대기열 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
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
            <div className={styles.queueStatus}>
              <p className={styles.message}>현재 대기 번호: {queueStatus.currentNumber}번</p>
            </div>
            <div className={styles.btns}>
              <Button onClick={handleCreateNextDayQueue} isLight>
                (다음날) QR 생성
              </Button>
              <Link href="/qr-list">
                <Button>QR list</Button>
              </Link>
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
