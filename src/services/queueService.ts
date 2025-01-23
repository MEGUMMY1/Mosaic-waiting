import { firestore } from "@/firebase/firebase";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

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

export async function addUserToQueue(userId: string, queueId: string) {
  try {
    const queueRef = collection(firestore, "queues", queueId, "users");
    const q = query(queueRef, orderBy("queueNumber", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    let newQueueNumber = 1;
    if (!querySnapshot.empty) {
      const lastUser = querySnapshot.docs[0];
      newQueueNumber = lastUser.data().queueNumber + 1;
    }
    const userId = uuidv4();

    const docRef = await addDoc(queueRef, {
      userId,
      queueNumber: newQueueNumber,
      createdAt: new Date(),
    });

    console.log("User added to queue with number: ", newQueueNumber);
    return newQueueNumber;
  } catch (error) {
    console.error("Error adding user to queue: ", error);
    throw new Error("Error adding user to queue");
  }
}
