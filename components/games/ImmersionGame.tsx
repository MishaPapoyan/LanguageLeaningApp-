"use client";
import dynamic from "next/dynamic";

const CafeGame = dynamic(() => import("./immersion/CafeGame"), { ssr: false });

export default function ImmersionGame({ language }: { language: string }) {
  return <CafeGame language={language} />;
}
