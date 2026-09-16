import type { Metadata } from "next";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import RelaxationLibrary from "@/components/RelaxationLibrary";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "คลังเพลงผ่อนคลาย | LMSound",
  description: "คลังเพลงและเสียงบรรยากาศสำหรับการอ่านหนังสือและพักใจ",
};

export default async function RelaxationPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen text-foreground flex flex-col transition-colors">
      <Header currentUser={session ? { userId: session.userId, username: session.username } : null} />
      <div className="flex-1 flex max-w-[1680px] w-full mx-auto relative">
        <Sidebar role={session?.role} />
        <main className="flex-1 md:pl-60 lg:pl-64 px-4 py-6 sm:px-6 sm:py-8 md:px-8 pb-32">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400">LMSound Relaxation</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">คลังเพลงผ่อนคลาย</h1>
              <p className="mt-2 text-sm text-foreground/65">รวมเสียงที่คัดเลือกสำหรับอ่านหนังสือ ทำงาน และพักใจ</p>
            </div>
            <RelaxationLibrary locked={!session} />
          </div>
        </main>
      </div>
      <BottomNav role={session?.role} />
    </div>
  );
}
