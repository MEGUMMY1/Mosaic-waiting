import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { createQueue } from "../services/queueService";
import dynamic from "next/dynamic";

const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeCanvas), {
  ssr: false,
});

export default function Home() {
  const { user, anonymousLogin, logout } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [maxQueues, setMaxQueues] = useState(10);
  const [qrValue, setQrValue] = useState("");

  const handleCreateQueue = async () => {
    if (user) {
      const id = await createQueue(user.uid, storeName, maxQueues);
      setQrValue(`https://your-website.com/queue/${id}`);
    }
  };

  return (
    <div>
      <h1>대기열 관리 시스템</h1>
      {user ? (
        <div>
          <h2>안녕하세요, 익명 사용자!</h2>
          <button onClick={logout}>로그아웃</button>
          <input
            type="text"
            placeholder="매장 이름"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
          <input
            type="number"
            placeholder="최대 대기 인원"
            value={maxQueues}
            onChange={(e) => setMaxQueues(Number(e.target.value))}
          />
          <button onClick={handleCreateQueue}>대기열 생성</button>
          {qrValue && <QRCode value={qrValue} />}
        </div>
      ) : (
        <div>
          <p>로그인이 필요합니다.</p>
          <button onClick={anonymousLogin}>익명 로그인</button>
        </div>
      )}
    </div>
  );
}
