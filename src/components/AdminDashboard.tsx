"use client";

import React, { useState, useTransition, useEffect } from "react";
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
} from "lucide-react";
import type { SiteSettings, FestivalTheme } from "@/lib/site-settings";
import { FESTIVAL_THEME_LABELS } from "@/lib/site-settings";
import type { SpotItem } from "@/lib/fallbackSpots";
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
  const [tab, setTab] = useState<AdminTab>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [spots, setSpots] = useState<SpotItem[]>(initialSpots);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Picker Modal State for selecting image into a specific settings field
  const [pickerModal, setPickerModal] = useState<{
    isOpen: boolean;
    field: "logoLight" | "logoDark" | "bannerLight" | "bannerDark";
    title: string;
    folder: MediaFolder;
  } | null>(null);

  const notify = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
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
        siteName: settings.siteName,
        siteTagline: settings.siteTagline,
        festivalTheme: settings.festivalTheme,
        bannerTitle: settings.bannerTitle,
        bannerSubtitle: settings.bannerSubtitle,
      });
      if (res.success) {
        notify(true, "บันทึกการตั้งค่าเรียบร้อยแล้ว");
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
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toast.ok
              ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
              : "bg-rose-500/20 border-rose-400/50 text-rose-200"
          }`}
        >
          {toast.ok ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

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
                  {tab === "themes" && "ธีมเทศกาล"}
                  {tab === "texts" && "ข้อความเว็บไซต์"}
                  {tab === "users" && "จัดการผู้ใช้งาน"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black purple-gradient-text">
                {tab === "spots" && "จัดการจุดอ่านหนังสือ & บรรยากาศ"}
                {tab === "logos-banners" && "จัดการโลโก้ & แบนเนอร์ (เลือกจากโฟลเดอร์)"}
                {tab === "media" && "คลังไฟล์รูปภาพ & โฟลเดอร์จัดเก็บ"}
                {tab === "themes" && "ปรับแต่งธีมเทศกาล & ฤดูกาล"}
                {tab === "texts" && "ปรับแต่งข้อความ & สโลแกนเว็บไซต์"}
                {tab === "users" && "ผู้ใช้งาน & สิทธิ์ในระบบ"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden"
            >
              <span>ชมหน้าเว็บ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

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
              <GoogleDriveConnectionPanel notify={notify} askConfirm={askConfirm} />
              <div className="glass-panel rounded-3xl p-5 md:p-6">
              <MediaFolderPicker
                targetTitle="คลังรูปภาพทั้งหมด (Logos, Banners & General)"
                defaultFolder="logos"
              />
              </div>
            </div>
          )}

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
    field: "logoLight" | "logoDark" | "bannerLight" | "bannerDark",
    title: string,
    folder: MediaFolder
  ) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const cards: {
    field: "logoLight" | "logoDark" | "bannerLight" | "bannerDark";
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
                          src={currentVal}
                          alt={c.title}
                          className="max-h-24 max-w-full object-contain drop-shadow-md group-hover:scale-105 transition"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-full flex items-center justify-center overflow-hidden rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentVal}
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
              src={spot.imageUrl}
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
}: {
  spot: SpotItem | null;
  onClose: () => void;
  onSaved: (spot: SpotItem, isNew: boolean) => void;
  notify: (ok: boolean, msg: string) => void;
}) {
  const isEdit = !!spot;
  const [title, setTitle] = useState(spot?.title || "");
  const [description, setDescription] = useState(spot?.description || "");
  const [location, setLocation] = useState(spot?.location || "");
  const [noiseLevel, setNoiseLevel] = useState<"quiet" | "moderate" | "lively">(
    (spot?.noiseLevel as "quiet" | "moderate" | "lively") || "quiet"
  );
  const [imageUrl, setImageUrl] = useState(spot?.imageUrl || "");
  const [audioUrl, setAudioUrl] = useState(spot?.audioUrl || "");
  const [latitude, setLatitude] = useState(spot?.latitude ?? 7.80822);
  const [longitude, setLongitude] = useState(spot?.longitude ?? 99.93869);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [pickerOpen, setPickerOpen] = useState<"image" | "audio" | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        title,
        description,
        location,
        noiseLevel,
        imageUrl,
        audioUrl,
        latitude,
        longitude,
      };

      if (isEdit && spot) {
        const res = await adminUpdateSpotAction(spot.id, payload);
        if (res.success && res.data) {
          onSaved(res.data as SpotItem, false);
        } else {
          notify(false, res.error || "แก้ไขไม่สำเร็จ");
        }
      } else {
        const res = await adminCreateSpotAction(payload);
        if (res.success && res.data) {
          onSaved(res.data as SpotItem, true);
        } else {
          notify(false, res.error || "สร้างไม่สำเร็จ");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border border-purple-500/30">
        <h3 className="font-bold text-lg mb-4 text-purple-100">
          {isEdit ? "แก้ไขสถานที่" : "เพิ่มสถานที่ใหม่"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-purple-300/80">ชื่อสถานที่</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/25 text-sm"
              placeholder="เช่น Library Corner, Cafe Noir"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-purple-300/80">รายละเอียด</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/25 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-purple-300/80">ที่ตั้ง / โซน</label>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/25 text-sm"
              />
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
            <CampusMap spots={[]} selected={{ latitude, longitude }} interactive onPick={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
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
                เลือกจากคลังภาพ
              </button>
            </div>
            <input
              required
              value={imageUrl}
              readOnly
              disabled
              onClick={() => setPickerOpen("image")}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/25 text-sm"
              placeholder="เลือกภาพจากคลังภาพ"
            />
          </div>

          <div>
            <div className="flex items-center justify-between"><label className="text-xs font-semibold text-purple-300/80">เสียงบรรยากาศจากคลัง</label><button type="button" onClick={() => setPickerOpen("audio")} className="text-[11px] text-fuchsia-300 cursor-pointer">เลือกจากคลังเสียง</button></div>
            <input
              required
              value={audioUrl}
              readOnly
              disabled
              onClick={() => setPickerOpen("audio")}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/25 text-sm"
              placeholder="เลือกเสียงจากคลังเสียง"
            />
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
          onSelect={(url) => {
            if (pickerOpen === "audio") setAudioUrl(url); else setImageUrl(url);
            setPickerOpen(null);
          }}
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
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [lightPalette, setLightPalette] = useState({ primary: "#7c3aed", accent: "#0284c7", surface: "#ffffff", background: "#f1f5f9", text: "#111827" });
  const [darkPalette, setDarkPalette] = useState({ primary: "#a855f7", accent: "#22d3ee", surface: "#160b2b", background: "#080510", text: "#f5f3ff" });
  const palette = mode === "light" ? lightPalette : darkPalette;
  const [presetName, setPresetName] = useState("");
  const [presets, setPresets] = useState<Array<{ name: string; palette: typeof palette }>>([]);
  useEffect(() => { try { const saved = localStorage.getItem("lmsound-theme-presets"); if (saved) setPresets(JSON.parse(saved)); } catch { /* ignore malformed local presets */ } }, []);
  const applyPalette = (next: typeof palette) => {
    if (mode === "light") setLightPalette(next); else setDarkPalette(next);
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", next.primary); root.style.setProperty("--theme-accent", next.accent); root.style.setProperty("--theme-surface", next.surface); root.style.setProperty("--theme-background", next.background); root.style.setProperty("--theme-foreground", next.text);
  };
  const calculateTheme = () => { const opposite = mode === "light" ? { primary: palette.primary, accent: palette.accent, surface: "#160b2b", background: "#080510", text: "#f5f3ff" } : { primary: palette.primary, accent: palette.accent, surface: "#ffffff", background: "#f1f5f9", text: "#111827" }; if (mode === "light") setDarkPalette(opposite); else setLightPalette(opposite); };
  const savePreset = () => { if (!presetName.trim()) return; const next = [...presets.filter((item) => item.name !== presetName.trim()), { name: presetName.trim(), palette }]; setPresets(next); localStorage.setItem("lmsound-theme-presets", JSON.stringify(next)); setPresetName(""); };
  if (true) return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 space-y-5">
      <div className="flex gap-2"><button type="button" onClick={() => setMode("light")} className={`px-4 py-2 rounded-xl text-xs cursor-pointer ${mode === "light" ? "purple-gradient-btn" : "bg-purple-950/40"}`}>ธีมสว่าง (Light)</button><button type="button" onClick={() => setMode("dark")} className={`px-4 py-2 rounded-xl text-xs cursor-pointer ${mode === "dark" ? "purple-gradient-btn" : "bg-purple-950/40"}`}>ธีมมืด (Dark)</button></div>
      <div><h2 className="font-bold text-lg text-purple-100 flex items-center gap-2"><Palette className="w-5 h-5 text-fuchsia-400" />ปรับแต่งธีมทุกส่วน</h2><p className="text-xs text-purple-300/60 mt-1">กำหนดสีหลัก พื้นหลัง พื้นผิว ตัวอักษร และสีเสริมของเว็บไซต์</p></div>
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
  const [status, setStatus] = useState<{ configured: boolean; connected: boolean; accountEmail: string | null } | null>(null);
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
