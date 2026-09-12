"use client";

import { useState, useTransition } from "react";
import {
  Save, Plus, Pencil, Trash2, RefreshCw, ImageIcon, Palette,
  LayoutDashboard, MapPin, Users, Loader2, CheckCircle2, XCircle,
} from "lucide-react";
import type { SiteSettings, FestivalTheme } from "@/lib/site-settings";
import { FESTIVAL_THEME_LABELS } from "@/lib/site-settings";
import type { SpotItem } from "@/lib/fallbackSpots";
import {
  updateSiteSettingsAction,
  adminCreateSpotAction,
  adminUpdateSpotAction,
  adminDeleteSpotAction,
} from "@/actions/admin";
import NoiseGauge from "@/components/NoiseGauge";

interface AdminDashboardProps {
  initialSettings: SiteSettings;
  initialSpots: SpotItem[];
}

type Tab = "spots" | "appearance" | "texts";

export default function AdminDashboard({ initialSettings, initialSpots }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("spots");
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [spots, setSpots] = useState<SpotItem[]>(initialSpots);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const notify = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
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

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "spots", label: "จัดการสถานที่ & การ์ด", icon: MapPin },
            { key: "appearance", label: "โลโก้ แบนเนอร์ & ธีม", icon: Palette },
            { key: "texts", label: "ข้อความเว็บไซต์", icon: LayoutDashboard },
          ] as { key: Tab; label: string; icon: typeof MapPin }[]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${
              tab === key
                ? "purple-gradient-btn shadow-lg"
                : "purple-pill hover:bg-purple-600/20"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-semibold ${
            toast.ok
              ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
              : "bg-rose-500/15 border-rose-400/40 text-rose-300"
          }`}
        >
          {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {tab === "spots" && <SpotsTab spots={spots} setSpots={setSpots} notify={notify} />}
      {tab === "appearance" && (
        <AppearanceTab settings={settings} setSettings={setSettings} onSave={handleSaveSettings} isPending={isPending} />
      )}
      {tab === "texts" && (
        <TextsTab settings={settings} setSettings={setSettings} onSave={handleSaveSettings} isPending={isPending} />
      )}
    </div>
  );
}

/* ============ Tab: จัดการสถานที่ ============ */
function SpotsTab({
  spots,
  setSpots,
  notify,
}: {
  spots: SpotItem[];
  setSpots: (s: SpotItem[]) => void;
  notify: (ok: boolean, msg: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<SpotItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (spot: SpotItem) => {
    if (!confirm(`ลบสถานที่ "${spot.title}" ?`)) return;
    startTransition(async () => {
      const res = await adminDeleteSpotAction(spot.id);
      if (res.success) {
        setSpots(spots.filter((s) => s.id !== spot.id));
        notify(true, "ลบสถานที่เรียบร้อย");
      } else {
        notify(false, res.error || "ลบไม่สำเร็จ");
      }
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-lg">สถานที่ทั้งหมด ({spots.length})</h2>
          <p className="text-xs text-purple-300/60">
            เพิ่มโซน ห้องอัดเสียง หรือสถานที่ใหม่ — แอดมินแก้ไข/ลบได้ทุกรายการ
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSpot(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold purple-gradient-btn cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          เพิ่มสถานที่
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

      <div className="space-y-2 mt-4">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className="flex items-center gap-3 p-3 rounded-2xl border border-purple-500/15 bg-purple-950/10 hover:bg-purple-600/10 transition"
          >
            <img
              src={spot.imageUrl}
              alt={spot.title}
              className="w-14 h-14 rounded-xl object-cover border border-purple-500/25 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{spot.title}</p>
              <p className="text-xs text-purple-300/60 truncate flex items-center gap-1.5">
                <MapPin className="w-3 h-3 shrink-0" />
                {spot.location}
              </p>
              <div className="mt-1 text-purple-300/80">
                <NoiseGauge noiseLevel={spot.noiseLevel} compact />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setEditingSpot(spot);
                  setShowForm(true);
                }}
                className="p-2 rounded-lg text-purple-300 hover:bg-purple-500/20 hover:text-white transition cursor-pointer"
                title="แก้ไข"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(spot)}
                disabled={isPending}
                className="p-2 rounded-lg text-rose-300/80 hover:bg-rose-500/20 hover:text-rose-300 transition cursor-pointer"
                title="ลบ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {spots.length === 0 && (
          <p className="text-center text-sm text-purple-300/50 py-8">
            ยังไม่มีสถานที่ในระบบ — กดปุ่ม &ldquo;เพิ่มสถานที่&rdquo; เพื่อเริ่มสร้าง
          </p>
        )}
      </div>
    </div>
  );
}

/* ============ ฟอร์มเพิ่ม/แก้ไขสถานที่ ============ */
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
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateSpotAction(spot.id, formData)
        : await adminCreateSpotAction(formData);
      if (res.success && res.data) {
        const d = res.data as Record<string, unknown>;
        onSaved(
          {
            id: String(d.id ?? spot?.id ?? ""),
            title: String(d.title ?? ""),
            description: String(d.description ?? ""),
            location: String(d.location ?? ""),
            noiseLevel: String(d.noiseLevel ?? "moderate"),
            imageUrl: String(d.imageUrl ?? ""),
            audioUrl: String(d.audioUrl ?? ""),
            authorId: String(d.authorId ?? spot?.authorId ?? ""),
            author: (d.author as SpotItem["author"]) ?? spot?.author ?? null,
          },
          !isEdit
        );
      } else {
        notify(false, res.error || "บันทึกไม่สำเร็จ");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 md:p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          {isEdit ? <Pencil className="w-4 h-4 text-purple-400" /> : <Plus className="w-4 h-4 text-purple-400" />}
          {isEdit ? `แก้ไข: ${spot.title}` : "เพิ่มสถานที่ใหม่ (โซน / ห้องอัดเสียง / จุดอ่านหนังสือ)"}
        </h3>
        <button type="button" onClick={onClose} className="text-purple-300/60 hover:text-white text-sm cursor-pointer">
          ✕ ปิด
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">ชื่อสถานที่ *</span>
          <input
            name="title"
            defaultValue={spot?.title}
            required
            minLength={2}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">ตำแหน่ง / พิกัด *</span>
          <input
            name="location"
            defaultValue={spot?.location}
            required
            minLength={2}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-purple-300/80">รายละเอียด *</span>
          <textarea
            name="description"
            defaultValue={spot?.description}
            required
            minLength={10}
            rows={3}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">ระดับเสียงรบกวน *</span>
          <select
            name="noiseLevel"
            defaultValue={spot?.noiseLevel || "moderate"}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          >
            <option value="quiet">เงียบสงบ (quiet)</option>
            <option value="moderate">ปานกลาง (moderate)</option>
            <option value="lively">คึกคัก (lively)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">URL รูปภาพ *</span>
          <input
            name="imageUrl"
            type="url"
            defaultValue={spot?.imageUrl}
            required
            placeholder="https://..."
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-purple-300/80">URL เสียงบรรยากาศ *</span>
          <input
            name="audioUrl"
            type="url"
            defaultValue={spot?.audioUrl}
            required
            placeholder="https://... (.mp3 / .ogg)"
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold purple-gradient-btn cursor-pointer disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "บันทึกการแก้ไข" : "สร้างสถานที่"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-full text-sm text-purple-300/70 hover:text-white transition cursor-pointer"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

/* ============ Tab: โลโก้ แบนเนอร์ & ธีม ============ */
function AppearanceTab({
  settings,
  setSettings,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const set = (patch: Partial<SiteSettings>) => setSettings({ ...settings, ...patch });

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 space-y-5">
      <div>
        <h2 className="font-bold text-lg flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          โลโก้ & แบนเนอร์ แยกธีมสว่าง/มืด
        </h2>
        <p className="text-xs text-purple-300/60 mt-0.5">
          ใส่ URL รูปภาพ หรือพาธไฟล์ใน /public (เช่น /logo.png) — ระบบจะสลับรูปให้อัตโนมัติเมื่อผู้ใช้สลับธีม
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">☀️ โลโก้ (ธีมสว่าง)</span>
          <input
            value={settings.logoLight}
            onChange={(e) => set({ logoLight: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">🌙 โลโก้ (ธีมมืด)</span>
          <input
            value={settings.logoDark}
            onChange={(e) => set({ logoDark: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">☀️ แบนเนอร์ (ธีมสว่าง)</span>
          <input
            value={settings.bannerLight}
            onChange={(e) => set({ bannerLight: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">🌙 แบนเนอร์ (ธีมมืด)</span>
          <input
            value={settings.bannerDark}
            onChange={(e) => set({ bannerDark: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
      </div>

      {/* ตัวอย่างภาพ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "โลโก้ (สว่าง)", src: settings.logoLight },
          { label: "โลโก้ (มืด)", src: settings.logoDark },
          { label: "แบนเนอร์ (สว่าง)", src: settings.bannerLight },
          { label: "แบนเนอร์ (มืด)", src: settings.bannerDark },
        ].map((img) => (
          <div key={img.label} className="rounded-2xl border border-purple-500/25 overflow-hidden bg-purple-950/20">
            <div className="h-20 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.label} className="max-h-20 w-full object-cover" />
            </div>
            <p className="text-[10px] text-center text-purple-300/60 py-1">{img.label}</p>
          </div>
        ))}
      </div>

      {/* ธีมเทศกาล */}
      <div className="pt-2 border-t border-purple-500/15">
        <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-fuchsia-400" />
          ธีมตามฤดูกาล / เทศกาล
        </h3>
        <p className="text-xs text-purple-300/60 mb-3">
          เลือกชุดสีของทั้งเว็บไซต์ — เหมาะสำหรับเปลี่ยนบรรยากาศตามเทศกาล
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FESTIVAL_THEME_LABELS) as FestivalTheme[]).map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => set({ festivalTheme: theme })}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                settings.festivalTheme === theme
                  ? "purple-gradient-btn border-transparent shadow-lg"
                  : "purple-pill hover:bg-purple-600/20"
              }`}
            >
              {FESTIVAL_THEME_LABELS[theme]}
            </button>
          ))}
        </div>
      </div>

      <SaveButton onSave={onSave} isPending={isPending} />
    </div>
  );
}

