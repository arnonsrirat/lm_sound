"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSpotAction, updateSpotAction } from "@/actions/spot";
import { noiseLevels, noiseLevelLabels, type NoiseLevel, type SpotInput, availabilityStatuses, timeTags } from "@/lib/validations/spot";
import { Save, ArrowLeft, Image as ImageIcon, Music, MapPin, Volume2, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import MediaFolderPicker from "@/components/admin/MediaFolderPicker";
import CampusMap from "@/components/CampusMap";
import { getOptimizedImageUrl } from "@/lib/media-url";

interface SpotFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    location: string;
    noiseLevel: string;
    imageUrl: string;
    imageUrls?: string[];
    audioUrl: string;
    timeTag?: string | null;
    availabilityStatus?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  isEdit?: boolean;
}

const PRESET_AUDIOS = [
  { label: "🌧️ เสียงฝนตกกระทบกระจก", url: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg" },
  { label: "🍃 เสียงลมพัดสวนป่า / ร่มไม้", url: "https://actions.google.com/sounds/v1/ambiences/forest_wind.ogg" },
  { label: "📚 เสียงแอร์ห้องสมุดเบาๆ", url: "https://actions.google.com/sounds/v1/weather/wind_breeze.ogg" },
  { label: "☕ เสียงบรรยากาศคาเฟ่", url: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg" },
];

const PRESET_IMAGES = [
  { label: "หอสมุดโมเดิร์น", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80" },
  { label: "สวนร่มรื่น", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Co-working Space", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" },
  { label: "ระเบียงชมวิว", url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80" },
];

export default function SpotForm({ initialData, isEdit = false }: SpotFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<SpotInput>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    noiseLevel: (initialData?.noiseLevel as NoiseLevel) || "quiet",
    imageUrl: initialData?.imageUrl || "",
    imageUrls: initialData?.imageUrls || (initialData?.imageUrl ? [initialData.imageUrl] : []),
    audioUrl: initialData?.audioUrl || "",
    timeTag: (initialData?.timeTag as SpotInput["timeTag"]) || null,
    availabilityStatus: (initialData?.availabilityStatus as SpotInput["availabilityStatus"]) || "READY",
    pendingFields: [],
    amenities: [],
    latitude: initialData?.latitude ?? 7.80822,
    longitude: initialData?.longitude ?? 99.93869,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerType, setPickerType] = useState<"image" | "audio" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);

    try {
      let result;
      if (isEdit && initialData?.id) {
        result = await updateSpotAction(initialData.id, formData);
      } else {
        result = await createSpotAction(formData);
      }

      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        setGeneralError(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        return;
      }

      // Success
      router.push("/");
      router.refresh();
    } catch (err) {
      setGeneralError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าแรก</span>
        </Link>
      </div>

      <div className="glass-panel rounded-3xl p-5 sm:p-8 border border-purple-500/25 bg-[var(--card-bg)] shadow-2xl">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-400 animate-pulse" />
            <span className="purple-gradient-text">{isEdit ? "แก้ไขจุดอ่านหนังสือ" : "เพิ่มจุดอ่านหนังสือใหม่"}</span>
          </h1>
          <p className="text-xs text-purple-300/70 mt-1">
            แบ่งปันมุมลับในมหาวิทยาลัย พร้อมเสียงบรรยากาศจริงให้เพื่อนๆ ได้ฟัง
          </p>
        </div>

        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
              ชื่อจุดอ่านหนังสือ *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="เช่น หอสมุดกลาง ชั้น 4 มุม Silent Study"
              className="w-full px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/25 text-foreground text-sm focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition shadow-inner"
              required
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title[0]}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
              พิกัด / สถานที่ตั้ง *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="เช่น อาคารเรียนรวม 3 ชั้น 5 หรือ โต๊ะใต้ต้นจามจุรี"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/25 text-foreground text-sm focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition shadow-inner"
                required
              />
            </div>
            {errors.location && <p className="text-rose-400 text-xs mt-1">{errors.location[0]}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                ปักหมุดจุดอ่านหนังสือบนแผนที่วิทยาเขตพัทลุง *
              </label>
              <span className="text-[11px] text-cyan-400 font-semibold">
                {(formData.latitude ?? 7.80822).toFixed(5)}, {(formData.longitude ?? 99.93869).toFixed(5)}
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-purple-500/30">
              <CampusMap
                spots={[]}
                selected={{ latitude: formData.latitude ?? 7.80822, longitude: formData.longitude ?? 99.93869 }}
                interactive
                onPick={(latitude, longitude) => setFormData({ ...formData, latitude, longitude })}
              />
            </div>
          </div>

          {/* Noise Level */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
              ระดับเสียงบรรยากาศ *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {noiseLevels.map((lvl) => {
                const config = noiseLevelLabels[lvl];
                const isSelected = formData.noiseLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, noiseLevel: lvl })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-purple-600/25 border-fuchsia-400 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/50"
                        : "bg-purple-950/20 border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? "text-fuchsia-300" : "text-purple-200"}`}>
                        {config.label}
                      </span>
                      <Volume2 className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400" : "text-purple-400/60"}`} />
                    </div>
                    <span className="text-[10px] text-purple-300/70">{config.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image URL & Preset Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                URL รูปภาพสถานที่ *
              </label>
              <span className="text-[11px] text-purple-400/70">เลือกภาพตัวอย่างได้</span>
            </div>
            <div className="relative">
              <ImageIcon className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
              <button
                type="button"
                onClick={() => setPickerType("image")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/25 text-left text-sm text-foreground hover:border-purple-400/60 transition cursor-pointer"
              >
              {formData.imageUrls?.length ? `เลือกภาพแล้ว ${formData.imageUrls.length} รูป` : "เลือกภาพจากคลังภาพ"}
            </button>
            </div>
            {formData.imageUrls && formData.imageUrls.length > 0 && <div className="mt-2 grid grid-cols-4 gap-2">{formData.imageUrls.map((url) => <img key={url} src={getOptimizedImageUrl(url)} alt="ภาพสถานที่" loading="lazy" decoding="async" className="h-16 w-full rounded-lg object-cover" />)}</div>}
            {errors.imageUrl && <p className="text-rose-400 text-xs mt-1">{errors.imageUrl[0]}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">ช่วงเวลาที่เหมาะสม</label>
              <select value={formData.timeTag || ""} onChange={(e) => setFormData({ ...formData, timeTag: (e.target.value || null) as SpotInput["timeTag"] })} className="w-full rounded-xl bg-purple-950/30 border border-purple-500/25 px-4 py-2.5 text-sm text-foreground">
                <option value="">ไม่ระบุ</option>{timeTags.map((tag) => <option key={tag} value={tag}>{tag === "morning" ? "เช้า" : tag === "afternoon" ? "กลางวัน" : tag === "evening" ? "เย็น" : tag === "night" ? "กลางคืน" : "ทั้งวัน"}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">สถานะข้อมูล</label>
              <select value={formData.availabilityStatus} onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as SpotInput["availabilityStatus"] })} className="w-full rounded-xl bg-purple-950/30 border border-purple-500/25 px-4 py-2.5 text-sm text-foreground">
                {availabilityStatuses.map((status) => <option key={status} value={status}>{status === "READY" ? "พร้อมใช้งาน" : status === "PENDING_UPDATE" ? "รออัปเดตข้อมูล" : "ยังไม่พร้อม"}</option>)}
              </select>
            </div>
          </div>

          {/* Audio URL & Preset Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                URL ไฟล์เสียงบรรยากาศ (.mp3, .ogg) *
              </label>
              <span className="text-[11px] text-purple-400/70">เลือกเสียงตัวอย่างได้</span>
            </div>
            <div className="relative">
              <Music className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
              <button
                type="button"
                onClick={() => setPickerType("audio")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/25 text-left text-sm text-foreground hover:border-purple-400/60 transition cursor-pointer"
              >
                {formData.audioUrl ? "เลือกเสียงจากคลังแล้ว" : "เลือกเสียงจากคลังเสียง"}
              </button>
            </div>
            {errors.audioUrl && <p className="text-rose-400 text-xs mt-1">{errors.audioUrl[0]}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">
              รายละเอียดและคำแนะนำเพิ่มเติม *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="แนะนำเรื่องความสว่าง, ปลั๊กไฟ, แอร์, ช่วงเวลาที่คนน้อย, หรือจุดที่เดินเข้าไปหายาก..."
              className="w-full px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/25 text-foreground text-sm focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition shadow-inner"
              required
            />
            {errors.description && <p className="text-rose-400 text-xs mt-1">{errors.description[0]}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-purple-300 hover:text-white transition"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white purple-gradient-btn disabled:opacity-50 transition shadow-lg shadow-purple-900/40 cursor-pointer border border-purple-400/40 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "กำลังบันทึก..." : isEdit ? "อัปเดตจุดอ่านหนังสือ" : "เผยแพร่จุดอ่านหนังสือ"}</span>
            </button>
          </div>
        </form>
      </div>
      {pickerType && (
        <MediaFolderPicker
          isModal
          canManage={false}
          defaultFolder={pickerType === "audio" ? "audio" : "general"}
          allowedFolder={pickerType === "audio" ? "audio" : "general"}
          selectedUrl={pickerType === "audio" ? formData.audioUrl : formData.imageUrl}
          selectedUrls={formData.imageUrls || []}
          multiSelect={pickerType === "image"}
          targetTitle={pickerType === "audio" ? "เลือกเสียงบรรยากาศจากคลังเสียง" : "เลือกภาพสถานที่จากคลังภาพ"}
          onSelect={(url) => {
            setFormData({ ...formData, audioUrl: pickerType === "audio" ? url : formData.audioUrl, imageUrl: pickerType === "image" ? url : formData.imageUrl, imageUrls: pickerType === "image" ? [url] : formData.imageUrls });
            setPickerType(null);
          }}
          onSelectMany={(urls) => { if (pickerType === "image" && urls.length > 0) setFormData({ ...formData, imageUrl: urls[0], imageUrls: urls }); setPickerType(null); }}
          onClose={() => setPickerType(null)}
        />
      )}
    </div>
  );
}
