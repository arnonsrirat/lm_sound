import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { getSpots } from "@/actions/spot";
import Header from "@/components/Header";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard - LM Sound",
};

export default async function AdminPage() {
  const session = await getSession();

  // มีเฉพาะแอดมินเท่านั้น
  if (!session) {
    redirect("/login?next=/admin");
  }
  if (session.role !== "ADMIN") {
    redirect("/");
  }

  const [settings, spots] = await Promise.all([
    getSiteSettings(),
    getSpots({ take: 100 }),
  ]);

  return (
    <div className="min-h-screen text-foreground flex flex-col transition-colors">
      <Header
        currentUser={{ userId: session.userId, username: session.username }}
        settings={{
          logoLight: settings.logoLight,
          logoDark: settings.logoDark,
          siteName: settings.siteName,
          siteTagline: settings.siteTagline,
          role: session.role,
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 pb-28 md:pb-16">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold purple-gradient-text">
            หลังบ้าน (Admin Dashboard)
          </h1>
          <p className="text-sm text-purple-300/70 mt-1">
            จัดการสถานที่ โลโก้ แบนเนอร์ ธีมเว็บไซต์ และสิทธิ์ผู้ใช้ — ทุกอย่างปรับได้เองโดยไม่ต้องแก้โค้ด
          </p>
        </div>

        <AdminDashboard
          initialSettings={settings}
          initialSpots={spots.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            location: s.location,
            noiseLevel: s.noiseLevel,
            imageUrl: s.imageUrl,
            audioUrl: s.audioUrl,
            authorId: s.authorId,
            author: s.author ?? null,
          }))}
        />
      </main>
    </div>
  );
}
