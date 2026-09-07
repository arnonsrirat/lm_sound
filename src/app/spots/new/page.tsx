import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import SpotForm from "@/components/SpotForm";
import { getSession } from "@/lib/auth";

export default async function NewSpotPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header currentUser={session ? { userId: session.userId, username: session.username } : null} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 md:pl-64 p-4 sm:p-6 pb-24 md:pb-12 min-w-0">
          <SpotForm />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
