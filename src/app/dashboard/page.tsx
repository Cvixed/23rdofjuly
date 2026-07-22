"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import HomeTab from "@/components/dashboard/tabs/HomeTab";
import MoodTab from "@/components/dashboard/tabs/MoodTab";
import StudyTab from "@/components/dashboard/tabs/StudyTab";
import ChatTab from "@/components/dashboard/tabs/ChatTab";

function DashboardTabs() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "home";

  return (
    <div className="relative w-full h-full">
      <div style={{ display: tab === "home" ? "block" : "none" }} className="h-full">
        <HomeTab />
      </div>
      <div style={{ display: tab === "mood" ? "block" : "none" }} className="h-full">
        <MoodTab />
      </div>
      <div style={{ display: tab === "study" ? "block" : "none" }} className="h-full">
        <StudyTab />
      </div>
      <div style={{ display: tab === "chat" ? "block" : "none" }} className="h-full">
        <ChatTab />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-pink-400 animate-pulse">Loading...</div>}>
      <DashboardTabs />
    </Suspense>
  );
}
