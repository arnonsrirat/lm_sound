"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  ImageIcon,
  FolderOpen,
  Palette,
  FileText,
  Users,
  Headphones,
  Home,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";

export type AdminTab =
  | "spots"
  | "logos-banners"
  | "media"
  | "themes"
  | "texts"
  | "users"
  | "relaxation";

interface AdminSidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  currentUser?: {
    username: string;
    role?: string;
  } | null;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const NAV_ITEMS: {
  id: AdminTab;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}[] = [
  {
    id: "spots",
    label: "สถานที่ & โซนเสียง",
    sublabel: "Spots & Soundscapes",
    icon: MapPin,
  },
  {
    id: "logos-banners",
    label: "โลโก้ & แบนเนอร์",
    sublabel: "Logo & Banner Selector",
    icon: ImageIcon,
    badge: "ด่วน",
  },
  {
    id: "media",
    label: "คลังสื่อ & โฟลเดอร์",
    sublabel: "Uploads & Folders",
    icon: FolderOpen,
  },
  {
    id: "relaxation",
    label: "เพลงผ่อนคลาย",
    sublabel: "Playlists & Publishing",
    icon: Headphones,
  },
  {
    id: "themes",
    label: "ธีมเทศกาล & สีสัน",
    sublabel: "Festival Themes",
    icon: Palette,
  },
  {
    id: "texts",
    label: "ข้อความเว็บไซต์",
    sublabel: "Site Texts & Taglines",
    icon: FileText,
  },
  {
    id: "users",
    label: "จัดการผู้ใช้งาน",
    sublabel: "User Accounts & Roles",
    icon: Users,
  },
];

export default function AdminSidebar({
  currentTab,
  onTabChange,
  currentUser,
  isOpenMobile = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/";
    }
  };

  const content = (
    <div className="h-full flex flex-col justify-between py-6 px-3 bg-[var(--sidebar-bg)] border-r border-purple-500/20 text-foreground backdrop-blur-xl">
      {/* Top: Logo & Title */}
        <div className="space-y-5">
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl purple-gradient-btn flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base purple-gradient-text tracking-wide">
                  LMSound
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-foreground/50">ศูนย์จัดการระบบหลังบ้าน</p>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-foreground/60 hover:bg-purple-600/20"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-foreground/40 uppercase tracking-wider mb-2">
            เมนูการจัดการ
          </p>
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`${index === 2 ? "mt-4 pt-4 border-t border-purple-500/15" : ""} w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "purple-gradient-btn shadow-lg shadow-purple-900/40 font-semibold text-white"
                    : "text-foreground/70 hover:bg-purple-500/10 hover:text-foreground"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition ${
                    isActive ? "bg-white/20 text-white" : "bg-purple-500/10 text-purple-500 dark:text-purple-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-fuchsia-500/30 text-fuchsia-500 dark:text-fuchsia-200 border border-fuchsia-400/40">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-foreground/40 truncate">{item.sublabel}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Current Admin Profile & Back / Logout */}
      <div className="pt-4 border-t border-purple-500/15 space-y-3">
        {currentUser && (
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center font-bold text-sm text-purple-600 dark:text-purple-200 uppercase">
              {currentUser.username.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {currentUser.username}
              </p>
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ผู้ดูแลระบบ (Admin)
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground/70 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition"
          >
            <Home className="w-3.5 h-3.5" />
            ชมหน้าเว็บ
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:block w-64 lg:w-72 fixed inset-y-0 left-0 z-40">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs h-full z-10">{content}</div>
        </div>
      )}
    </>
  );
}
