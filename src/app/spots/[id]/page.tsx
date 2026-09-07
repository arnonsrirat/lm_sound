import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { getSpotById } from "@/actions/spot";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { MapPin, Volume2, User, ArrowLeft, Edit3, Calendar } from "lucide-react";
import Link from "next/link";
import { noiseLevelLabels, type NoiseLevel } from "@/lib/validations/spot";

interface SpotDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SpotDetailPage({ params }: SpotDetailPageProps) {
  const { id } = await params;
  const spot = await getSpotById(id);
  const session = await getSession();

  if (!spot) {
    notFound();
  }

  const isOwner = session?.userId === spot.authorId;
  const noiseConfig =
    noiseLevelLabels[spot.noiseLevel as NoiseLevel] || {
      label: spot.noiseLevel,
      badgeColor: "bg-slate-800 text-slate-300 border-slate-700",
      desc: "",
    };

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100 flex flex-col">
      <Header currentUser={session ? { userId: session.userId, username: session.username } : null} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 md:pl-64 p-4 sm:p-6 md:p-8 pb-24 md:pb-12 min-w-0">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-cyan-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้ารวมจุดอ่านหนังสือ</span>
            </Link>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-purple-500/20 bg-[#0d1226]/80 shadow-2xl">
            {/* Hero Image */}
            <div className="relative h-64 sm:h-96 w-full bg-[#0a0e1c]">
              <img
                src={spot.imageUrl}
                alt={spot.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/30 to-transparent" />

              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md ${noiseConfig.badgeColor}`}
                >
                  <Volume2 className="w-4 h-4" />
                  {noiseConfig.label}
                </span>
              </div>

              {isOwner && (
                <div className="absolute top-4 right-4">
                  <Link
                    href={`/spots/${spot.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white twilight-gradient-btn transition shadow-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไขข้อมูล</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 md:p-10 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                  {spot.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-300/70 mt-2.5">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{spot.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-400/60" />
                    <span>แนะนำโดย {spot.author?.username || "นิรนาม"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400/60" />
                    <span>
                      {new Date(spot.createdAt || Date.now()).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Native Audio Player Box */}
              <div className="p-5 rounded-2xl bg-[#080b14]/90 border border-indigo-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold">
                    <Volume2 className="w-4 h-4 text-pink-400" />
                    <span>เครื่องเล่นเสียงบรรยากาศจริง (Ambient Soundscape)</span>
                  </div>
                  <span className="text-[11px] text-indigo-300/50">{noiseConfig.desc}</span>
                </div>
                <audio controls src={spot.audioUrl} className="w-full" preload="none">
                  เบราว์เซอร์ของคุณไม่รองรับเครื่องเล่นเสียง
                </audio>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">
                  เกี่ยวกับมุมอ่านหนังสือนี้
                </h2>
                <p className="text-indigo-100/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {spot.description}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
