import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { useRouter } from "next/router";
import styles from "./Login.module.scss";
import Input from "../Input";
import Button from "../Button";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const route = useRouter();

  const loginRecordShop = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      route.push("/");
      alert("로그인되었습니다!");
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
        <Button onClick={loginRecordShop}>로그인</Button>
      </section>
    </div>
  );
}
