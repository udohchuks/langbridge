'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      // Dynamic import to avoid SSR issues with localStorage if needed, 
      // but since we are in useEffect, it's client-side only anyway.
      // We'll use the utility we created.
      const { getUserProfile } = require("@/lib/userStorage");
      const user = getUserProfile();

      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/welcome");
      }
    };

    const timer = setTimeout(() => {
      checkUser();
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col bg-sand-beige overflow-hidden">
      <div className="flex h-full w-full grow items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-earthy-brown animate-pulse-slow tracking-tight">
          LangBridge
        </h1>
      </div>
    </div>
  );
}