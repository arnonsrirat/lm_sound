"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, PlusCircle, User, Map, Headphones, X, Mail, ShieldCheck, Clock3 } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export default function BottomNav({ role }: { role?: "USER" | "ADMIN" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { studyStats } = useAudio();
  const [profile, setProfile] = useState<{ username: string; email: string; name?: string | null; createdAt?: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!cancelled && data?.authenticated) setProfile(data.user); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("lmsound-profile-open", profileOpen);
    return () => document.body.classList.remove("lmsound-profile-open");
  }, [profileOpen]);

  const items = [
    { label: "แผนที่", href: "/", icon: Map, action: "map" },
    { label: "เพลงผ่อนคลาย", href: "/relaxation", icon: Headphones },
    { label: "Home", href: "/", icon: Home, isPrimary: true },
    { label: "เพิ่มจุด", href: "/spots/new", icon: PlusCircle },
    { label: profile ? "โปรไฟล์" : "เข้าสู่ระบบ", href: profile ? "#profile" : "/login", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-purple-500/25 bg-[var(--header-bg)]/95 backdrop-blur-2xl px-1 sm:px-4 py-1.5 h-[64px] flex items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <nav className="flex items-center justify-around w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-6 group"
              >
                <div className="w-11 h-11 rounded-full purple-gradient-btn text-white flex items-center justify-center shadow-lg shadow-purple-600/50 group-hover:scale-105 active:scale-95 transition border border-purple-300/50">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 font-bold text-fuchsia-300">
                  {item.label}
                </span>
              </Link>
            );
          }

          if (item.action === "map") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (pathname === "/") {
                    window.dispatchEvent(new CustomEvent("lmsound:open-campus-map"));
                  } else {
                    router.push("/?openMap=1");
                  }
                }}
                className="flex flex-col items-center py-1 px-1.5 sm:px-3 rounded-xl transition text-purple-300/70 hover:text-white"
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          }

          if (item.label === "โปรไฟล์") {
            return (
              <button key={item.label} type="button" onClick={() => setProfileOpen(true)} className="flex flex-col items-center py-1 px-1.5 sm:px-3 rounded-xl transition text-purple-300/70 hover:text-white">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-fuchsia-500/25 text-[9px] font-black text-fuchsia-200">{profile?.username?.slice(0, 1).toUpperCase()}</span>
                <span className="text-[10px] mt-0.5">โปรไฟล์</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.label === "เพิ่มจุด" && !role ? "/login?next=/spots/new&reason=auth-required" : item.href}
              className={`flex flex-col items-center py-1 px-1.5 sm:px-3 rounded-xl transition ${
                isActive
                  ? "text-fuchsia-400 font-bold bg-purple-500/15"
                  : "text-purple-300/70 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {profileOpen && profile && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm" onClick={() => setProfileOpen(false)}>
          <section className="w-full max-w-md rounded-3xl border border-purple-400/30 bg-[var(--sidebar-bg)] p-5 shadow-2xl animate-sweetalert" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div><p className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">บัญชีของฉัน</p><h2 className="mt-1 text-lg font-black text-white">{profile.name || profile.username}</h2></div>
              <button type="button" onClick={() => setProfileOpen(false)} className="rounded-full p-2 text-purple-200 hover:bg-purple-500/20" aria-label="ปิดโปรไฟล์"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center gap-3 rounded-2xl bg-purple-500/10 p-3"><Mail className="h-4 w-4 text-fuchsia-300" /><div><p className="text-[11px] text-purple-300/60">อีเมล</p><p className="break-all text-purple-100">{profile.email}</p></div></div>
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-3"><ShieldCheck className="h-4 w-4 text-emerald-300" /><div><p className="text-[11px] text-purple-300/60">สถานะบัญชี</p><p className="text-emerald-200">ใช้งานปกติ · {role === "ADMIN" ? "ผู้ดูแลระบบ" : "สมาชิก"}</p></div></div>
              <div className="flex items-center gap-3 rounded-2xl bg-purple-500/10 p-3"><Clock3 className="h-4 w-4 text-cyan-300" /><div><p className="text-[11px] text-purple-300/60">สถิติการใช้งาน</p><p className="text-purple-100">โฟกัสวันนี้ {Math.round((studyStats?.todayMinutes ?? 0))} นาที · สะสม {Math.round((studyStats?.totalMinutes ?? 0))} นาที</p></div></div>
            </div>
            <button type="button" onClick={() => { setProfileOpen(false); router.push("/profile"); }} className="mt-4 w-full rounded-2xl bg-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-900/30">แก้ไขโปรไฟล์และการตั้งค่าบัญชี</button>
          </section>
        </div>
      )}
    </div>
  );
}
