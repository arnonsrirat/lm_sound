"use client";

import React from "react";
import { X, Keyboard, Volume2, Play, SkipForward, FastForward, Timer, Sliders, HelpCircle } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: "playback" | "volume" | "tools";
  icon: React.ComponentType<{ className?: string }>;
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ["Space"],
    description: "เล่น / หยุดเสียงบรรยากาศชั่วคราว",
    category: "playback",
    icon: Play,
  },
  {
    keys: ["M"],
    description: "ปิดเสียง / เปิดเสียง (Toggle Mute)",
    category: "volume",
    icon: Volume2,
  },
  {
    keys: ["↑", "↓"],
    description: "เพิ่ม / ลดระดับเสียงรวม (ครั้งละ 5%)",
    category: "volume",
    icon: Volume2,
  },
  {
    keys: ["←", "→"],
    description: "เปลี่ยนแทร็กบรรยากาศ ก่อนหน้า / ถัดไป",
    category: "playback",
    icon: SkipForward,
  },
  {
    keys: ["Shift", "← / →"],
    description: "กรอเวลาเสียง ย้อนหลัง / ข้ามไปข้างหน้า 5 วินาที",
    category: "playback",
    icon: FastForward,
  },
  {
    keys: ["T"],
    description: "เปิด / ปิดตัวตั้งเวลา Focus & Sleep Timer",
    category: "tools",
    icon: Timer,
  },
  {
    keys: ["X"],
    description: "เปิด / ปิดหน้าต่าง Sound Mixer Studio",
    category: "tools",
    icon: Sliders,
  },
  {
    keys: ["?"],
    description: "เปิด / ปิดหน้าต่างคู่มือคีย์ลัดนี้",
    category: "tools",
    icon: HelpCircle,
  },
  {
    keys: ["Esc"],
    description: "ปิดหน้าต่างหรือป๊อปอัปทั้งหมด",
    category: "tools",
    icon: X,
  },
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md glass-panel border border-purple-500/30 rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Keyboard className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-base font-bold purple-gradient-text">
                คีย์ลัดสำหรับสมาธิ (Focus Shortcuts)
              </h3>
              <p className="text-xs text-purple-300/70">
                ควบคุมเสียงบรรยากาศได้ทันทีโดยไม่ต้องละมือจากคีย์บอร์ด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2.5">
          {SHORTCUTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 hover:border-purple-500/40 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-purple-200 font-medium truncate">
                    {item.description}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-3">
                  {item.keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-2 py-1 min-w-[24px] text-center font-mono text-[11px] font-bold text-fuchsia-200 bg-purple-900/60 border border-purple-400/40 rounded-lg shadow-sm"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pro Tip */}
        <div className="mt-4 p-3 rounded-2xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-between text-[11px] text-purple-300/80">
          <span>💡 ทำงานอัตโนมัติเฉพาะเมื่อไม่ได้อยู่ในช่องพิมพ์ข้อความ</span>
          <kbd className="px-1.5 py-0.5 font-mono text-[10px] rounded bg-purple-950 border border-purple-500/30 text-purple-200">
            Esc ปิด
          </kbd>
        </div>
      </div>
    </div>
  );
}
