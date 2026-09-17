import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { getSpots } from "@/actions/spot";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Backstage - LMSound" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "ADMIN") redirect("/");
  const [settings, spots] = await Promise.all([getSiteSettings(), getSpots({ take: 100 })]);
  const requestedTab = (await searchParams).tab;
  const validTabs = ["spots", "logos-banners", "media", "relaxation", "themes", "texts", "users"] as const;
  const initialTab = validTabs.includes(requestedTab as (typeof validTabs)[number]) ? requestedTab as (typeof validTabs)[number] : "spots";
  return <AdminDashboard initialSettings={settings} initialSpots={spots.map((s) => ({ id: s.id, title: s.title, description: s.description, location: s.location, noiseLevel: s.noiseLevel, noiseScore: s.noiseScore, noiseSampleCount: s.noiseSampleCount, noiseSampleTarget: s.noiseSampleTarget, noiseAnalyzedAt: s.noiseAnalyzedAt, imageUrl: s.imageUrl, imageUrls: s.imageUrls ?? (s.imageUrl ? [s.imageUrl] : []), audioUrl: s.audioUrl, timeTag: s.timeTag, timeStart: s.timeStart, timeEnd: s.timeEnd, availabilityStatus: s.availabilityStatus, pendingFields: s.pendingFields ?? [], amenities: s.amenities ?? [], latitude: s.latitude, longitude: s.longitude, authorId: s.authorId, author: s.author ?? null }))} currentUser={{ userId: session.userId, username: session.username, role: session.role }} initialTab={initialTab} />;
}
