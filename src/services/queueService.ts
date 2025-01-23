import { firestore } from "@/firebase/firebase";
import { collection, addDoc, getDoc, doc, updateDoc } from "firebase/firestore";

export async function createQueue(userId: string, storeName: string, maxQueues: number) {
  const queueRef = await addDoc(collection(firestore, "users", userId, "queues"), {
    storeName,
    maxQueues,
    currentNumber: 0,
    activeQueues: 0,
  });

  await addDoc(collection(firestore, "stores", queueRef.id, "activeQueues"), {
    userId,
    queueNumber: 1,
    status: "waiting",
    createdAt: new Date(),
  });

  return queueRef.id;
}

export async function joinQueue(userId: string, queueId: string) {
  const queueRef = doc(firestore, "users", userId, "queues", queueId);
  const queueSnapshot = await getDoc(queueRef);
  const queueData = queueSnapshot.data();

  if (queueData && queueData.activeQueues < queueData.maxQueues) {
    await updateDoc(queueRef, {
      currentNumber: queueData.currentNumber + 1,
      activeQueues: queueData.activeQueues + 1,
    });

    const queueTicketRef = await addDoc(collection(firestore, "stores", queueId, "activeQueues"), {
      userId,
      queueNumber: queueData.currentNumber + 1,
      status: "waiting",
      createdAt: new Date(),
    });

    return queueTicketRef;
  }
}
