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
} from "@firebase/firestore";
import { signInAnonymously } from "@firebase/auth";
import styles from "./Queue.module.scss";
import { formattedDate } from "@/util/formatDate";
import Link from "next/link";
import Image from "next/image";

export default function Queue() {
  const router = useRouter();
  const { id } = router.query;
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotAllowed, setIsNotAllowed] = useState<boolean>(false); // 사용 불가 여부
  const [useDate, setUseDate] = useState<Date | null>(null); // QR 코드 사용 날짜
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
          // QR 코드의 사용 날짜 가져오기
          const qrDocRef = doc(firestore, "queues", id as string);
          const qrDocSnap = await getDoc(qrDocRef);

          if (qrDocSnap.exists()) {
            const qrData = qrDocSnap.data();
            const qrUseDate = new Date(qrData.useDate); // QR의 사용 날짜
            setUseDate(qrUseDate);

            // 현재 시간과 QR 사용 날짜 비교
            const currentTime = new Date();
            const useStartTime = new Date(
              qrUseDate.getFullYear(),
              qrUseDate.getMonth(),
              qrUseDate.getDate(),
              7, // 사용 날짜의 오전 7시
              0,
              0
            );

            if (currentTime < useStartTime) {
              // 사용 날짜의 7시 이전이면 접속 불가
              setIsNotAllowed(true);
              setIsLoading(false);
              return;
            }
          } else {
            console.error("QR 코드 데이터가 없습니다.");
            setIsNotAllowed(true);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("QR 코드 확인 중 에러 발생:", error);
          setIsNotAllowed(true);
          setIsLoading(false);
          return;
        }

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
      };

      checkAccessAvailability();
    }
  }, [id]);

  const addUserToQueue = async (userId: string, queueId: string) => {
    const queueRef = collection(firestore, "queues", queueId, "users");
    const q = query(queueRef, orderBy("queueNumber", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    const existingUser = querySnapshot.docs.find((doc) => doc.data().userId === userId);
    if (existingUser) {
      setQueueNumber(existingUser.data().queueNumber);
      localStorage.setItem("queueNumber", String(existingUser.data().queueNumber));
      return;
    }

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
    localStorage.setItem("queueNumber", String(newQueueNumber));
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
      <h2 className={styles.title}>대기 순번</h2>
      {isLoading ? (
        <p className={styles.loading}>대기 정보를 불러오는 중입니다...</p>
      ) : isNotAllowed ? (
        <p className={styles.warning}>
          이 QR 코드는 {useDate ? formattedDate(useDate.toISOString()) : "해당 날짜"}의 오전 7시
          이후에 사용 가능합니다.
        </p>
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
