"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Send, ArrowLeft } from "lucide-react";
import { suggestSpotAction } from "@/actions/spot";
import CampusMap from "@/components/CampusMap";

export default function QuickSpotSuggestionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(7.80822);
  const [longitude, setLongitude] = useState(99.93869);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setPending(true); setError(null);
    const result = await suggestSpotAction({ title, location, latitude, longitude });
    if (!result.success) setError(result.error || "ส่งข้อมูลไม่สำเร็จ");
    else { setSent(true); setTimeout(() => { router.push("/"); router.refresh(); }, 1300); }
    setPending(false);
  };

  if (sent) return <div className="mx-auto max-w-xl rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 text-center"><h1 className="text-xl font-bold text-emerald-200">ส่งจุดใหม่เรียบร้อยแล้ว</h1><p className="mt-2 text-sm text-emerald-100/80">ข้อมูลอยู่ในสถานะรอแอดมินตรวจสอบและเติมรายละเอียด</p></div>;

  return <div className="mx-auto max-w-2xl p-4 sm:p-8"><Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs text-purple-300 hover:text-white"><ArrowLeft className="h-4 w-4" />กลับหน้าแรก</Link><div className="glass-panel rounded-3xl border border-purple-500/25 p-5 shadow-2xl sm:p-8"><h1 className="text-2xl font-black text-foreground">เสนอจุดอ่านหนังสือใหม่</h1><p className="mt-2 text-sm text-purple-300/80">ผู้ใช้กรอกเฉพาะชื่อโซนและตำแหน่งเท่านั้น ข้อมูลรูปภาพ เสียง ระดับเสียง และรายละเอียดอื่นจะรอแอดมินตรวจสอบและอัปเดตให้ก่อนเผยแพร่</p>{error && <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</p>}<form onSubmit={submit} className="mt-6 space-y-5"><label className="block text-xs font-bold text-purple-300">ชื่อโซน<input required minLength={2} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น มุมอ่านหนังสือใต้ต้นไม้" className="mt-2 w-full rounded-xl border border-purple-500/25 bg-purple-950/30 px-4 py-3 text-sm text-foreground outline-none focus:border-fuchsia-400" /></label><label className="block text-xs font-bold text-purple-300">ตำแหน่ง / อาคาร / ชั้น<div className="relative mt-2"><MapPin className="absolute left-3 top-3 h-4 w-4 text-fuchsia-400" /><input required minLength={2} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="เช่น อาคาร 5 ชั้น 2" className="w-full rounded-xl border border-purple-500/25 bg-purple-950/30 py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-fuchsia-400" /></div></label><div className="overflow-hidden rounded-2xl border border-purple-500/25"><CampusMap spots={[]} selected={{ latitude, longitude }} interactive onPick={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} /></div><p className="text-[11px] text-cyan-300">พิกัดที่เลือก: {latitude.toFixed(5)}, {longitude.toFixed(5)}</p><button disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-900/30 disabled:opacity-50"><Send className="h-4 w-4" />{pending ? "กำลังส่งข้อมูล..." : "ส่งให้แอดมินตรวจสอบ"}</button></form></div></div>;
}
