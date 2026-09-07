import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import SpotForm from "@/components/SpotForm";
import { getSpotById } from "@/actions/spot";
import { getSession } from "@/lib/auth";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditSpotPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSpotPage({ params }: EditSpotPageProps) {
  const { id } = await params;
  const spot = await getSpotById(id);
  const session = await getSession();

  if (!spot) {
    notFound();
  }

  // Authorization Guard: หากไม่ใช่เจ้าของ แสดงหน้า 403 Forbidden
  if (!session || session.userId !== spot.authorId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header currentUser={session ? { userId: session.userId, username: session.username } : null} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel rounded-3xl p-8 text-center border border-rose-500/20 bg-rose-500/5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">403 - Forbidden</h1>
            <p className="text-xs text-rose-400 mt-2 font-medium">
              คุณไม่มีสิทธิ์แก้ไขจุดอ่านหนังสือนี้ เนื่องจากไม่ใช่เจ้าของโพสต์
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              เฉพาะผู้สร้าง &ldquo;{spot.title}&rdquo; เท่านั้นที่ได้รับอนุญาตให้ทำการเปลี่ยนแปลง
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>กลับสู่หน้าแรก</span>
              </Link>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header currentUser={{ userId: session.userId, username: session.username }} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 md:pl-64 p-4 sm:p-6 pb-24 md:pb-12 min-w-0">
          <SpotForm initialData={spot} isEdit />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
