import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { getSpotById } from "@/actions/spot";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { MapPin, User, ArrowLeft, Edit3, Calendar, Compass } from "lucide-react";
import Link from "next/link";
import SpotDetailInteractive from "@/components/SpotDetailInteractive";
import CampusMap from "@/components/CampusMap";

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

  const mapSpot = {
    id: spot.id,
    title: spot.title,
    location: spot.location,
    noiseLevel: spot.noiseLevel,
    imageUrl: spot.imageUrl,
    description: spot.description,
    audioUrl: spot.audioUrl,
    latitude: spot.latitude ?? 7.80822,
    longitude: spot.longitude ?? 99.93869,
  };

  return (
    <div className="min-h-screen text-foreground flex flex-col transition-colors">
      <Header currentUser={session ? { userId: session.userId, username: session.username } : null} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role={session?.role} spots={[mapSpot]} />

        <main className="flex-1 md:pl-60 lg:pl-64 p-4 sm:p-6 md:p-8 pb-36 sm:pb-32 md:pb-28 min-w-0">
          <div className="mb-4 sm:mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-purple-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้ารวมจุดอ่านหนังสือ</span>
            </Link>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-purple-500/25 bg-[var(--card-bg)] shadow-2xl space-y-0">
            {/* Hero Image */}
            <div className="relative h-64 sm:h-80 md:h-96 w-full bg-purple-950/40">
              <img
                src={spot.imageUrl}
                alt={spot.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent" />

              {isOwner && (
                <div className="absolute top-4 right-4">
                  <Link
                    href={`/spots/${spot.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white purple-gradient-btn transition shadow-lg border border-purple-400/40"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไขข้อมูล</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="p-5 sm:p-8 md:p-10 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  {spot.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-purple-300/80 mt-3">
                  <div className="flex items-center gap-1.5 text-fuchsia-300 font-medium">
                    <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>{spot.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>แนะนำโดย {spot.author?.username || "นิรนาม"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>
                      {new Date(spot.createdAt ?? 0).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Audio Controls & Google Maps Direct Navigation */}
              <SpotDetailInteractive
                spot={{
                  id: spot.id,
                  title: spot.title,
                  description: spot.description,
                  location: spot.location,
                  noiseLevel: spot.noiseLevel,
                  imageUrl: spot.imageUrl,
                  audioUrl: spot.audioUrl,
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                }}
              />

              {/* Description */}
              <div className="space-y-2 pt-2 border-t border-purple-500/15">
                <h2 className="text-xs sm:text-sm font-bold text-purple-300 uppercase tracking-wider">
                  เกี่ยวกับมุมอ่านหนังสือนี้
                </h2>
                <p className="text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {spot.description}
                </p>
              </div>

              {/* Campus Map Location Preview */}
              <div className="space-y-3 pt-4 border-t border-purple-500/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-300 uppercase tracking-wider">
                    <Compass className="w-4 h-4 text-fuchsia-400" />
                    <span>ตำแหน่งพิกัดใน ม.ทักษิณ พัทลุง</span>
                  </div>
                  <span className="text-xs text-fuchsia-400 font-semibold">
                    {(spot.latitude ?? 7.80822).toFixed(5)}, {(spot.longitude ?? 99.93869).toFixed(5)}
                  </span>
                </div>
                <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-purple-500/25">
                  <CampusMap
                    spots={[mapSpot]}
                    selected={{
                      latitude: spot.latitude ?? 7.80822,
                      longitude: spot.longitude ?? 99.93869,
                    }}
                    interactive={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav role={session?.role} />
    </div>
  );
}

