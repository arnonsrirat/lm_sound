import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | LMSound",
  description: "นโยบายความเป็นส่วนตัวของ LMSound",
};

export default async function PrivacyPage() {
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
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-purple-300/70">ปรับปรุงล่าสุด: 14 กันยายน 2026</p>

          <div className="mt-8 space-y-6 text-xs sm:text-sm leading-relaxed text-foreground/85">
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">ข้อมูลที่เราจัดเก็บ</h2>
              <p>LMSound จัดเก็บข้อมูลบัญชีผู้ใช้ เช่น อีเมล ชื่อผู้ใช้ และข้อมูลที่ผู้ใช้หรือผู้ดูแลระบบบันทึกในระบบ เช่น สถานที่อ่านหนังสือ การตั้งค่าเว็บไซต์ และข้อมูลไฟล์สื่อ</p>
            </section>
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">การเชื่อมต่อ Google Drive</h2>
              <p>เมื่อผู้ดูแลระบบเลือกเชื่อมต่อ Google Drive ระบบจะใช้สิทธิ์ที่ได้รับเพื่ออัปโหลด จัดเก็บ ดึง ย้าย และลบไฟล์สื่อของ LMSound เท่านั้น โดย refresh token ถูกเข้ารหัสก่อนจัดเก็บในฐานข้อมูล และไม่เปิดเผยแก่ผู้ใช้งานทั่วไป</p>
            </section>
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">วัตถุประสงค์การใช้ข้อมูล</h2>
              <p>เราใช้ข้อมูลเพื่อให้บริการค้นหาและแสดงสถานที่อ่านหนังสือ จัดการสื่อบรรยากาศ ดูแลบัญชีผู้ใช้ และรักษาความปลอดภัยของระบบ</p>
            </section>
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">การเก็บรักษาและการเปิดเผยข้อมูล</h2>
              <p>ข้อมูลระบบจัดเก็บในฐานข้อมูลและพื้นที่เก็บไฟล์ที่ผู้ดูแลระบบเชื่อมต่อ เราไม่ขายหรือเปิดเผยข้อมูลส่วนบุคคลแก่บุคคลภายนอก เว้นแต่จำเป็นต่อการให้บริการ การปฏิบัติตามกฎหมาย หรือได้รับความยินยอมจากเจ้าของข้อมูล</p>
            </section>
            <section className="p-4 sm:p-5 rounded-2xl bg-purple-950/20 border border-purple-500/15">
              <h2 className="text-base font-bold text-white mb-2">สิทธิของผู้ใช้และการติดต่อ</h2>
              <p>หากต้องการขอเข้าถึง แก้ไข หรือลบข้อมูลของตนเอง โปรดติดต่อผู้ดูแลระบบของ LMSound ผ่านช่องทางที่ประกาศในเว็บไซต์</p>
            </section>
          </div>
        </article>
      </main>

      <BottomNav role={session?.role} />
    </div>
  );
}

