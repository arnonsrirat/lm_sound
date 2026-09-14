import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | LMSound",
  description: "นโยบายความเป็นส่วนตัวของ LMSound",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 pb-36 text-foreground sm:px-6">
      <article className="mx-auto max-w-3xl rounded-3xl border border-purple-500/25 bg-purple-950/20 p-6 shadow-2xl shadow-purple-950/20 sm:p-10">
        <Link href="/" className="text-sm font-semibold text-purple-300 hover:text-white transition">← กลับหน้าแรก</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-purple-300/60">LMSound</p>
        <h1 className="mt-2 text-3xl font-black text-purple-50 sm:text-4xl">นโยบายความเป็นส่วนตัว</h1>
        <p className="mt-3 text-sm text-purple-200/65">ปรับปรุงล่าสุด: 14 กันยายน 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-purple-100/80">
          <section><h2 className="text-lg font-bold text-purple-100">ข้อมูลที่เราจัดเก็บ</h2><p className="mt-2">LMSound จัดเก็บข้อมูลบัญชีผู้ใช้ เช่น อีเมล ชื่อผู้ใช้ และข้อมูลที่ผู้ใช้หรือผู้ดูแลระบบบันทึกในระบบ เช่น สถานที่อ่านหนังสือ การตั้งค่าเว็บไซต์ และข้อมูลไฟล์สื่อ</p></section>
          <section><h2 className="text-lg font-bold text-purple-100">การเชื่อมต่อ Google Drive</h2><p className="mt-2">เมื่อผู้ดูแลระบบเลือกเชื่อมต่อ Google Drive ระบบจะใช้สิทธิ์ที่ได้รับเพื่ออัปโหลด จัดเก็บ ดึง ย้าย และลบไฟล์สื่อของ LMSound เท่านั้น โดย refresh token ถูกเข้ารหัสก่อนจัดเก็บในฐานข้อมูล และไม่เปิดเผยแก่ผู้ใช้งานทั่วไป</p></section>
          <section><h2 className="text-lg font-bold text-purple-100">วัตถุประสงค์การใช้ข้อมูล</h2><p className="mt-2">เราใช้ข้อมูลเพื่อให้บริการค้นหาและแสดงสถานที่อ่านหนังสือ จัดการสื่อบรรยากาศ ดูแลบัญชีผู้ใช้ และรักษาความปลอดภัยของระบบ</p></section>
          <section><h2 className="text-lg font-bold text-purple-100">การเก็บรักษาและการเปิดเผยข้อมูล</h2><p className="mt-2">ข้อมูลระบบจัดเก็บในฐานข้อมูลและพื้นที่เก็บไฟล์ที่ผู้ดูแลระบบเชื่อมต่อ เราไม่ขายหรือเปิดเผยข้อมูลส่วนบุคคลแก่บุคคลภายนอก เว้นแต่จำเป็นต่อการให้บริการ การปฏิบัติตามกฎหมาย หรือได้รับความยินยอมจากเจ้าของข้อมูล</p></section>
          <section><h2 className="text-lg font-bold text-purple-100">สิทธิของผู้ใช้และการติดต่อ</h2><p className="mt-2">หากต้องการขอเข้าถึง แก้ไข หรือลบข้อมูลของตนเอง โปรดติดต่อผู้ดูแลระบบของ LMSound ผ่านช่องทางที่ประกาศในเว็บไซต์</p></section>
        </div>
      </article>
    </main>
  );
}
