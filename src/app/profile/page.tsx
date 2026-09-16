import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { getSession, getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session ? await getCurrentUser() : null;
  if (!session || !user) return <div className="grid min-h-screen place-items-center text-foreground">กรุณาเข้าสู่ระบบก่อนดูโปรไฟล์</div>;
  return <div className="min-h-screen text-foreground"><Header currentUser={{ userId: session.userId, username: session.username }} /><Sidebar role={session.role} /><main className="mx-auto max-w-2xl px-5 pb-28 pt-24 md:pl-72"><section className="glass-panel rounded-3xl border border-purple-500/25 p-6"><p className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">บัญชีของฉัน</p><h1 className="mt-2 text-2xl font-black">โปรไฟล์และสถานะบัญชี</h1><div className="mt-6 grid gap-3"><div className="rounded-2xl bg-purple-500/10 p-4"><p className="text-xs text-purple-300/60">ชื่อผู้ใช้</p><p className="mt-1 font-semibold">{user.username}</p></div><div className="rounded-2xl bg-purple-500/10 p-4"><p className="text-xs text-purple-300/60">อีเมล</p><p className="mt-1 break-all font-semibold">{user.email}</p><p className="mt-1 text-xs text-emerald-300">{user.emailVerifiedAt ? "ยืนยันอีเมลแล้ว" : "รอยืนยันอีเมล"}</p></div><div className="rounded-2xl bg-emerald-500/10 p-4"><p className="text-xs text-purple-300/60">สถานะบัญชี</p><p className="mt-1 font-semibold text-emerald-200">ใช้งานปกติ · {session.role === "ADMIN" ? "ผู้ดูแลระบบ" : "สมาชิก"}</p></div></div><p className="mt-5 text-xs text-purple-200/60">การแก้ไขอีเมลต้องผ่านการยืนยันใหม่เพื่อความปลอดภัยของบัญชี</p></section></main><BottomNav role={session.role} /></div>;
}
