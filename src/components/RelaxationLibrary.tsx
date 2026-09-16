"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Headphones, ListMusic, Play, PlayCircle, Star } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { notify } from "@/lib/notify";

type Track = { id: string; title: string; note?: string | null; timeTag?: string | null; url: string; playCount: number; averageRating: number; ratingCount: number };
type Playlist = { id: string; name: string; description?: string | null; coverUrl?: string | null; tracks: Track[] };

export default function RelaxationLibrary({ locked = false }: { locked?: boolean }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("all");
  const router = useRouter();
  const { playSpot } = useAudio();

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/relaxation", { signal: controller.signal, cache: "no-store" }).then((response) => response.json()).then((data) => { setTracks(data.data?.tracks ?? []); setPlaylists(data.data?.playlists ?? []); }).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const visibleTracks = useMemo(() => selectedPlaylist === "all" ? tracks : playlists.find((playlist) => playlist.id === selectedPlaylist)?.tracks ?? [], [playlists, selectedPlaylist, tracks]);
  const playTrack = (track: Track) => { playSpot({ id: track.id, title: track.title, subtitle: track.note ?? "เสียงผ่อนคลาย", category: "Relaxation", audioUrl: track.url }); void fetch("/api/relaxation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "play", assetId: track.id }) }); };
  const rate = async (track: Track, score: number) => {
    const response = await fetch("/api/relaxation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "rate", assetId: track.id, score }) });
    if (response.status === 401) { notify("กรุณาเข้าสู่ระบบก่อนให้คะแนนเพลง", "error"); router.push("/login?next=/relaxation"); return; }
    const data = await response.json();
    if (data.success) { const update = (items: Track[]) => items.map((item) => item.id === track.id ? { ...item, averageRating: data.averageRating, ratingCount: data.ratingCount } : item); setTracks(update); setPlaylists((items) => items.map((playlist) => ({ ...playlist, tracks: update(playlist.tracks) }))); notify("บันทึกคะแนนเพลงแล้ว", "success"); }
  };

  if (!tracks.length && !locked) return <div className="h-40 animate-pulse rounded-3xl bg-purple-950/25" />;
  return <section className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-6">
    <div className={locked ? "pointer-events-none select-none blur-md" : undefined}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-2xl bg-fuchsia-500/15 p-2.5 text-fuchsia-300"><Headphones className="h-5 w-5" /></div><div><h2 className="text-lg font-black">คลังเพลงผ่อนคลาย</h2><p className="text-xs text-foreground/60">เลือกเพลงหรือเปิดเพลย์ลิสต์ต่อเนื่องสำหรับอ่านหนังสือและพักใจ</p></div></div>{visibleTracks.length > 0 && <button type="button" onClick={() => playTrack(visibleTracks[0])} className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-500 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-fuchsia-500/20"><PlayCircle className="h-4 w-4" />เล่นชุดนี้</button>}</div>
      {playlists.length > 0 && <div className="mb-5 flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setSelectedPlaylist("all")} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${selectedPlaylist === "all" ? "bg-fuchsia-500 text-white" : "bg-purple-950/50 text-purple-200"}`}><ListMusic className="mr-1 inline h-3.5 w-3.5" />เพลงทั้งหมด</button>{playlists.map((playlist) => <button key={playlist.id} type="button" onClick={() => setSelectedPlaylist(playlist.id)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${selectedPlaylist === playlist.id ? "bg-fuchsia-500 text-white" : "bg-purple-950/50 text-purple-200"}`}>{playlist.name}</button>)}</div>}
      <div className="grid gap-3 sm:grid-cols-2">{visibleTracks.length ? visibleTracks.map((track) => <article key={track.id} className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-3 transition hover:border-fuchsia-400/50"><div className="flex items-center gap-3"><button type="button" onClick={() => playTrack(track)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full purple-gradient-btn"><Play className="h-4 w-4 fill-current" /></button><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold">{track.title}</h3><p className="truncate text-xs text-foreground/60">{track.note || "เสียงผ่อนคลาย"}</p></div></div><div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-foreground/60"><span>ฟัง {track.playCount} ครั้ง</span>{track.timeTag && <span>• {track.timeTag}</span>}<span className="ml-auto inline-flex items-center gap-1 text-amber-300"><Star className="h-3 w-3 fill-current" /> {track.averageRating.toFixed(1)} ({track.ratingCount})</span></div><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((score) => <button key={score} type="button" onClick={() => void rate(track, score)} aria-label={`ให้คะแนน ${score} ดาว`} className="text-amber-300/60 hover:text-amber-300"><Star className="h-4 w-4 fill-current" /></button>)}</div></article>) : <div className="col-span-full rounded-2xl bg-purple-950/30 p-8 text-center text-sm text-foreground/60">เพลย์ลิสต์นี้ยังไม่มีเพลงที่เผยแพร่</div>}</div>
    </div>
    {locked && <div className="absolute inset-0 grid place-items-center bg-background/25 p-6 text-center backdrop-blur-[1px]"><div className="max-w-sm rounded-2xl border border-fuchsia-400/30 bg-background/90 p-5 shadow-2xl"><Headphones className="mx-auto mb-2 h-7 w-7 text-fuchsia-300" /><h3 className="font-black">กรุณาล็อกอินก่อนใช้งาน</h3><p className="mt-1 text-xs text-foreground/65">คลังเพลงผ่อนคลายและการฟังเพลงใช้ได้สำหรับสมาชิกที่เข้าสู่ระบบเท่านั้น</p><button type="button" onClick={() => router.push("/login?next=/relaxation")} className="mt-4 rounded-xl bg-fuchsia-500 px-4 py-2 text-xs font-bold text-white">เข้าสู่ระบบ</button></div></div>}
  </section>;
}
