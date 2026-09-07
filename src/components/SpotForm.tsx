"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSpotAction, updateSpotAction } from "@/actions/spot";
import { noiseLevels, noiseLevelLabels, type NoiseLevel, type SpotInput } from "@/lib/validations/spot";
import { Save, ArrowLeft, Image as ImageIcon, Music, MapPin, Volume2, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SpotFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    location: string;
    noiseLevel: string;
    imageUrl: string;
    audioUrl: string;
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
    imageUrl: initialData?.imageUrl || PRESET_IMAGES[0].url,
    audioUrl: initialData?.audioUrl || PRESET_AUDIOS[0].url,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าแรก</span>
        </Link>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-900/80 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            {isEdit ? "แก้ไขจุดอ่านหนังสือ" : "เพิ่มจุดอ่านหนังสือใหม่"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            แบ่งปันมุมลับในมหาวิทยาลัย พร้อมเสียงบรรยากาศจริงให้เพื่อนๆ ได้ฟัง
          </p>
        </div>

        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ชื่อจุดอ่านหนังสือ *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="เช่น หอสมุดกลาง ชั้น 4 มุม Silent Study"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
              required
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title[0]}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              พิกัด / สถานที่ตั้ง *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="เช่น อาคารเรียนรวม 3 ชั้น 5 หรือ โต๊ะใต้ต้นจามจุรี"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
                required
              />
            </div>
            {errors.location && <p className="text-rose-400 text-xs mt-1">{errors.location[0]}</p>}
          </div>

          {/* Noise Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              ระดับเสียงบรรยากาศ *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {noiseLevels.map((lvl) => {
                const config = noiseLevelLabels[lvl];
                const isSelected = formData.noiseLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, noiseLevel: lvl })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/20"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? "text-emerald-400" : "text-slate-200"}`}>
                        {config.label}
                      </span>
                      <Volume2 className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                    </div>
                    <span className="text-[10px] text-slate-400">{config.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image URL & Preset Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                URL รูปภาพสถานที่ *
              </label>
              <span className="text-[11px] text-slate-500">เลือกภาพตัวอย่างได้</span>
            </div>
            <div className="relative">
              <ImageIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
                required
              />
            </div>
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {errors.imageUrl && <p className="text-rose-400 text-xs mt-1">{errors.imageUrl[0]}</p>}
          </div>

          {/* Audio URL & Preset Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                URL ไฟล์เสียงบรรยากาศ (.mp3, .ogg) *
              </label>
              <span className="text-[11px] text-slate-500">เลือกเสียงตัวอย่างได้</span>
            </div>
            <div className="relative">
              <Music className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
                required
              />
            </div>
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_AUDIOS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setFormData({ ...formData, audioUrl: preset.url })}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {errors.audioUrl && <p className="text-rose-400 text-xs mt-1">{errors.audioUrl[0]}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              รายละเอียดและคำแนะนำเพิ่มเติม *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="แนะนำเรื่องความสว่าง, ปลั๊กไฟ, แอร์, ช่วงเวลาที่คนน้อย, หรือจุดที่เดินเข้าไปหายาก..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
              required
            />
            {errors.description && <p className="text-rose-400 text-xs mt-1">{errors.description[0]}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "กำลังบันทึก..." : isEdit ? "อัปเดตจุดอ่านหนังสือ" : "เผยแพร่จุดอ่านหนังสือ"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
