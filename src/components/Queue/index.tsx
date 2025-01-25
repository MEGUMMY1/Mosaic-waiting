import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, firestore } from "@/firebase/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "@firebase/firestore";
import { signInAnonymously } from "@firebase/auth";
import styles from "./Queue.module.scss";
import { formattedDate } from "@/util/formatDate";
import Link from "next/link";
import Image from "next/image";
import { activateQueue, getCurrentQueueStatus } from "@/services/queueService";

export default function Queue() {
  const router = useRouter();
  const { id } = router.query;
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotAllowed, setIsNotAllowed] = useState<boolean>(false);
  const [useDate, setUseDate] = useState<Date | null>(null);
  const date = new Date();

  useEffect(() => {
    const savedQueueNumber = localStorage.getItem("queueNumber");
    if (savedQueueNumber) {
      setQueueNumber(Number(savedQueueNumber));
      setIsLoading(false);
    }

    if (id) {
      const checkAccessAvailability = async () => {
        try {
          console.log("Queue id: ", id);
          const qrDocRef = doc(firestore, "dailyQueues", id as string);
          const qrDocSnap = await getDoc(qrDocRef);
          console.log("getDoc: ", qrDocSnap.exists());
          if (qrDocSnap.exists()) {
            const qrData = qrDocSnap.data();
            console.log("getDoc: ", qrDocSnap.data());

            // 현재 시간을 오전 7시로 고정
            const currentTime = new Date();
            const queueUseDate = new Date(currentTime);
            queueUseDate.setHours(7, 0, 0, 0); // 오전 7시로 설정

            // 날짜 비교: 현재 날짜가 대기 가능한 날짜인지
            const isCorrectDate =
              currentTime.getFullYear() === queueUseDate.getFullYear() &&
              currentTime.getMonth() === queueUseDate.getMonth() &&
              currentTime.getDate() === queueUseDate.getDate();

            const isAfter7AM = currentTime >= queueUseDate; // 오전 7시 이후인지 비교

            if (!isCorrectDate || !isAfter7AM) {
              setIsNotAllowed(true);
              setIsLoading(false);
              return;
            }

            // 큐 상태 가져오기
            const queueStatus = await getCurrentQueueStatus(id as string);
            console.log("큐 상태:", queueStatus);

            // 대기열에 추가
            const loginAsAnonymous = async () => {
              try {
                const user = await signInAnonymously(auth);
                await addUserToQueue(user.user.uid, id as string);
              } catch (error) {
                console.error("대기열에 추가하는 중 에러 발생:", error);
              } finally {
                setIsLoading(false);
              }
            };
            loginAsAnonymous();
          } else {
            console.error("QR 코드 데이터가 없습니다.");
            setIsNotAllowed(true);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("QR 코드 확인 중 에러 발생:", error);
          setIsNotAllowed(true);
          setIsLoading(false);
        }
      };

      checkAccessAvailability();
    }
  }, [id]);

  const addUserToQueue = async (userId: string, queueId: string) => {
    const queueRef = collection(firestore, "dailyQueues", queueId, "users");
    const q = query(queueRef, orderBy("queueNumber", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    const existingUser = querySnapshot.docs.find((doc) => doc.data().userId === userId);
    if (existingUser) {
      setQueueNumber(existingUser.data().queueNumber);
      localStorage.setItem("queueNumber", String(existingUser.data().queueNumber));
      return;
    }

    // 유저 수 기반으로 새로운 대기 번호 부여
    const newQueueNumber = querySnapshot.empty ? 1 : querySnapshot.docs[0].data().queueNumber + 1;

    await addDoc(queueRef, {
      userId,
      queueNumber: newQueueNumber,
      createdAt: new Date(),
    });

    // currentNumber와 activeQueues 갱신
    await updateQueueStatus(queueId, newQueueNumber);

    setQueueNumber(newQueueNumber);
    localStorage.setItem("queueNumber", String(newQueueNumber));

    // 해당 날짜가 되었을 때 대기열 활성화
    activateQueueIfNeeded(queueId);
  };

  const updateQueueStatus = async (queueId: string, newQueueNumber: number) => {
    const queueRef = doc(firestore, "dailyQueues", queueId);
    const queueSnap = await getDoc(queueRef);

    if (queueSnap.exists()) {
      const queueData = queueSnap.data();

      const updatedCurrentNumber = newQueueNumber; // 새로운 대기 번호 설정

      await updateDoc(queueRef, {
        currentNumber: updatedCurrentNumber,
      });
    }
  };

  const activateQueueIfNeeded = async (queueId: string) => {
    const queueRef = doc(firestore, "dailyQueues", queueId);
    const queueSnap = await getDoc(queueRef);

    if (queueSnap.exists()) {
      const queueData = queueSnap.data();
      const now = new Date();
      const startTime = queueData.startTime.toDate();

      // 현재 시간이 7시가 지나면 대기열 활성화
      if (now >= startTime && !queueData.isActive) {
        await activateQueue(queueId);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Link href="https://mosaicseoul.kr">
        <Image
          src="/image/mosaic.jpg"
          width={120}
          height={120}
          alt="logo"
          style={{ cursor: "pointer" }}
        />
      </Link>
      <h1 className={styles.title}>MOSAICSEOUL</h1>
      {!isNotAllowed && <h2 className={styles.title}>대기 순번</h2>}
      {isLoading ? (
        <p className={styles.loading}>대기 정보를 불러오는 중입니다...</p>
      ) : isNotAllowed ? (
        <p className={styles.warning}>오전 7시부터 대기가 가능합니다.</p>
      ) : queueNumber !== null ? (
        <>
          <p className={styles.message}>{queueNumber}번</p>
          <p className={styles.loading}>{formattedDate(date.toISOString())}</p>
          <p className={styles.loading}>캡쳐 후 대기하시는 걸 추천합니다.</p>
        </>
      ) : (
        <p className={styles.loading}>대기열에 없습니다.</p>
      )}
    </div>
  );
}
