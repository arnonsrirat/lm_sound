"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "ยอดนิยม", href: "/#popular", icon: Compass },
    { label: "เพิ่มจุด", href: "/spots/new", icon: PlusCircle, isPrimary: true },
    { label: "เข้าสู่ระบบ", href: "/login", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-purple-500/20 bg-[var(--header-bg)] backdrop-blur-xl px-4 py-2">
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
                <div className="w-12 h-12 rounded-full purple-gradient-btn text-white flex items-center justify-center shadow-lg shadow-purple-600/40 group-hover:scale-105 transition border border-purple-300/40">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] mt-1 font-semibold text-purple-300">
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
                isActive ? "text-purple-400 font-bold" : "text-purple-300/60 hover:text-white"
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
