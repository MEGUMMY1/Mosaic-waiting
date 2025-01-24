import { firestore } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc,
  Timestamp,
  orderBy,
  limit,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

export async function createNextDayQueue() {
  const today = new Date();
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  const startTime = new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), 7, 0, 0);
  const endTime = new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), 20, 0, 0);

  const queueRef = await addDoc(collection(firestore, "dailyQueues"), {
    storeName: "MOSAIC SEOUL",
    maxQueues: 100,
    currentNumber: 0,
    activeQueues: 0,
    startTime: Timestamp.fromDate(startTime),
    endTime: Timestamp.fromDate(endTime),
    date: Timestamp.fromDate(nextDay),
    isActive: false,
  });

  return queueRef.id;
}

export async function getNextDayQueue() {
  const today = new Date();
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  const queuesRef = collection(firestore, "dailyQueues");
  const q = query(
    queuesRef,
    where(
      "date",
      ">=",
      Timestamp.fromDate(new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate()))
    ),
    where(
      "date",
      "<",
      Timestamp.fromDate(new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate() + 1))
    )
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const queueDoc = querySnapshot.docs[0];
    return { id: queueDoc.id, ...queueDoc.data() };
  }

  return null;
}

export async function getYesterdayQueue() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1); // 전날로 설정

  const queuesRef = collection(firestore, "dailyQueues");
  const q = query(
    queuesRef,
    where(
      "date",
      ">=",
      Timestamp.fromDate(
        new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      )
    ),
    where(
      "date",
      "<",
      Timestamp.fromDate(
        new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)
      )
    )
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const queueDoc = querySnapshot.docs[0];
    return { id: queueDoc.id, ...queueDoc.data() };
  }

  return null;
}

export async function getCurrentQueueStatus(queueId: string) {
  const queueRef = doc(firestore, "dailyQueues", queueId);
  const queueSnapshot = await getDoc(queueRef);
  const queueData = queueSnapshot.data();

  if (!queueData) {
    throw new Error("Queue 데이터를 찾을 수 없습니다.");
  }

  // QR 사용 가능한 날짜와 현재 시간 비교
  const now = new Date();
  const queueDate = queueData.date.toDate(); // Timestamp를 Date로 변환
  const startTime = new Date(
    queueDate.getFullYear(),
    queueDate.getMonth(),
    queueDate.getDate(),
    7,
    0,
    0
  );

  // 현재 시간이 QR 사용 날짜의 7시 이전이라면 접속 제한
  if (now < startTime) {
    throw new Error("현재 시간에는 QR을 사용할 수 없습니다.");
  }

  const activeQueuesRef = collection(firestore, "dailyQueues", queueId, "activeQueues");
  const activeQueuesQuery = query(activeQueuesRef, where("status", "==", "waiting"));
  const activeQueuesSnapshot = await getDocs(activeQueuesQuery);

  return {
    maxQueues: queueData.maxQueues || 0,
    currentActiveQueues: activeQueuesSnapshot.size,
    currentNumber: queueData.currentNumber || 0,
  };
}

export async function activateQueue(queueId: string) {
  const queueRef = doc(firestore, "dailyQueues", queueId);
  await updateDoc(queueRef, { isActive: true });
}

export async function deactivateQueue(queueId: string) {
  const queueRef = doc(firestore, "dailyQueues", queueId);
  await updateDoc(queueRef, { isActive: false });
}

export async function deleteQueue(queueId: string) {
  try {
    // 1. 메인 큐 문서 삭제
    const queueDocRef = doc(firestore, "dailyQueues", queueId);
    await deleteDoc(queueDocRef);

    // 2. 해당 큐의 모든 활성 대기열 서브컬렉션 삭제
    const activeQueuesRef = collection(firestore, "dailyQueues", queueId, "activeQueues");
    const activeQueuesQuery = query(activeQueuesRef);
    const activeQueuesSnapshot = await getDocs(activeQueuesQuery);

    // 배치 작업으로 모든 하위 문서 삭제
    const batch = writeBatch(firestore);
    activeQueuesSnapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    await batch.commit();

    return true;
  } catch (error) {
    console.error("Queue deletion error:", error);
    return false;
  }
}
