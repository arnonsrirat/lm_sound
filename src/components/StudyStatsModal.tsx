"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Flame,
  Clock,
  Trophy,
  Award,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Zap,
} from "lucide-react";
import { useAudio, getTodayDateStr } from "@/context/AudioContext";

interface StudyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Achievement {
  id: string;
  name: string;
  thaiName: string;
  description: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  progressText: string;
}

const THAI_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export default function StudyStatsModal({ isOpen, onClose }: StudyStatsModalProps) {
  const { studyStats, resetStudyStats } = useAudio();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate 7-day weekly history data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dateNum = String(d.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${dateNum}`;
      const minutes = (i === 0 ? (studyStats.dailyHistory?.[dateKey] || studyStats.todayMinutes) : (studyStats.dailyHistory?.[dateKey] || 0)) || 0;

      days.push({
        dateKey,
        dayLabel: THAI_DAYS[d.getDay()],
        dateDisplay: `${d.getDate()}/${d.getMonth() + 1}`,
        minutes,
        isToday: i === 0,
      });
    }

    const maxMinutes = Math.max(...days.map((d) => d.minutes), 30);
    return { days, maxMinutes };
  }, [studyStats.dailyHistory, studyStats.todayMinutes]);

  // Achievement Badges evaluation
  const achievements: Achievement[] = useMemo(() => {
    const total = studyStats.totalMinutes || 0;
    const streak = Math.max(studyStats.streakDays || 0, studyStats.bestStreak || 0);

    return [
      {
        id: "first-step",
        name: "First Step",
        thaiName: "ก้าวแรกสู่สมาธิ",
        description: "สะสมเวลาโฟกัสและฟังเสียงบรรยากาศครบ 10 นาที",
        icon: "🎯",
        color: "from-emerald-500/20 to-teal-500/20 border-teal-500/40 text-teal-300",
        isUnlocked: total >= 10,
        progressText: total >= 10 ? "สำเร็จแล้ว" : `${total} / 10 นาที`,
      },
      {
        id: "deep-flow",
        name: "Deep Flow",
        thaiName: "ดำดิ่งสู่ภวังค์",
        description: "สะสมเวลาอ่านหนังสือและโฟกัสครบ 60 นาที (1 ชม.)",
        icon: "🌊",
        color: "from-blue-500/20 to-cyan-500/20 border-cyan-500/40 text-cyan-300",
        isUnlocked: total >= 60,
        progressText: total >= 60 ? "สำเร็จแล้ว" : `${total} / 60 นาที`,
      },
      {
        id: "book-master",
        name: "Book Master",
        thaiName: "ยอดนักอ่านตัวยง",
        description: "สะสมเวลาสมาธิครบ 300 นาที (5 ชม.) เพื่อความเชี่ยวชาญ",
        icon: "📚",
        color: "from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300",
        isUnlocked: total >= 300,
        progressText: total >= 300 ? "สำเร็จแล้ว" : `${total} / 300 นาที`,
      },
      {
        id: "on-fire",
        name: "On Fire",
        thaiName: "ไฟแห่งความสม่ำเสมอ",
        description: "รักษาสตรีคอ่านหนังสือต่อเนื่อง 3 วันติด",
        icon: "🔥",
        color: "from-rose-500/20 to-orange-500/20 border-rose-500/40 text-rose-300",
        isUnlocked: streak >= 3,
        progressText: streak >= 3 ? "สำเร็จแล้ว" : `${streak} / 3 วัน`,
      },
      {
        id: "zen-master",
        name: "Zen Master",
        thaiName: "ปรมาจารย์แห่งสมาธิ",
        description: "รักษาสตรีคสมาธิและเปิดเสียงบรรยากาศ 7 วันติดต่อกัน",
        icon: "🧘",
        color: "from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300",
        isUnlocked: streak >= 7,
        progressText: streak >= 7 ? "สำเร็จแล้ว" : `${streak} / 7 วัน`,
      },
    ];
  }, [studyStats.totalMinutes, studyStats.streakDays, studyStats.bestStreak]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalHours = (studyStats.totalMinutes / 60).toFixed(1);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 my-auto w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain glass-panel border border-orange-500/30 rounded-3xl shadow-2xl p-4 sm:p-6 animate-in zoom-in-95 duration-200 text-white space-y-6" onClick={(event) => event.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-orange-500/30 text-amber-300 shadow-inner">
              <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full animate-ping" />
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                สถิติสมาธิ & สตรีคอ่านหนังสือ
              </h3>
              <p className="text-xs text-orange-200/70">
                Daily Study Streak & Focus Time Tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="sticky top-0 z-20 shrink-0 p-2 rounded-xl bg-[#170c2c]/90 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Streak Banner */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-rose-950/40 border border-orange-500/30 shadow-lg">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Current Streak
                </span>
                {studyStats.streakDays > 0 && (
                  <span className="text-[11px] text-orange-300 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-300" /> ไฟกำลังลุกโชน!
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  {studyStats.streakDays || 0}
                </span>
                <span className="text-base font-semibold text-orange-200/90">
                  วันติดต่อกัน
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                สถิติต่อเนื่องสูงสุด:{" "}
                <span className="text-amber-300 font-semibold">
                  {studyStats.bestStreak || studyStats.streakDays || 0} วัน
                </span>
              </p>
            </div>

            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600/30 to-amber-400/30 flex items-center justify-center border border-orange-400/40 shadow-xl shadow-orange-500/10 shrink-0">
              <span className="text-3xl filter drop-shadow-md select-none">🔥</span>
            </div>
          </div>
        </div>

        {/* 3 Stats Overview Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition text-center space-y-1">
            <div className="flex justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white">
              {studyStats.todayMinutes}
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">นาทีวันนี้</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition text-center space-y-1">
            <div className="flex justify-center text-orange-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white">{totalHours}</div>
            <div className="text-[11px] text-zinc-400 font-medium">ชั่วโมงสะสม</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition text-center space-y-1">
            <div className="flex justify-center text-teal-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white">
              {unlockedCount} / {achievements.length}
            </div>
            <div className="text-[11px] text-zinc-400 font-medium">เหรียญรางวัล</div>
          </div>
        </div>

        {/* 7-Day Weekly Mini Bar Chart */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>สถิติการโฟกัส 7 วันย้อนหลัง</span>
            </div>
            <span className="text-[11px] text-zinc-400">หน่วย: นาที</span>
          </div>

          <div className="h-32 flex items-end justify-between gap-2 pt-4 px-1">
            {weeklyData.days.map((item) => {
              const heightPercent = Math.max(
                8,
                Math.round((item.minutes / weeklyData.maxMinutes) * 100)
              );
              return (
                <div
                  key={item.dateKey}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                >
                  {/* Tooltip bubble on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-2 py-0.5 rounded bg-zinc-900 border border-white/20 text-[10px] text-white whitespace-nowrap z-20 shadow-lg">
                    {item.dateDisplay}: {item.minutes} นาที
                  </div>

                  {/* Bar */}
                  <div className="w-full h-full flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        item.isToday
                          ? "bg-gradient-to-t from-orange-600 to-amber-400 shadow-md shadow-orange-500/20"
                          : item.minutes > 0
                          ? "bg-gradient-to-t from-purple-700/60 to-purple-400/80 group-hover:from-purple-600 group-hover:to-purple-300"
                          : "bg-white/10 group-hover:bg-white/20"
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[11px] font-medium ${
                      item.isToday
                        ? "text-amber-300 font-bold"
                        : "text-zinc-400"
                    }`}
                  >
                    {item.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievement Badges Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Award className="w-4 h-4 text-amber-400" />
              <span>เหรียญรางวัลสมาธิ (Study Badges)</span>
            </div>
            <span className="text-[11px] text-amber-300 font-medium">
              ปลดล็อกแล้ว {unlockedCount} จาก {achievements.length}
            </span>
          </div>

          <div className="space-y-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  ach.isUnlocked
                    ? `bg-gradient-to-r ${ach.color} shadow-sm`
                    : "bg-white/[0.02] border-white/5 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      ach.isUnlocked
                        ? "bg-black/20 shadow-inner"
                        : "bg-white/5 grayscale"
                    }`}
                  >
                    {ach.icon}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs font-bold truncate ${
                          ach.isUnlocked ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {ach.thaiName}
                      </h4>
                      <span className="text-[10px] text-zinc-400 truncate">
                        ({ach.name})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300/80 line-clamp-1">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {ach.isUnlocked ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ปลดล็อก</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-400 font-medium">
                      {ach.progressText}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Reset Stats Section */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <div>
            <span>บันทึกลงในเครื่องอัตโนมัติ</span>
          </div>

          <div>
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-300 transition cursor-pointer px-2 py-1 rounded hover:bg-rose-500/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตสถิติ</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in duration-150">
                <span className="text-rose-300 text-[11px]">ยืนยันการล้างข้อมูล?</span>
                <button
                  onClick={() => {
                    resetStudyStats();
                    setShowConfirmReset(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow cursor-pointer transition"
                >
                  ยืนยัน
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 text-xs cursor-pointer transition"
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    ),
    document.body,
  );
}
