"use client";
import { useRouter } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { notify } from "@/lib/notify";
export default function SpotEngagement({ spotId, averageRating = 0, ratingCount = 0 }: { spotId: string; averageRating?: number; ratingCount?: number }) {
  const router = useRouter();
  const submit = async (action: string, score?: number) => {
    const response = await fetch(`/api/spots/${spotId}/engagement`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, score }) });
    if (response.status === 401) { notify("กรุณาเข้าสู่ระบบก่อนให้คะแนนหรือกดหัวใจ", "error"); router.push(`/login?next=/spots/${spotId}`); return; }
    const data = await response.json();
    if (data.success) notify(action === "favorite" ? (data.liked ? "เพิ่มสถานที่ในรายการโปรดแล้ว" : "นำสถานที่ออกจากรายการโปรดแล้ว") : "บันทึกคะแนนสถานที่แล้ว", "success");
  };
  return <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-purple-500/20 bg-purple-950/15 p-3"><span className="text-xs font-semibold">ให้คะแนนสถานที่</span>{[1,2,3,4,5].map((score) => <button key={score} type="button" onClick={() => void submit("rate", score)} className="text-amber-300 hover:scale-110"><Star className="h-4 w-4 fill-current" /></button>)}<span className="text-xs text-foreground/60">{averageRating.toFixed(1)} ({ratingCount})</span><button type="button" onClick={() => void submit("favorite")} className="ml-auto inline-flex items-center gap-1 rounded-xl border border-pink-400/30 px-3 py-1.5 text-xs text-pink-300 hover:bg-pink-500/10"><Heart className="h-4 w-4" /> ถูกใจ</button></div>;
}
