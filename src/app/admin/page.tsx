import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { getSpots } from "@/actions/spot";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Backstage - LMSound",
  description: "ระบบจัดการหลังบ้าน LMSound สำหรับผู้ดูแลระบบ",
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
    <AdminDashboard
      initialSettings={settings}
      currentUser={{
        userId: session.userId,
        username: session.username,
        role: session.role,
      }}
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
  );
}
