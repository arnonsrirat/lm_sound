"use client";

import React, { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ImageIcon,
  Palette,
  LayoutDashboard,
  MapPin,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Menu,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  FolderOpen,
  ArrowRight,
  Upload,
  Sun,
  Moon,
} from "lucide-react";
import type { SiteSettings, FestivalTheme } from "@/lib/site-settings-constants";
import { FESTIVAL_THEME_LABELS } from "@/lib/site-settings-constants";
import { useRouter } from "next/navigation";
import type { SpotItem } from "@/lib/fallbackSpots";
import { getOptimizedImageUrl } from "@/lib/media-url";
import { availabilityStatuses, timeTags, type SpotInput, type AvailabilityStatus, type PendingFieldKey, type AmenityKey } from "@/lib/validations/spot";
import {
  updateSiteSettingsAction,
  adminCreateSpotAction,
  adminUpdateSpotAction,
  adminDeleteSpotAction,
  setUserRoleAction,
  getAdminUsersAction,
} from "@/actions/admin";
import NoiseGauge from "@/components/NoiseGauge";
import AdminSidebar, { type AdminTab } from "@/components/admin/AdminSidebar";
import MediaFolderPicker from "@/components/admin/MediaFolderPicker";
import CampusMap from "@/components/CampusMap";
import type { MediaFolder } from "@/actions/media";
import { AMENITY_OPTIONS } from "@/components/AmenityBadges";
import { notify as showNotice } from "@/lib/notify";
import RelaxationAdminPanel from "@/components/admin/RelaxationAdminPanel";

interface AdminDashboardProps {
  initialSettings: SiteSettings;
  initialSpots: SpotItem[];
  currentUser?: {
    userId: string;
    username: string;
    role?: string;
  } | null;
  initialTab?: AdminTab;
}

export default function AdminDashboard({
  initialSettings,
  initialSpots,
  currentUser,
  initialTab = "spots",
}: AdminDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [spots, setSpots] = useState<SpotItem[]>(initialSpots);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const nextIsDark = localStorage.getItem("lmsound-theme") === "dark";
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    document.documentElement.classList.toggle("light", !nextIsDark);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    document.documentElement.classList.toggle("light", !nextIsDark);
    localStorage.setItem("lmsound-theme", nextIsDark ? "dark" : "light");
  };

  // Picker Modal State for selecting image into a specific settings field
  const [pickerModal, setPickerModal] = useState<{
    isOpen: boolean;
    field: "logoLight" | "logoDark" | "bannerLight" | "bannerDark" | "bgLight";
    title: string;
    folder: MediaFolder;
  } | null>(null);

  const notify = (ok: boolean, msg: string) => {
    showNotice(msg, ok ? "success" : "error");
  };

  const askConfirm = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>,
    options?: { confirmLabel?: string; danger?: boolean }
  ) => {
    setConfirmDialog({ title, description, onConfirm, ...options });
  };

  const handleSaveSettings = () => {
    startTransition(async () => {
      const res = await updateSiteSettingsAction({
        logoLight: settings.logoLight,
        logoDark: settings.logoDark,
        bannerLight: settings.bannerLight,
        bannerDark: settings.bannerDark,
        bgLight: settings.bgLight || "/dreamy-lake-bg.png",
        siteName: settings.siteName,
        siteTagline: settings.siteTagline,
        festivalTheme: settings.festivalTheme,
        festivalStartDate: settings.festivalStartDate,
        festivalEndDate: settings.festivalEndDate,
        festivalStartTime: settings.festivalStartTime,
        festivalEndTime: settings.festivalEndTime,
        bannerTitle: settings.bannerTitle,
        bannerSubtitle: settings.bannerSubtitle,
        // สีธีม — ส่งไปบันทึก DB เพื่อ inject เป็น CSS variables ใน layout.tsx
        primaryColor: settings.primaryColor || "#8b5cf6",
        accentColor: settings.accentColor || "#0284c7",
        surfaceColor: settings.surfaceColor || "#ffffff",
        backgroundColor: settings.backgroundColor || "#fbf9ff",
        foregroundColor: settings.foregroundColor || "#1f1035",
      });
      if (res.success) {
        notify(true, "บันทึกการตั้งค่าเรียบร้อยแล้ว");
        router.refresh();
      } else {
        notify(false, res.error || "บันทึกไม่สำเร็จ");
      }
    });
  };

  const handleApplyPickedImage = (url: string) => {
    if (!pickerModal) return;
    setSettings((prev) => ({
      ...prev,
      [pickerModal.field]: url,
    }));
    notify(true, `เลือกรูป "${url}" สำหรับ ${pickerModal.title} แล้ว (อย่าลืมกดบันทึก)`);
    setPickerModal(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row transition-colors">
      {confirmDialog && (
        <AdminConfirmModal
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel={confirmDialog.confirmLabel}
          danger={confirmDialog.danger}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={async () => {
            const action = confirmDialog.onConfirm;
            setConfirmDialog(null);
            await action();
          }}
        />
      )}

      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        currentTab={tab}
        onTabChange={(newTab) => setTab(newTab)}
        currentUser={currentUser}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Admin Content Area */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-w-0">
        {/* Top Bar on Mobile and Breadcrumb Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-purple-500/15 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-purple-300 hover:bg-purple-600/20 transition cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-300/60 uppercase tracking-wider">
                  Admin Panel
                </span>
                <span className="text-xs text-purple-400/40">/</span>
                <span className="text-xs font-bold text-purple-200">
                  {tab === "spots" && "จัดการสถานที่"}
                  {tab === "logos-banners" && "โลโก้ & แบนเนอร์"}
                  {tab === "media" && "คลังสื่อ & โฟลเดอร์รูปภาพ"}
                  {tab === "relaxation" && "จัดการเพลงผ่อนคลาย & เพลย์ลิสต์"}
                  {tab === "themes" && "ธีมเทศกาล"}
                  {tab === "texts" && "ข้อความเว็บไซต์"}
                  {tab === "users" && "จัดการผู้ใช้งาน"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black purple-gradient-text">
                {tab === "spots" && "จัดการจุดอ่านหนังสือ & บรรยากาศ"}
                {tab === "logos-banners" && "จัดการโลโก้ & แบนเนอร์ (เลือกจากโฟลเดอร์)"}
                {tab === "media" && "คลังไฟล์รูปภาพ & โฟลเดอร์จัดเก็บ"}
                {tab === "relaxation" && "จัดการรายการเพลงและอัลบั้มที่เผยแพร่"}
                {tab === "themes" && "ปรับแต่งธีมเทศกาล & ฤดูกาล"}
                {tab === "texts" && "ปรับแต่งข้อความ & สโลแกนเว็บไซต์"}
                {tab === "users" && "ผู้ใช้งาน & สิทธิ์ในระบบ"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleTheme} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/25 text-purple-200 hover:bg-purple-600/20" aria-label="สลับธีมสว่างและมืด" title={isDark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}>
              {isDark ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-purple-500" />}
            </button>
            <Link
              href="/"
              className="hidden"
            >
              <span>ชมหน้าเว็บ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {(tab === "logos-banners" || tab === "themes" || tab === "texts") && (
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold purple-gradient-btn shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                บันทึกการตั้งค่า
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main
          className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto"
          style={{ paddingBottom: "8rem", scrollPaddingBottom: "8rem" }}
        >
          {tab === "spots" && (
            <SpotsTab spots={spots} setSpots={setSpots} notify={notify} askConfirm={askConfirm} />
          )}

          {tab === "logos-banners" && (
            <LogosBannersTab
              settings={settings}
              setSettings={setSettings}
              onOpenPicker={(field, title, folder) =>
                setPickerModal({ isOpen: true, field, title, folder })
              }
              onSave={handleSaveSettings}
              isPending={isPending}
            />
          )}

          {tab === "media" && (
            <div className="space-y-4">
              <R2StoragePanel />
              <div className="glass-panel rounded-3xl p-5 md:p-6">
              <MediaFolderPicker
                targetTitle="คลังสื่อทั้งหมด รวมอัลบั้มเพลงผ่อนคลาย"
                defaultFolder="logos"
              />
              </div>
            </div>
          )}

          {tab === "relaxation" && <RelaxationAdminPanel />}

          {tab === "themes" && (
            <ThemesTab
              settings={settings}
              setSettings={setSettings}
              onSave={handleSaveSettings}
              isPending={isPending}
            />
          )}

          {tab === "texts" && (
            <TextsTab
              settings={settings}
              setSettings={setSettings}
              onSave={handleSaveSettings}
              isPending={isPending}
            />
          )}

          {tab === "users" && (
            <UsersTab currentUserId={currentUser?.userId} notify={notify} askConfirm={askConfirm} />
          )}
        </main>
      </div>

      {/* Media Picker Modal */}
      {pickerModal && (
        <MediaFolderPicker
          isModal
          targetTitle={`เลือกรูปภาพสำหรับ: ${pickerModal.title}`}
          defaultFolder={pickerModal.folder}
          selectedUrl={settings[pickerModal.field]}
          onSelect={handleApplyPickedImage}
          onClose={() => setPickerModal(null)}
        />
      )}
    </div>
  );
}