/* ============ Tab: ข้อความเว็บไซต์ ============ */
function TextsTab({
  settings,
  setSettings,
  onSave,
  isPending,
}: {
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const set = (patch: Partial<SiteSettings>) => setSettings({ ...settings, ...patch });

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 space-y-4">
      <div>
        <h2 className="font-bold text-lg flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-purple-400" />
          ข้อความที่แสดงบนเว็บไซต์
        </h2>
        <p className="text-xs text-purple-300/60 mt-0.5">
          แก้ไขได้ทุกเมื่อ ไม่ต้องแก้โค้ดอีก — กดบันทึกแล้วเว็บจะอัปเดตทันที
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">ชื่อเว็บไซต์</span>
          <input
            value={settings.siteName}
            onChange={(e) => set({ siteName: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-purple-300/80">สโลแกน (ใต้โลโก้)</span>
          <input
            value={settings.siteTagline}
            onChange={(e) => set({ siteTagline: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-purple-300/80">หัวข้อแบนเนอร์</span>
          <input
            value={settings.bannerTitle}
            onChange={(e) => set({ bannerTitle: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-semibold text-purple-300/80">ข้อความใต้หัวข้อแบนเนอร์</span>
          <textarea
            value={settings.bannerSubtitle}
            onChange={(e) => set({ bannerSubtitle: e.target.value })}
            rows={2}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25 text-sm focus:outline-none focus:border-purple-400/70"
          />
        </label>
      </div>

      <SaveButton onSave={onSave} isPending={isPending} />
    </div>
  );
}

function SaveButton({ onSave, isPending }: { onSave: () => void; isPending: boolean }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold purple-gradient-btn cursor-pointer disabled:opacity-60"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        บันทึกการตั้งค่า
      </button>
      <span className="text-xs text-purple-300/50 inline-flex items-center gap-1">
        <RefreshCw className="w-3 h-3" />
        มีผลทันทีหลังบันทึก
      </span>
    </div>
  );
}
