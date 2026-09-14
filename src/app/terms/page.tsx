import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน | LMSound",
  description: "ข้อกำหนดการใช้งาน LMSound",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 pb-36 text-foreground sm:px-6">
      <article className="mx-auto max-w-3xl rounded-3xl border border-purple-500/25 bg-purple-950/20 p-6 shadow-2xl shadow-purple-950/20 sm:p-10">
        <Link href="/" className="text-sm font-semibold text-purple-300 hover:text-white transition">← กลับหน้าแรก</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-purple-300/60">LMSound</p>
        <h1 className="mt-2 text-3xl font-black text-purple-50 sm:text-4xl">ข้อกำหนดการใช้งาน</h1>
        <p className="mt-3 text-sm text-purple-200/65">ปรับปรุงล่าสุด: 14 กันยายน 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-purple-100/80">
          <section><h2 className="text-lg font-bold text-purple-100">การยอมรับข้อกำหนด</h2><p className="mt-2">เมื่อใช้งาน LMSound คุณยอมรับข้อกำหนดฉบับนี้และนโยบายความเป็นส่วนตัวของเรา</p></section>
          <section><h2 className="text-lg font-bold text-purple-100">การใช้งานระบบ</h2><p className="mt-2">ผู้ใช้ต้องให้ข้อมูลที่ถูกต้อง ใช้งานระบบอย่างสุจริต และไม่อัปโหลดเนื้อหาที่ละเมิดกฎหมาย ลิขสิทธิ์ หรือสิทธิของบุคคลอื่น</p></section>
          <section><h2 className="text-lg font-bold text-purple-100">สิทธิ์ผู้ดูแลระบบ</h2><p className="mt-2">การจัดการสถานที่ สื่อ ผู้ใช้งาน และการเชื่อมต่อ Google Drive สงวนสิทธิ์สำหรับบัญชีผู้ดูแลระบบ ผู้ดูแลมีหน้าที่ดูแลสิทธิ์การเข้าถึงและเนื้อหาในคลังสื่อ</p></section>
          <section><h2 className="text-lg font-bold text-purple-100">การเปลี่ยนแปลงบริการ</h2><p className="mt-2">LMSound อาจปรับปรุง เปลี่ยนแปลง หรือระงับบางส่วนของบริการเพื่อความปลอดภัยและคุณภาพ โดยจะแจ้งให้ทราบตามความเหมาะสม</p></section>
          <section><h2 className="text-lg font-bold text-purple-100">ข้อจำกัดความรับผิด</h2><p className="mt-2">ผู้ใช้รับผิดชอบต่อเนื้อหาที่ตนอัปโหลดและการใช้งานบัญชีของตนเอง ระบบไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้งานที่ผิดวัตถุประสงค์หรือการเข้าถึงโดยไม่ได้รับอนุญาตจากผู้ใช้</p></section>
        </div>
      </article>
    </main>
  );
}
