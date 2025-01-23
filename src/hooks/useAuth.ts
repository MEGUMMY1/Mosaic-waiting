import { useState, useEffect } from "react";
import { signInAnonymously, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const anonymousLogin = async () => {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error("익명 로그인 실패:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  };

  return { user, anonymousLogin, logout };
}
