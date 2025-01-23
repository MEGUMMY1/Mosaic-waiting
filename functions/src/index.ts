// import * as functions from "firebase-functions/v2";
// import * as admin from "firebase-admin";

// admin.initializeApp();
// const db = admin.firestore();

// // 매일 오전 7시에 대기열을 리셋하는 함수
// export const resetQueuesDaily = functions.pubsub
//   .schedule("0 7 * * *") // 매일 오전 7시
//   .timeZone("Asia/Seoul") // 한국 시간대
//   .onRun(async () => {
//     // 'context'가 사용되지 않으므로 제거
//     console.log("리셋 시작: 대기열을 초기화합니다.");

//     // 'queues' 컬렉션에서 모든 대기열을 가져오기
//     const queuesRef = db.collection("queues");
//     const snapshot = await queuesRef.get();

//     // 각 대기열에 대해 리셋 처리
//     snapshot.forEach(async (doc) => {
//       // 'queueData' 사용하지 않으면 삭제 가능
//       console.log(`리셋 대상 대기열 ID: ${doc.id}`);

//       // 리셋 로직: activeQueues 값을 0으로 초기화하고 currentNumber를 0으로 설정
//       await queuesRef.doc(doc.id).update({
//         currentNumber: 0,
//         activeQueues: 0,
//         lastReset: admin.firestore.FieldValue.serverTimestamp(), // 리셋 시간 기록
//       });

//       // 해당 대기열에 등록된 모든 activeQueue를 삭제하거나 상태 변경
//       const activeQueuesRef = db.collection("stores").doc(doc.id).collection("activeQueues");
//       const activeQueuesSnapshot = await activeQueuesRef.get();
//       activeQueuesSnapshot.forEach(async (queueDoc) => {
//         await activeQueuesRef.doc(queueDoc.id).delete(); // 대기열 내 모든 유저 정보 삭제
//       });
//     });

//     console.log("리셋 완료: 모든 대기열이 초기화되었습니다.");
//   });
