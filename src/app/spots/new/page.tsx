import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import SpotForm from "@/components/SpotForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewSpotPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/spots/new");

  return (
    <div className="min-h-screen text-foreground flex flex-col transition-colors">
      <Header currentUser={session ? { userId: session.userId, username: session.username } : null} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role={session?.role} />
        <main className="flex-1 md:pl-60 lg:pl-64 p-4 sm:p-6 pb-36 sm:pb-32 md:pb-28 min-w-0">
          <SpotForm />
        </main>
      </div>

      <BottomNav role={session?.role} />
    </div>
  );
}

