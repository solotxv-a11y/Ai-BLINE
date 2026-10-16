"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { PhoneFrame } from "@/components/app/phone-frame";
import { StatusBar } from "@/components/app/status-bar";
import { AppHeader } from "@/components/app/header";
import { BottomNav } from "@/components/app/bottom-nav";
import { SidePanel } from "@/components/app/side-panel";
import HomeScreen from "@/components/screens/home-screen";
import AgentsScreen from "@/components/screens/agents-screen";
import AcademyScreen from "@/components/screens/academy-screen";
import ToolsScreen from "@/components/screens/tools-screen";
import AccountScreen from "@/components/screens/account-screen";

function ScreenFor({ tab }: { tab: string }) {
  switch (tab) {
    case "home":
      return <HomeScreen />;
    case "agents":
      return <AgentsScreen />;
    case "academy":
      return <AcademyScreen />;
    case "tools":
      return <ToolsScreen />;
    case "account":
      return <AccountScreen />;
    default:
      return null;
  }
}

export function AppShell() {
  const { tab, stacks, reduceMotion } = useAppStore();
  const stack = stacks[tab];
  const top = stack[stack.length - 1];
  const viewKey = `${tab}:${stack.length}:${top.name}:${JSON.stringify(top.params ?? {})}`;

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center bg-[#020308] xl:gap-20 xl:px-12">
      {/* ambient desktop backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -left-32 top-[-10%] h-[480px] w-[480px] rounded-full bg-neon/[0.07] blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
        <div className="absolute left-[45%] top-[55%] h-[300px] w-[300px] rounded-full bg-sky-500/[0.05] blur-[120px]" />
      </div>

      <SidePanel />

      <PhoneFrame>
        <StatusBar />
        <AppHeader />
        <main className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={viewKey}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 26 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -26 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 overflow-y-auto overscroll-contain"
            >
              <ScreenFor tab={tab} />
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
      </PhoneFrame>
    </div>
  );
}