function GoogleDriveStorageUsage() {
  const [usage, setUsage] = useState<{ used: number; limit: number | null } | null>(null);
  useEffect(() => { void fetch("/api/admin/google-drive/status", { cache: "no-store" }).then((response) => response.json()).then((data) => setUsage(data.data?.storage || null)).catch(() => undefined); }, []);
  if (!usage) return null;
  const format = (bytes: number) => `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const percent = usage.limit ? Math.min(100, (usage.used / usage.limit) * 100) : null;
  return <div className="glass-panel rounded-3xl p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-bold text-foreground">พื้นที่ Google Drive</h3><p className="mt-1 text-xs text-foreground/60">พื้นที่ที่ใช้โดยบัญชี Google Drive ที่เชื่อมต่ออยู่</p></div><span className="text-sm font-bold text-cyan-300">{format(usage.used)}{usage.limit ? ` / ${format(usage.limit)}` : ""}</span></div>{percent !== null && <><div className="mt-3 h-2 overflow-hidden rounded-full bg-purple-950/40"><div className={`h-full rounded-full ${percent > 85 ? "bg-rose-400" : "bg-cyan-400"}`} style={{ width: `${percent}%` }} /></div><p className="mt-1 text-right text-[11px] text-foreground/60">ใช้ไป {percent.toFixed(1)}%</p></>}</div>;
}

function R2StoragePanel() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  useEffect(() => { void fetch("/api/uploads/status", { cache: "no-store" }).then((response) => response.json()).then((data) => setConfigured(Boolean(data.success && data.data?.configured))).catch(() => setConfigured(false)); }, []);
  if (configured === null) return <div className="glass-panel rounded-3xl p-4 text-xs text-purple-300/70 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> กำลังตรวจสอบ Cloudflare R2…</div>;
  return <div className={`rounded-3xl border p-5 ${configured ? "border-emerald-400/35 bg-emerald-500/10" : "border-amber-400/35 bg-amber-500/10"}`}><div className="flex items-start gap-3"><FolderOpen className={`h-5 w-5 shrink-0 ${configured ? "text-emerald-300" : "text-amber-300"}`} /><div><h3 className={`font-bold ${configured ? "text-emerald-100" : "text-amber-100"}`}>{configured ? "เชื่อมต่อ Cloudflare R2 แล้ว" : "ยังไม่ได้ตั้งค่า Cloudflare R2"}</h3><p className={`mt-1 text-xs leading-5 ${configured ? "text-emerald-100/75" : "text-amber-100/75"}`}>{configured ? "ไฟล์ใหม่จะอัปโหลดตรงจากอุปกรณ์ไปยัง R2 และฐานข้อมูลจะเก็บเฉพาะ metadata" : "เพิ่ม R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME และ R2_PUBLIC_URL ใน production environment"}</p></div></div></div>;
}

/* ========================================================================= */
/* 1. Tab: โลโก้ & แบนเนอร์ (เลือกจากโฟลเดอร์ & อัปโหลดได้ง่ายดาย)               */
/* ========================================================================= */
function LogosBannersTab({
  settings,
  setSettings,
  onOpenPicker,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onOpenPicker: (
    field: "logoLight" | "logoDark" | "bannerLight" | "bannerDark" | "bgLight",
    title: string,
    folder: MediaFolder
  ) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const cards: {
    field: "logoLight" | "logoDark" | "bannerLight" | "bannerDark" | "bgLight";
    title: string;
    subtitle: string;
    folder: MediaFolder;
    aspect: "logo" | "banner";
  }[] = [
    {
      field: "logoLight",
      title: "☀️ โลโก้ (ธีมสว่าง)",
      subtitle: "แสดงที่มุมซ้ายบนของเว็บในโหมดสว่าง",
      folder: "logos",
      aspect: "logo",
    },
    {
      field: "logoDark",
      title: "🌙 โลโก้ (ธีมมืด)",
      subtitle: "แสดงที่มุมซ้ายบนของเว็บในโหมดมืด (ค่าเริ่มต้น)",
      folder: "logos",
      aspect: "logo",
    },
    {
      field: "bannerLight",
      title: "☀️ แบนเนอร์หน้าแรก (ธีมสว่าง)",
      subtitle: "ภาพส่วนหัวแนะนำในหน้าแรก (Light Mode)",
      folder: "banners",
      aspect: "banner",
    },
    {
      field: "bannerDark",
      title: "🌙 แบนเนอร์หน้าแรก (ธีมมืด)",
      subtitle: "ภาพส่วนหัวแนะนำในหน้าแรก (Dark Mode)",
      folder: "banners",
      aspect: "banner",
    },
    {
      field: "bgLight",
      title: "☀️ ภาพพื้นหลังเว็บไซต์ (ธีมสว่าง)",
      subtitle: "ภาพวิวพื้นหลังของเว็บไซต์ในโหมดสว่าง (ค่าเริ่มต้น: ทะเลสาบดรีมมี่)",
      folder: "banners",
      aspect: "banner",
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="glass-panel rounded-3xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/15">
          <div>
            <h2 className="font-bold text-lg text-purple-100 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-fuchsia-400" />
              การจัดการรูปภาพโลโก้และแบนเนอร์
            </h2>
            <p className="text-xs text-purple-300/60 mt-0.5">
              คุณสามารถกด <strong>&ldquo;เลือกรูปจากโฟลเดอร์&rdquo;</strong> เพื่อดูคลังรูปที่มีอยู่
              หรืออัปโหลดรูปใหม่เข้าโฟลเดอร์ได้ทันที
            </p>
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold purple-gradient-btn shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-60 shrink-0"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            บันทึกการตั้งค่าทั้งหมด
          </button>
        </div>

        {/* Grid of 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {cards.map((c) => {
            const currentVal = settings[c.field];
            return (
              <div
                key={c.field}
                className="rounded-3xl border border-purple-500/20 bg-purple-950/20 p-5 space-y-4 flex flex-col justify-between hover:border-purple-400/40 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-purple-100">{c.title}</h3>
                      <p className="text-xs text-purple-300/60 mt-0.5">{c.subtitle}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-300 border border-purple-500/20">
                      โฟลเดอร์: {c.folder}
                    </span>
                  </div>

                  {/* Preview Area */}
                  <div className="mt-3.5 rounded-2xl overflow-hidden border border-purple-500/30 bg-black/40 flex items-center justify-center p-3 relative group">
                    {c.aspect === "logo" ? (
                      <div className="h-28 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getOptimizedImageUrl(currentVal)}
                          alt={c.title}
                          className="max-h-24 max-w-full object-contain drop-shadow-md group-hover:scale-105 transition"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-full flex items-center justify-center overflow-hidden rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getOptimizedImageUrl(currentVal)}
                          alt={c.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    )}
                  </div>

                  {/* Direct input URL if needed */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-purple-300/70">
                      พาธรูปปัจจุบัน:
                    </span>
                    <input
                      value={currentVal}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, [c.field]: e.target.value }))
                      }
                      className="w-full mt-1 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/25 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-400/80"
                      placeholder="/uploads/..."
                    />
                  </div>
                </div>

                {/* Pick / Upload Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenPicker(c.field, c.title, c.folder)}
                    className="w-full py-2.5 px-4 rounded-2xl text-xs font-semibold purple-gradient-btn shadow-md shadow-purple-950/40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4" />
                    เลือกรูปจากโฟลเดอร์ &amp; อัปโหลด
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 2. Tab: จัดการสถานที่ & การ์ด                                               */
/* ========================================================================= */
function SpotsTab({
  spots,
  setSpots,
  notify,
  askConfirm,
}: {
  spots: SpotItem[];
  setSpots: (s: SpotItem[]) => void;
  notify: (ok: boolean, msg: string) => void;
  askConfirm: (title: string, description: string, onConfirm: () => void | Promise<void>, options?: { confirmLabel?: string; danger?: boolean }) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<SpotItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (spot: SpotItem) => {
    askConfirm(
      "ยืนยันการลบสถานที่",
      `ต้องการลบ "${spot.title}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      () => startTransition(async () => {
        const res = await adminDeleteSpotAction(spot.id);
        if (res.success) {
          setSpots(spots.filter((s) => s.id !== spot.id));
          notify(true, "ลบสถานที่เรียบร้อย");
        } else {
          notify(false, res.error || "ลบไม่สำเร็จ");
        }
      }),
      { confirmLabel: "ลบสถานที่", danger: true }
    );
  };

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-lg text-purple-100">สถานที่ทั้งหมด ({spots.length})</h2>
          <p className="text-xs text-purple-300/60">
            เพิ่มโซน ห้องอัดเสียง หรือจุดอ่านหนังสือใหม่ — แอดมินแก้ไข/ลบได้ทุกรายการ
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSpot(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold purple-gradient-btn shadow-lg shadow-purple-900/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          เพิ่มสถานที่ใหม่
        </button>
      </div>

      {showForm && (
        <AdminSpotForm
          spot={editingSpot}
          onClose={() => setShowForm(false)}
          onSaved={(saved, isNew) => {
            if (isNew) {
              setSpots([saved, ...spots]);
            } else {
              setSpots(spots.map((s) => (s.id === saved.id ? saved : s)));
            }
            setShowForm(false);
            notify(true, isNew ? "เพิ่มสถานที่เรียบร้อย" : "อัปเดตสถานที่เรียบร้อย");
          }}
          notify={notify}
          mapSpots={spots}
        />
      )}

      <div className="space-y-2.5 mt-4">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-purple-500/15 bg-purple-950/20 hover:bg-purple-600/15 transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getOptimizedImageUrl(spot.imageUrl)}
              alt={spot.title}
              className="w-16 h-16 rounded-2xl object-cover border border-purple-500/25 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-purple-100 truncate">{spot.title}</p>
              <p className="text-xs text-purple-300/60 truncate flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0 text-purple-400" />
                {spot.location}
              </p>
              <div className="mt-1.5">
                <NoiseGauge noiseLevel={spot.noiseLevel} compact />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setEditingSpot(spot);
                  setShowForm(true);
                }}
                className="p-2.5 rounded-xl text-purple-300 hover:bg-purple-500/20 hover:text-white transition cursor-pointer"
                title="แก้ไข"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(spot)}
                disabled={isPending}
                className="p-2.5 rounded-xl text-rose-300/80 hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer"
                title="ลบ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {spots.length === 0 && (
          <p className="text-center text-sm text-purple-300/50 py-12">
            ยังไม่มีสถานที่ในระบบ — กดปุ่ม &ldquo;เพิ่มสถานที่ใหม่&rdquo; เพื่อเริ่มสร้าง
          </p>
        )}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* ฟอร์มเพิ่ม/แก้ไขสถานที่                                                     */
