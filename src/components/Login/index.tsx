import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // useRouter 추가
import { useAuth } from "@/hooks/useAuth"; // useAuth 훅 가져오기
import styles from "./Login.module.scss";
import Input from "../Input";
import Button from "../Button";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useAuth(); // useAuth 훅 사용
  const router = useRouter(); // useRouter 훅 사용

  // 로그인 후 페이지 리다이렉션
  useEffect(() => {
    if (user) {
      router.push("/"); // 로그인 후 홈으로 리다이렉트
    }
  }, [user, router]);

  const handleLogin = async () => {
    try {
      await login(email, password); // login 호출
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("이메일 또는 비밀번호가 잘못되었습니다.");
    }
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
      <h1 className={styles.title}>Login</h1>
      <section className={styles.section}>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 입력"
          label="이메일"
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 입력"
          label="비밀번호"
          isPW
        />
        <Button onClick={handleLogin}>로그인</Button>
      </section>
    </div>
  );
}
