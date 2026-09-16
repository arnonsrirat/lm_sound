"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { notify } from "@/lib/notify";

type Track = { id: string; name: string; originalName?: string | null; note?: string | null; isPublished: boolean };
type Playlist = { id: string; name: string; description?: string | null; coverUrl?: string | null; isPublished: boolean; tracks: { assetId: string; position: number }[] };

export default function RelaxationAdminPanel() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const response = await fetch("/api/admin/relaxation", { cache: "no-store" }); const data = await response.json(); if (!data.success) throw new Error(data.error); setTracks(data.data.tracks); setPlaylists(data.data.playlists); } catch (error) { notify(error instanceof Error ? error.message : "โหลดข้อมูลเพลงไม่สำเร็จ", "error"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const save = async () => { if (!name.trim()) { notify("กรุณาระบุชื่อเพลย์ลิสต์", "error"); return; } const response = await fetch("/api/admin/relaxation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, isPublished, assetIds: selected }) }); const data = await response.json(); if (data.success) { notify("บันทึกเพลย์ลิสต์แล้ว", "success"); setName(""); setDescription(""); setSelected([]); void load(); } else notify(data.error || "บันทึกไม่สำเร็จ", "error"); };
  const remove = async (id: string) => { const response = await fetch("/api/admin/relaxation", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); const data = await response.json(); if (data.success) { notify("ลบเพลย์ลิสต์แล้ว", "success"); void load(); } else notify(data.error || "ลบไม่สำเร็จ", "error"); };
  if (loading) return <div className="flex items-center gap-2 rounded-3xl border border-purple-500/20 p-6 text-sm text-purple-200/70"><Loader2 className="h-4 w-4 animate-spin" />กำลังโหลดคลังเพลง…</div>;
  return <div className="space-y-5">
    <div className="rounded-3xl border border-fuchsia-400/25 bg-fuchsia-500/5 p-5"><h2 className="text-lg font-black text-fuchsia-100">จัดการเพลงผ่อนคลาย</h2><p className="mt-1 text-xs text-purple-200/70">เลือกเพลงจากคลัง Relaxation แล้วจัดเป็นเพลย์ลิสต์ที่จะแสดงบนหน้าเว็บ</p><div className="mt-4 grid gap-3 md:grid-cols-2"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="ชื่อเพลย์ลิสต์ เช่น Deep Focus" className="rounded-xl border border-purple-500/25 bg-purple-950/40 px-3 py-2.5 text-sm text-purple-100 outline-none" /><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="คำอธิบายสั้นๆ" className="rounded-xl border border-purple-500/25 bg-purple-950/40 px-3 py-2.5 text-sm text-purple-100 outline-none" /></div><label className="mt-3 flex items-center gap-2 text-xs text-purple-200"><input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />เผยแพร่บนหน้าคลังเพลง</label><div className="mt-4 grid gap-2 sm:grid-cols-2">{tracks.map((track) => <label key={track.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs ${selected.includes(track.id) ? "border-fuchsia-400 bg-fuchsia-500/15" : "border-purple-500/20 bg-purple-950/30"}`}><input type="checkbox" checked={selected.includes(track.id)} onChange={() => setSelected((current) => current.includes(track.id) ? current.filter((id) => id !== track.id) : [...current, track.id])} /><span className="min-w-0 flex-1 truncate">{track.originalName || track.name}</span>{track.isPublished && <Check className="h-3.5 w-3.5 text-emerald-300" />}</label>)}</div><button type="button" onClick={() => void save()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-fuchsia-500 px-4 py-2.5 text-xs font-bold text-white"><Plus className="h-4 w-4" />บันทึกเพลย์ลิสต์</button></div>
    <div className="grid gap-3 sm:grid-cols-2">{playlists.map((playlist) => <article key={playlist.id} className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-purple-100">{playlist.name}</h3><p className="mt-1 text-xs text-purple-200/60">{playlist.description || "ไม่มีคำอธิบาย"}</p><p className="mt-2 text-[11px] text-purple-300/60">{playlist.tracks.length} เพลง · {playlist.isPublished ? "เผยแพร่แล้ว" : "ฉบับร่าง"}</p></div><button type="button" onClick={() => void remove(playlist.id)} className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/15" aria-label="ลบเพลย์ลิสต์"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>
  </div>;
}
