import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน | LMSound",
  description: "ข้อกำหนดการใช้งาน LMSound",
};

export default async function TermsPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen text-foreground flex flex-col transition-colors">
      <Header currentUser={session ? { userId: session.userId, username: session.username } : null} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-36 sm:pb-32 md:pb-28">
        <article className="rounded-3xl border border-purple-500/25 bg-[var(--card-bg)] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <Link href="/" className="text-xs sm:text-sm font-semibold text-purple-300 hover:text-white transition">
            ← กลับหน้าแรก
          </Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400">LMSound</p>
          <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-foreground purple-gradient-text">
            ข้อกำหนดการใช้งาน
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-purple-300/70">ปรับปรุงล่าสุด: 14 กันยายน 2026</p>

          <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-foreground/85">
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">การยอมรับข้อกำหนด</h2>
              <p>เมื่อใช้งาน LMSound คุณยอมรับข้อกำหนดฉบับนี้และนโยบายความเป็นส่วนตัวของเรา</p>
            </section>
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">การใช้งานระบบ</h2>
              <p>ผู้ใช้ต้องให้ข้อมูลที่ถูกต้อง ใช้งานระบบอย่างสุจริต และไม่อัปโหลดเนื้อหาที่ละเมิดกฎหมาย ลิขสิทธิ์ หรือสิทธิของบุคคลอื่น</p>
            </section>
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">สิทธิ์ผู้ดูแลระบบ</h2>
              <p>การจัดการสถานที่ สื่อ ผู้ใช้งาน และการเชื่อมต่อ Google Drive สงวนสิทธิ์สำหรับบัญชีผู้ดูแลระบบ ผู้ดูแลมีหน้าที่ดูแลสิทธิ์การเข้าถึงและเนื้อหาในคลังสื่อ</p>
            </section>
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">การเปลี่ยนแปลงบริการ</h2>
              <p>LMSound อาจปรับปรุง เปลี่ยนแปลง หรือระงับบางส่วนของบริการเพื่อความปลอดภัยและคุณภาพ โดยจะแจ้งให้ทราบตามความเหมาะสม</p>
            </section>
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">ข้อจำกัดความรับผิด</h2>
              <p>ผู้ใช้รับผิดชอบต่อเนื้อหาที่ตนอัปโหลดและการใช้งานบัญชีของตนเอง ระบบไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้งานที่ผิดวัตถุประสงค์หรือการเข้าถึงโดยไม่ได้รับอนุญาตจากผู้ใช้</p>
            </section>
          </div>
        </article>
      </main>

      <BottomNav role={session?.role} />
    </div>
  );
}

