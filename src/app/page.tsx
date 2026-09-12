import { getSpots } from "@/actions/spot";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import FeaturedBanner from "@/components/FeaturedBanner";
import SpotFeed from "@/components/SpotFeed";
import NowPlayingSidebar from "@/components/NowPlayingSidebar";

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

  // Fetch spots from database or instant fallback
  const spots = await getSpots({ search, noiseLevel });
  const featuredSpot = spots.length > 0 ? spots[0] : null;

  // การตั้งค่าเว็บไซต์จาก DB (แอดมินปรับแต่งได้)
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen text-foreground flex flex-col transition-colors">
      {/* Top Header matching wireframe: Logo, Search, Theme Toggle, Login */}
      <Header
        currentUser={
          session ? { userId: session.userId, username: session.username } : null
        }
        settings={{
          logoLight: settings.logoLight,
          logoDark: settings.logoDark,
          siteName: settings.siteName,
          siteTagline: settings.siteTagline,
          role: session?.role,
        }}
      />

      <div className="flex-1 flex max-w-[1680px] w-full mx-auto relative">
        {/* Left Sidebar ("nav bar ไว้ใส่หน้าต่างๆ" as drawn in wireframe) */}
        <Sidebar logoDark={settings.logoDark} role={session?.role} />

        {/* Center Main Area + Right Sidebar ("เวลา sound เล่น") */}
        <div className="flex-1 md:pl-60 lg:pl-64 flex flex-col xl:flex-row gap-6 p-4 sm:p-6 md:p-8 pb-28 md:pb-16 min-w-0">
          {/* Center Column: Main Content */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* เสียงแนะนำ (Recommended Sounds Banner with . . . . dot indicators) */}
            <FeaturedBanner
              spot={featuredSpot}
              spots={spots}
              bannerSettings={{
                bannerLight: settings.bannerLight,
                bannerDark: settings.bannerDark,
                bannerTitle: settings.bannerTitle,
                bannerSubtitle: settings.bannerSubtitle,
              }}
            />

            {/* เสียงยอดนิยม (Popular Sounds with View All and Cards Grid) */}
            <SpotFeed spots={spots} currentUserId={session?.userId} />
          </main>

          {/* Right Column ("เวลา sound เล่น" - Now Playing Panel with Equalizer, Controls & Mixer) */}
          <div className="hidden xl:block shrink-0">
            <div className="sticky top-20">
              <NowPlayingSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Floating NowPlaying button on smaller screens */}
      <div className="xl:hidden">
        <NowPlayingSidebar />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
