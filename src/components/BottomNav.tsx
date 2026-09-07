"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { label: "หน้าแรก", href: "/", icon: Home },
    { label: "สำรวจ", href: "/#feed", icon: Compass },
    { label: "เพิ่มจุด", href: "/spots/new", icon: PlusCircle, isPrimary: true },
    { label: "เข้าสู่ระบบ", href: "/login", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 py-2">
      <nav className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] mt-1 font-semibold text-emerald-400">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 transition ${
                isActive ? "text-emerald-400 font-medium" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
