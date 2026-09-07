import { getSpots } from "@/actions/spot";
import { getSession } from "@/lib/auth";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import FeaturedBanner from "@/components/FeaturedBanner";
import SpotFeed from "@/components/SpotFeed";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    noiseLevel?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search, noiseLevel } = await searchParams;
  const session = await getSession();

  // ดึงรายการจุดอ่านหนังสือ
  const spots = await getSpots({ search, noiseLevel });

  // นำจุดแรกที่เป็น quiet มาเป็น Featured หรือ fallback
  const featuredSpot = spots.length > 0 ? spots[0] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header (Top Nav) */}
      <Header currentUser={session ? { userId: session.userId, username: session.username } : null} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (Left Nav - image_77e669.jpg) */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 md:pl-64 p-4 sm:p-6 md:p-8 pb-24 md:pb-12 min-w-0">
          {/* Featured Sound Banner */}
          <FeaturedBanner spot={featuredSpot} />

          {/* Spots Feed Grid & Filter */}
          <SpotFeed spots={spots} currentUserId={session?.userId} />
        </main>
      </div>

      {/* Mobile Bottom Navigation (image_77e66e.png) */}
      <BottomNav />
    </div>
  );
}
