"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PlusCircle, User, Map, Headphones } from "lucide-react";

export default function BottomNav({ role }: { role?: "USER" | "ADMIN" }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { label: "แผนที่", href: "/", icon: Map, action: "map" },
    { label: "เพลงผ่อนคลาย", href: "/relaxation", icon: Headphones },
    { label: "Home", href: "/", icon: Home, isPrimary: true },
    { label: "เพิ่มจุด", href: "/spots/new", icon: PlusCircle },
    { label: "เข้าสู่ระบบ", href: "/login", icon: User },
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
    </div>
  );
}