/* ========================================================================= */
function AdminSpotForm({
  spot,
  onClose,
  onSaved,
  notify,
  mapSpots,
}: {
  spot: SpotItem | null;
  onClose: () => void;
  onSaved: (spot: SpotItem, isNew: boolean) => void;
  notify: (ok: boolean, msg: string) => void;
  mapSpots: SpotItem[];
}) {
  const isEdit = !!spot;
  useEffect(() => {
    document.body.classList.add("lmsound-editor-open");
    return () => document.body.classList.remove("lmsound-editor-open");
  }, []);
  const [title, setTitle] = useState(spot?.title || "");
  const [description, setDescription] = useState(spot?.description || "");
  const [location, setLocation] = useState(spot?.location || "");
  const [noiseLevel, setNoiseLevel] = useState<"quiet" | "moderate" | "lively">(
    (spot?.noiseLevel as "quiet" | "moderate" | "lively") || "quiet"
  );
  const [imageUrl, setImageUrl] = useState(spot?.imageUrl || "");
  const [imageUrls, setImageUrls] = useState(spot?.imageUrls?.length ? spot.imageUrls : (spot?.imageUrl ? [spot.imageUrl] : []));
  const [audioUrl, setAudioUrl] = useState(spot?.audioUrl || "");
  const [timeTag, setTimeTag] = useState(spot?.timeTag || "");
  const [timeStart, setTimeStart] = useState<number | null>(spot?.timeStart ?? null);
  const [timeEnd, setTimeEnd] = useState<number | null>(spot?.timeEnd ?? null);
  const [amenities, setAmenities] = useState<AmenityKey[]>((spot?.amenities || []) as AmenityKey[]);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>((spot?.availabilityStatus as AvailabilityStatus) || "READY");
  const [pendingFields, setPendingFields] = useState<PendingFieldKey[]>((spot?.pendingFields || []) as PendingFieldKey[]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [latitude, setLatitude] = useState(spot?.latitude ?? 7.80822);
  const [longitude, setLongitude] = useState(spot?.longitude ?? 99.93869);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [pickerOpen, setPickerOpen] = useState<"image" | "audio" | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string[]> = {};
    const addError = (field: string, message: string) => {
      nextErrors[field] = [message];
    };

    if (title.trim().length < 2) addError("title", "กรุณากรอกชื่อสถานที่อย่างน้อย 2 ตัวอักษร");
    if (location.trim().length < 2) addError("location", "กรุณาระบุตำแหน่งหรือโซนอย่างน้อย 2 ตัวอักษร");
    if (!pendingFields.includes("description") && description.trim().length < 10) {
      addError("description", "กรุณากรอกรายละเอียดอย่างน้อย 10 ตัวอักษร หรือเลือก 'รออัปเดต'");
    }
    if (!pendingFields.includes("images") && !imageUrl) addError("imageUrl", "กรุณาเลือกรูปภาพ หรือเลือก 'รออัปเดต'");
    if (!pendingFields.includes("audio") && !audioUrl) addError("audioUrl", "กรุณาเลือกเสียง หรือเลือก 'รออัปเดต'");

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      notify(false, "กรุณาตรวจสอบช่องที่ไฮไลท์ก่อนบันทึก");
      return;
    }

    startTransition(async () => {
      const payload = {
        title,
        description,
        location,
        noiseLevel,
        imageUrl,
        imageUrls,
        audioUrl,
        timeTag: (timeTag || null) as SpotInput["timeTag"],
        timeStart,
        timeEnd,
        amenities,
        availabilityStatus,
        pendingFields,
        latitude,
        longitude,
      };

      try {
        if (isEdit && spot) {
          const res = await adminUpdateSpotAction(spot.id, payload);
          if (res.success && res.data) {
            onSaved(res.data as SpotItem, false);
          } else {
            setFieldErrors(res.fieldErrors || {});
            notify(false, res.error || "แก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          }
        } else {
          const res = await adminCreateSpotAction(payload);
          if (res.success && res.data) {
            onSaved(res.data as SpotItem, true);
          } else {
            setFieldErrors(res.fieldErrors || {});
            notify(false, res.error || "สร้างไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
          }
        }
      } catch (error) {
        notify(false, error instanceof Error ? `บันทึกไม่สำเร็จ: ${error.message}` : "บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="admin-spot-form-title">
      <div className="glass-panel rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border border-purple-500/30">
        <h3 id="admin-spot-form-title" className="font-bold text-lg mb-4 text-purple-100">
          {isEdit ? "แก้ไขสถานที่" : "เพิ่มสถานที่ใหม่"}
        </h3>
        {Object.keys(fieldErrors).length > 0 && (
          <div className="mb-4 rounded-2xl border border-rose-400/35 bg-rose-500/10 p-3 text-xs text-rose-100" role="alert">
            <p className="font-bold">กรุณาตรวจสอบข้อมูลที่ไฮไลท์</p>
            <p className="mt-1 text-rose-100/80">{Object.values(fieldErrors).flat().join(" • ")}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-purple-300/80">ชื่อสถานที่</label>
            <input
              required
              value={title}
              onChange={(e) => { setTitle(e.target.value); setFieldErrors((current) => { const next = { ...current }; delete next.title; return next; }); }}
              className={`w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border text-sm ${fieldErrors.title ? "border-rose-400 ring-2 ring-rose-400/20" : "border-purple-500/25"}`}
              placeholder="เช่น Library Corner, Cafe Noir"
            />
            {fieldErrors.title && <p className="mt-1 text-[11px] font-semibold text-rose-300">{fieldErrors.title[0]}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-purple-300/80">รายละเอียด</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setFieldErrors((current) => { const next = { ...current }; delete next.description; return next; }); }}
              className={`w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border text-sm ${fieldErrors.description ? "border-rose-400 ring-2 ring-rose-400/20" : "border-purple-500/25"}`}
            />
            {fieldErrors.description && <p className="mt-1 text-[11px] font-semibold text-rose-300">{fieldErrors.description[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-purple-300/80">ที่ตั้ง / โซน</label>
              <input
                value={location}
                onChange={(e) => { setLocation(e.target.value); setFieldErrors((current) => { const next = { ...current }; delete next.location; return next; }); }}
                className={`w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border text-sm ${fieldErrors.location ? "border-rose-400 ring-2 ring-rose-400/20" : "border-purple-500/25"}`}
              />
              {fieldErrors.location && <p className="mt-1 text-[11px] font-semibold text-rose-300">{fieldErrors.location[0]}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-purple-300/80">ระดับเสียง</label>
              <select
                value={noiseLevel}
                onChange={(e) =>
                  setNoiseLevel(e.target.value as "quiet" | "moderate" | "lively")
                }
                className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/25 text-sm"
              >
                <option value="quiet">Quiet (เงียบสงบ)</option>
                <option value="moderate">Moderate (ปานกลาง)</option>
                <option value="lively">Lively (คึกคัก)</option>
              </select>
              <button type="button" disabled={!audioUrl || isAnalyzing} onClick={async () => { setIsAnalyzing(true); try { const audio = new Audio(audioUrl); const ctx = new AudioContext(); const response = await fetch(audioUrl); const buffer = await ctx.decodeAudioData(await response.arrayBuffer()); const data = buffer.getChannelData(0); let sum = 0; for (let i = 0; i < data.length; i += Math.max(1, Math.floor(data.length / 50000))) sum += data[i] * data[i]; const rms = Math.sqrt(sum / Math.ceil(data.length / Math.max(1, Math.floor(data.length / 50000)))); setNoiseLevel(rms < 0.08 ? "quiet" : rms < 0.2 ? "moderate" : "lively"); void audio; await ctx.close(); } catch { notify(false, "วิเคราะห์เสียงไม่สำเร็จ"); } finally { setIsAnalyzing(false); } }} className="mt-2 text-[11px] text-cyan-300 underline cursor-pointer disabled:opacity-50">{isAnalyzing ? "กำลังวิเคราะห์…" : "วิเคราะห์เสียงรบกวนอัตโนมัติ"}</button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-300/80">พิกัดบนแผนที่มหาวิทยาลัย</label>
              <span className="text-[10px] text-cyan-300">{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
            </div>
            <p className="text-[11px] text-cyan-300/80">ดับเบิลคลิกเพื่อยืนยันตำแหน่งหมุด (คลิกครั้งเดียวใช้เลื่อนแผนที่) · หมุดที่มีอยู่จะแสดงบนแผนที่</p>
            <CampusMap spots={mapSpots} selected={{ latitude, longitude }} interactive onPick={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-300/80">รูปภาพจากคลัง</label>
              <button
                type="button"
                onClick={() => setPickerOpen("image")}
                className="text-[11px] text-fuchsia-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
               เลือกจากคลังภาพหลายรูป
              </button>
            </div>
            <input
              value={imageUrl}
              readOnly
              disabled
              onClick={() => setPickerOpen("image")}
              onChange={(e) => setImageUrl(e.target.value)}
              className={`w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border text-sm ${fieldErrors.imageUrl ? "border-rose-400 ring-2 ring-rose-400/20" : "border-purple-500/25"}`}
              placeholder="เลือกภาพจากคลังภาพ"
            />
            <div className="mt-2 grid grid-cols-4 gap-2">{imageUrls.map((url) => <img key={url} src={getOptimizedImageUrl(url)} alt="ภาพสถานที่" loading="lazy" decoding="async" className="h-14 w-full rounded-lg object-cover" />)}</div>
            {fieldErrors.imageUrl && <p className="mt-1 text-[11px] font-semibold text-rose-300">{fieldErrors.imageUrl[0]}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-purple-300/80">ช่วงเวลา
              <select value={timeTag} onChange={(e) => setTimeTag(e.target.value)} className="mt-1 w-full rounded-xl bg-purple-950/40 border border-purple-500/25 px-3 py-2 text-sm"><option value="">ไม่ระบุ</option>{timeTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select>
              <span className="mt-2 block text-[10px] text-purple-300/60">กำหนดช่วงเวลาแนะนำ (ข้ามเที่ยงคืนได้)</span>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <select aria-label="เวลาเริ่มต้น" value={timeStart ?? ""} onChange={(e) => setTimeStart(e.target.value === "" ? null : Number(e.target.value))} className="rounded-xl bg-purple-950/40 border border-purple-500/25 px-3 py-2 text-sm"><option value="">เริ่มเวลา</option>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>)}</select>
                <select aria-label="เวลาสิ้นสุด" value={timeEnd ?? ""} onChange={(e) => setTimeEnd(e.target.value === "" ? null : Number(e.target.value))} className="rounded-xl bg-purple-950/40 border border-purple-500/25 px-3 py-2 text-sm"><option value="">ถึงเวลา</option>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>)}</select>
              </div>
            </label>
            <label className="text-xs font-semibold text-purple-300/80">สถานะข้อมูล
              <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)} className="mt-1 w-full rounded-xl bg-purple-950/40 border border-purple-500/25 px-3 py-2 text-sm">{availabilityStatuses.map((status) => <option key={status} value={status}>{status === "READY" ? "พร้อมใช้งาน" : status === "PENDING_UPDATE" ? "รออัปเดตข้อมูล" : "ยังไม่พร้อม"}</option>)}</select>
            </label>
          </div>

          <fieldset className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-3">
            <legend className="px-1 text-xs font-semibold text-amber-200">ส่วนที่รออัปเดตภายหลัง</legend>
            <p className="mb-2 text-[11px] text-amber-100/70">ติ๊กข้อมูลที่ยังไม่มีได้ ระบบจะบันทึกสถานที่ก่อน แล้วค่อยกลับมาเติมภายหลัง</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-100 sm:grid-cols-3">
              {([['description', 'รายละเอียด'], ['noiseLevel', 'ระดับเสียง'], ['images', 'รูปภาพ'], ['audio', 'เสียงบรรยากาศ'], ['timeTag', 'ช่วงเวลา'], ['location', 'ตำแหน่งข้อความ']] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-950/25 px-2.5 py-2">
                  <input type="checkbox" checked={pendingFields.includes(key)} onChange={(event) => setPendingFields((current) => event.target.checked ? [...new Set([...current, key])] : current.filter((item) => item !== key))} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-cyan-300/25 bg-cyan-400/5 p-3">
            <legend className="px-1 text-xs font-semibold text-cyan-100">สิ่งอำนวยความสะดวกบริเวณนี้</legend>
            <p className="mb-2 text-[11px] text-cyan-100/65">เลือกได้หลายรายการ ไอคอนที่เลือกจะแสดงแบบไฮไลท์บนการ์ดสถานที่</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AMENITY_OPTIONS.map(({ key, label, Icon }) => {
                const selected = amenities.includes(key);
                return <button key={key} type="button" onClick={() => setAmenities((current) => selected ? current.filter((item) => item !== key) : [...current, key])} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition ${selected ? "border-cyan-200 bg-cyan-400/25 text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.2)]" : "border-purple-500/20 bg-purple-950/25 text-purple-200 hover:border-cyan-300/50"}`}><Icon className="h-4 w-4 shrink-0" /><span>{label}</span></button>;
              })}
            </div>
          </fieldset>

          <div>
            <div className="flex items-center justify-between"><label className="text-xs font-semibold text-purple-300/80">เสียงบรรยากาศจากคลัง</label><button type="button" onClick={() => setPickerOpen("audio")} className="text-[11px] text-fuchsia-300 cursor-pointer">เลือกจากคลังเสียง</button></div>
            <input
              value={audioUrl}
              readOnly
              disabled
              onClick={() => setPickerOpen("audio")}
              onChange={(e) => setAudioUrl(e.target.value)}
              className={`w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border text-sm ${fieldErrors.audioUrl ? "border-rose-400 ring-2 ring-rose-400/20" : "border-purple-500/25"}`}
              placeholder="เลือกเสียงจากคลังเสียง"
            />
            {fieldErrors.audioUrl && <p className="mt-1 text-[11px] font-semibold text-rose-300">{fieldErrors.audioUrl[0]}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-900/30 hover:bg-purple-600/20 text-purple-300 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl text-xs font-semibold purple-gradient-btn shadow-lg cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "บันทึกการแก้ไข" : "สร้างสถานที่"}
            </button>
          </div>
        </form>
      </div>

      {pickerOpen && (
        <MediaFolderPicker
          isModal
          targetTitle="เลือกรูปภาพสำหรับสถานที่"
          defaultFolder={pickerOpen === "audio" ? "audio" : "general"}
          allowedFolder={pickerOpen === "audio" ? "audio" : "general"}
          selectedUrl={pickerOpen === "audio" ? audioUrl : imageUrl}
          selectedUrls={imageUrls}
          multiSelect={pickerOpen === "image"}
          onSelect={(url) => {
            if (pickerOpen === "audio") {
              setAudioUrl(url);
              setFieldErrors((current) => { const next = { ...current }; delete next.audioUrl; return next; });
            } else {
              setImageUrl(url);
              setImageUrls([url]);
              setFieldErrors((current) => { const next = { ...current }; delete next.imageUrl; return next; });
            }
            setPickerOpen(null);
          }}
          onSelectMany={(urls) => { if (pickerOpen === "image" && urls.length > 0) { setImageUrl(urls[0]); setImageUrls(urls); setFieldErrors((current) => { const next = { ...current }; delete next.imageUrl; return next; }); } setPickerOpen(null); }}
          onClose={() => setPickerOpen(null)}
        />
      )}
    </div>
  );
}

/* ========================================================================= */
/* 3. Tab: ธีมเทศกาล & สีสัน                                                   */
/* ========================================================================= */
function ThemesTab({
  settings,
  setSettings,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onSave: () => void;
  isPending: boolean;
}) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  // Initialize จากค่า settings ใน DB (primaryColor/accentColor/surfaceColor/backgroundColor/foregroundColor)
  const [lightPalette, setLightPalette] = useState({
    primary: settings.primaryColor || "#8b5cf6",
    accent: settings.accentColor || "#0284c7",
    surface: settings.surfaceColor || "#ffffff",
    background: settings.backgroundColor || "#fbf9ff",
    text: settings.foregroundColor || "#1f1035",
  });
  const [darkPalette, setDarkPalette] = useState({ primary: "#a855f7", accent: "#22d3ee", surface: "#160b2b", background: "#080510", text: "#f5f3ff" });
  const palette = mode === "light" ? lightPalette : darkPalette;
  const [presetName, setPresetName] = useState("");
  const [presets, setPresets] = useState<Array<{ name: string; palette: typeof palette }>>([]);
  useEffect(() => { try { const saved = localStorage.getItem("lmsound-theme-presets"); if (saved) setPresets(JSON.parse(saved)); } catch { /* ignore malformed local presets */ } }, []);
  const applyPalette = (next: typeof palette) => {
    if (mode === "light") setLightPalette(next); else setDarkPalette(next);
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", next.primary);
    root.style.setProperty("--theme-accent", next.accent);
    root.style.setProperty("--theme-surface", next.surface);
    root.style.setProperty("--theme-background", next.background);
    root.style.setProperty("--theme-foreground", next.text);

    // Sync สีกลับไปที่ settings state เมื่อปรับแต่งธีมสว่าง เพื่อให้ onSave → บันทึกลง JSON/DB ได้จริง
    if (mode === "light") {
      setSettings((prev) => ({
        ...prev,
        primaryColor: next.primary,
        accentColor: next.accent,
        surfaceColor: next.surface,
        backgroundColor: next.background,
        foregroundColor: next.text,
      }));
    }
  };
  const calculateTheme = () => { const opposite = mode === "light" ? { primary: palette.primary, accent: palette.accent, surface: "#160b2b", background: "#080510", text: "#f5f3ff" } : { primary: palette.primary, accent: palette.accent, surface: "#ffffff", background: "#f1f5f9", text: "#111827" }; if (mode === "light") setDarkPalette(opposite); else setLightPalette(opposite); };
  const FESTIVAL_CLASSES = ["festival-songkran", "festival-loykratong", "festival-newyear", "festival-christmas"];

  /** Apply ธีมเทศกาลบน <html> ทันที (Preview real-time) */
  const applyFestivalTheme = (theme: FestivalTheme) => {
    const root = document.documentElement;
    // ลบ festival class เดิมทั้งหมดออกก่อน
    FESTIVAL_CLASSES.forEach((cls) => root.classList.remove(cls));
    // ถ้าไม่ใช่ default ให้ใส่ class ใหม่
    if (theme !== "default") {
      root.classList.add(`festival-${theme}`);
    }
    // sync settings state เพื่อให้ onSave ส่งขึ้น DB ด้วย
    setSettings((prev) => ({ ...prev, festivalTheme: theme }));
  };

  const savePreset = () => { if (!presetName.trim()) return; const next = [...presets.filter((item) => item.name !== presetName.trim()), { name: presetName.trim(), palette }]; setPresets(next); localStorage.setItem("lmsound-theme-presets", JSON.stringify(next)); setPresetName(""); };
  if (true) return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 space-y-5">
      <div className="flex gap-2"><button type="button" onClick={() => setMode("light")} className={`px-4 py-2 rounded-xl text-xs cursor-pointer ${mode === "light" ? "purple-gradient-btn" : "bg-purple-950/40"}`}>ธีมสว่าง (Light)</button><button type="button" onClick={() => setMode("dark")} className={`px-4 py-2 rounded-xl text-xs cursor-pointer ${mode === "dark" ? "purple-gradient-btn" : "bg-purple-950/40"}`}>ธีมมืด (Dark)</button></div>
      <div><h2 className="font-bold text-lg text-purple-100 flex items-center gap-2"><Palette className="w-5 h-5 text-fuchsia-400" />ปรับแต่งธีมทุกส่วน</h2><p className="text-xs text-purple-300/60 mt-1">กำหนดสีหลัก พื้นหลัง พื้นผิว ตัวอักษร และสีเสริมของเว็บไซต์</p></div>

      {/* ===== ส่วนเทศกาล ===== */}
      <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/5 p-4 space-y-4">
        <div>
          <p className="text-sm font-bold text-fuchsia-100">🎉 กำหนดช่วงเวลาเทศกาล</p>
          <p className="mt-0.5 text-[11px] text-purple-200/60">เมื่ออยู่นอกช่วงนี้ ระบบจะใช้ธีมค่าเริ่มต้นโดยอัตโนมัติ</p>
        </div>

        {/* Festival Theme Selector + Preview */}
        <div className="space-y-2">
          <label className="text-xs text-purple-200 block">ธีมเทศกาล</label>
          <div className="flex gap-2">
            <select
              value={settings.festivalTheme}
              onChange={(e) => applyFestivalTheme(e.target.value as FestivalTheme)}
              className="flex-1 rounded-xl border border-purple-500/25 bg-purple-950/40 px-3 py-2 text-sm"
            >
              <option value="default">ค่าเริ่มต้น (พาสเทลม่วง)</option>
              {(Object.keys(FESTIVAL_THEME_LABELS) as FestivalTheme[])
                .filter((t) => t !== "default")
                .map((t) => (
                  <option key={t} value={t}>{FESTIVAL_THEME_LABELS[t]}</option>
                ))}
            </select>
            {/* Preview badge — แสดงธีมที่ active อยู่ */}
            {settings.festivalTheme !== "default" && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 text-[11px] font-bold text-fuchsia-300 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                Preview ON
              </div>
            )}
          </div>
          {settings.festivalTheme !== "default" && (
            <p className="text-[11px] text-fuchsia-300/80">
              ✅ ธีม &quot;{FESTIVAL_THEME_LABELS[settings.festivalTheme]}&quot; กำลัง Preview อยู่ — กด &quot;บันทึกการตั้งค่า&quot; เพื่อบันทึกลงระบบ หรือเลือก &quot;ค่าเริ่มต้น&quot; เพื่อยกเลิก
            </p>
          )}
        </div>

        {/* Date & Time Inputs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-purple-200">
            เวลาเริ่ม - สิ้นสุด
            <div className="mt-1 flex gap-2">
              <input
                type="time"
                value={settings.festivalStartTime}
                onChange={(e) => setSettings((prev) => ({ ...prev, festivalStartTime: e.target.value }))}
                className="w-full rounded-xl border border-purple-500/25 bg-purple-950/40 px-3 py-2"
              />
              <input
                type="time"
                value={settings.festivalEndTime}
                onChange={(e) => setSettings((prev) => ({ ...prev, festivalEndTime: e.target.value }))}
                className="w-full rounded-xl border border-purple-500/25 bg-purple-950/40 px-3 py-2"
              />
            </div>
          </label>
          <label className="text-xs text-purple-200">
            วันที่เริ่ม
            <input
              type="date"
              value={settings.festivalStartDate}
              onChange={(e) => setSettings((prev) => ({ ...prev, festivalStartDate: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-purple-500/25 bg-purple-950/40 px-3 py-2"
            />
          </label>
          <label className="text-xs text-purple-200">
            วันที่สิ้นสุด
            <input
              type="date"
              value={settings.festivalEndDate}
              onChange={(e) => setSettings((prev) => ({ ...prev, festivalEndDate: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-purple-500/25 bg-purple-950/40 px-3 py-2"
            />
          </label>

          {/* Quick Test: ไม่ตั้งวันเวลา = เปิดตลอด */}
          <div className="flex items-end pb-1">
            <p className="text-[10px] text-purple-300/50 leading-5">
              💡 หากไม่ตั้งวันที่ ธีมเทศกาลจะแสดงตลอดเวลา
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{Object.entries({ primary: "สีหลัก", accent: "สีเน้น", surface: "พื้นผิวการ์ด", background: "พื้นหลัง", text: "ตัวอักษร" }).map(([key, label]) => <label key={key} className="text-xs text-purple-200"><span className="block mb-1">{label}</span><input type="color" value={palette[key as keyof typeof palette]} onChange={(event) => applyPalette({ ...palette, [key]: event.target.value })} className="h-11 w-full rounded-xl bg-transparent cursor-pointer" /></label>)}</div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={calculateTheme} className="px-4 py-2 rounded-xl purple-gradient-btn text-xs font-semibold cursor-pointer">คำนวณชุดสี Light / Dark</button><input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="ชื่อ preset" className="rounded-xl bg-purple-950/40 border border-purple-500/25 px-3 text-xs" /><button type="button" onClick={savePreset} className="px-4 py-2 rounded-xl border border-purple-500/30 text-xs cursor-pointer">บันทึก Preset</button><button type="button" onClick={onSave} disabled={isPending} className="px-4 py-2 rounded-xl purple-gradient-btn text-xs font-semibold cursor-pointer">บันทึกการตั้งค่า</button></div>
      {presets.length > 0 && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{presets.map((preset) => <button key={preset.name} type="button" onClick={() => applyPalette(preset.palette)} className="flex items-center gap-3 rounded-xl border border-purple-500/25 p-3 text-left cursor-pointer"><span className="flex gap-1">{Object.values(preset.palette).map((color) => <i key={color} className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: color }} />)}</span><span className="text-xs text-purple-100">{preset.name}</span></button>)}</div>}
    </div>
  );
  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 space-y-5">
      <div>
        <h2 className="font-bold text-lg text-purple-100 flex items-center gap-2">
          <Palette className="w-5 h-5 text-fuchsia-400" />
          ธีมตามฤดูกาล / เทศกาล
        </h2>
        <p className="text-xs text-purple-300/60 mt-0.5">
          เลือกชุดสีและบรรยากาศของทั้งเว็บไซต์ — เว็บจะเปลี่ยนโทนสีอัตโนมัติตามเทศกาลที่เลือก
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {(Object.keys(FESTIVAL_THEME_LABELS) as FestivalTheme[]).map((theme) => {
          const isSelected = settings.festivalTheme === theme;
          return (
            <button
              key={theme}
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, festivalTheme: theme }))}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? "bg-purple-600/25 border-purple-400/80 shadow-lg shadow-purple-900/40 text-white"
                  : "bg-purple-950/20 border-purple-500/20 hover:bg-purple-600/10 text-purple-200/80"
              }`}
            >
              <div>
                <p className="font-bold text-sm">{FESTIVAL_THEME_LABELS[theme]}</p>
                <p className="text-[11px] text-purple-300/60 mt-0.5">theme key: {theme}</p>
              </div>
              {isSelected && (
                <div className="p-1.5 rounded-full bg-emerald-500 text-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-purple-500/15">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold purple-gradient-btn shadow-lg cursor-pointer disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          บันทึกการเปลี่ยนธีม
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 4. Tab: ข้อความเว็บไซต์                                                      */
/* ========================================================================= */
function TextsTab({
  settings,
  setSettings,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onSave: () => void;
  isPending: boolean;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 space-y-4">
      <div>
        <h2 className="font-bold text-lg text-purple-100 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-purple-400" />
          ข้อความที่แสดงบนเว็บไซต์
        </h2>
        <p className="text-xs text-purple-300/60 mt-0.5">
          แก้ไขได้ทุกเมื่อ ไม่ต้องแก้โค้ดอีก — กดบันทึกแล้วหน้าแรกจะอัปเดตทันที
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">ชื่อเว็บไซต์</span>
          <input
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">สโลแกน (ใต้โลโก้)</span>
          <input
            value={settings.siteTagline}
            onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-purple-300/80">หัวข้อแบนเนอร์</span>
          <input
            value={settings.bannerTitle}
            onChange={(e) => setSettings({ ...settings, bannerTitle: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-purple-300/80">ข้อความใต้หัวข้อแบนเนอร์</span>
          <textarea
            value={settings.bannerSubtitle}
            onChange={(e) => setSettings({ ...settings, bannerSubtitle: e.target.value })}
            rows={2}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold purple-gradient-btn shadow-lg cursor-pointer disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          บันทึกข้อความเว็บไซต์
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 5. Tab: จัดการผู้ใช้งาน                                                      */
/* ========================================================================= */
function UsersTab({
  currentUserId,
  notify,
  askConfirm,
}: {
  currentUserId?: string;
  notify: (ok: boolean, msg: string) => void;
  askConfirm: (title: string, description: string, onConfirm: () => void | Promise<void>, options?: { confirmLabel?: string; danger?: boolean }) => void;
}) {
  const [users, setUsers] = useState<
    Array<{
      id: string;
      email: string;
      username: string;
      role: "USER" | "ADMIN";
      createdAt: string | Date;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await getAdminUsersAction();
    if (res.success && res.data) {
      setUsers(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const loadUsers = async () => {
      const res = await getAdminUsersAction();
      if (cancelled) return;
      if (res.success && res.data) setUsers(res.data);
      setIsLoading(false);
    };
    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleRole = (userId: string, currentRole: "USER" | "ADMIN") => {
    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    askConfirm(
      "ยืนยันการเปลี่ยนสิทธิ์",
      `ต้องการเปลี่ยนสิทธิ์ผู้ใช้นี้เป็น ${nextRole} ใช่หรือไม่?`,
      () => startTransition(async () => {
        const res = await setUserRoleAction(userId, nextRole);
        if (res.success) {
          setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)));
          notify(true, `เปลี่ยนสิทธิ์เป็น ${nextRole} เรียบร้อยแล้ว`);
        } else {
          notify(false, res.error || "เปลี่ยนสิทธิ์ไม่สำเร็จ");
        }
      }),
      { confirmLabel: "ยืนยันการเปลี่ยนสิทธิ์" }
    );
  };

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-purple-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            ผู้ใช้งานในระบบ ({users.length} บัญชี)
          </h2>
          <p className="text-xs text-purple-300/60 mt-0.5">
            แอดมินสามารถดูรายชื่อผู้ใช้งานและปรับเปลี่ยนบทบาท (Role) ของสมาชิกได้
          </p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          className="p-2.5 rounded-2xl bg-purple-900/30 hover:bg-purple-600/20 text-purple-300 transition cursor-pointer"
          title="รีเฟรช"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-purple-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <div
                key={u.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-500/15 bg-purple-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center font-bold text-sm text-purple-200 uppercase">
                    {u.username.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-purple-100">{u.username}</p>
                      {isSelf && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300">
                          คุณ (ปัจจุบัน)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-purple-300/60">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      u.role === "ADMIN"
                        ? "bg-purple-500/20 border-purple-400/40 text-purple-200"
                        : "bg-purple-900/20 border-purple-500/20 text-purple-300/70"
                    }`}
                  >
                    {u.role}
                  </span>

                  {!isSelf && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggleRole(u.id, u.role)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-900/30 hover:bg-purple-600/30 text-purple-200 border border-purple-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      เปลี่ยนเป็น {u.role === "ADMIN" ? "USER" : "ADMIN"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminConfirmModal({
  title,
  description,
  confirmLabel = "ยืนยัน",
  danger = false,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-purple-400/30 bg-[#170c2c] shadow-2xl shadow-purple-950/80 animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6 text-center">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${danger ? "bg-rose-500/15 text-rose-300" : "bg-purple-500/15 text-purple-200"}`}>
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h3 id="admin-confirm-title" className="text-lg font-black text-purple-50">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-purple-200/70">{description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-purple-500/15 bg-purple-950/30 p-4">
          <button type="button" onClick={onCancel} className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-purple-200 hover:bg-purple-800/30 transition cursor-pointer">ยกเลิก</button>
          <button type="button" onClick={() => void onConfirm()} className={`rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition cursor-pointer ${danger ? "bg-rose-500 hover:bg-rose-400 shadow-rose-950/40" : "purple-gradient-btn shadow-purple-900/40"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function GoogleDriveConnectionPanel({
  notify,
  askConfirm,
}: {
  notify: (ok: boolean, msg: string) => void;
  askConfirm: (title: string, description: string, onConfirm: () => void | Promise<void>, options?: { confirmLabel?: string; danger?: boolean }) => void;
}) {
  const [status, setStatus] = useState<{ configured: boolean; connected: boolean; accountEmail: string | null; storage?: { used: number; limit: number | null } | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/google-drive/status", { cache: "no-store" });
      const data = await response.json();
      if (data.success) setStatus(data.data);
    } catch {
      notify(false, "ตรวจสอบสถานะ Google Drive ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadStatus(); }, []);

  if (loading) return <div className="glass-panel rounded-3xl p-4 text-xs text-purple-300/70 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> กำลังตรวจสอบ Google Drive…</div>;

  if (!status?.configured) {
    return <div className="rounded-3xl border border-amber-400/35 bg-amber-500/10 p-5"><div className="flex items-start gap-3"><ShieldAlert className="h-5 w-5 shrink-0 text-amber-300" /><div><h3 className="font-bold text-amber-100">ยังไม่ได้ตั้งค่า Google Drive</h3><p className="mt-1 text-xs leading-5 text-amber-100/75">ตั้งค่า GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET และ Redirect URI ก่อน เพื่อให้ไฟล์ถูกเก็บใน Cloud และบันทึก metadata ลงฐานข้อมูล</p></div></div></div>;
  }

  if (!status.connected) {
    return <div className="rounded-3xl border border-cyan-400/35 bg-cyan-400/10 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><FolderOpen className="h-5 w-5 shrink-0 text-cyan-200" /><div><h3 className="font-bold text-cyan-100">เชื่อมต่อ Google Drive ก่อนอัปโหลด</h3><p className="mt-1 text-xs text-cyan-100/70">คลังสื่อจะอัปโหลดไฟล์เข้า Drive และเก็บข้อมูลไฟล์ไว้ในฐานข้อมูล</p></div></div><a href="/api/admin/google-drive/connect" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition"><ExternalLink className="h-4 w-4" />เชื่อมต่อ Drive</a></div>;
  }

  return <div className="rounded-3xl border border-emerald-400/35 bg-emerald-500/10 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" /><div><h3 className="font-bold text-emerald-100">เชื่อมต่อ Google Drive แล้ว</h3><p className="mt-1 text-xs text-emerald-100/70">บัญชี: {status.accountEmail || "Google Drive"} — ไฟล์ใหม่จะเก็บบน Cloud พร้อม metadata ในฐานข้อมูล</p></div></div><button type="button" onClick={() => askConfirm("ตัดการเชื่อมต่อ Google Drive", "หลังตัดการเชื่อมต่อจะไม่สามารถอัปโหลด จัดการ หรือดึงไฟล์จาก Drive ได้ จนกว่าจะเชื่อมต่อใหม่", async () => { const response = await fetch("/api/admin/google-drive/status", { method: "DELETE" }); const data = await response.json(); if (data.success) { setStatus({ configured: true, connected: false, accountEmail: null }); notify(true, "ตัดการเชื่อมต่อ Google Drive แล้ว"); } else notify(false, data.error || "ตัดการเชื่อมต่อไม่สำเร็จ"); }, { confirmLabel: "ตัดการเชื่อมต่อ", danger: true })} className="rounded-2xl border border-rose-400/30 px-4 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-500/15 transition cursor-pointer">ตัดการเชื่อมต่อ</button></div>;
}
