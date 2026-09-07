"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext";
import {
  Volume2,
  Play,
  Pause,
  Sliders,
  Sparkles,
  User,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Music,
  Headphones,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  name?: string | null;
}

export default function Home() {
  const {
    isPlaying,
    togglePlay,
    activeTrack,
    selectTrack,
    tracks,
    setIsMixerOpen,
  } = useAudio();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    // Check current auth status
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.authenticated) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-start overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[150px]" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 p-0.5 shadow-md shadow-teal-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            LM Sound
          </span>
        </div>

        {/* Auth Buttons / User Profile */}
        <div className="flex items-center gap-3">
          {loadingUser ? (
            <div className="h-9 w-24 bg-white/5 rounded-full animate-pulse" />
          ) : currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-xs">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                  {currentUser.username[0].toUpperCase()}
                </div>
                <span className="font-medium text-zinc-200">
                  {currentUser.name || currentUser.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-white/10 text-xs text-zinc-300 transition-all cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md shadow-teal-500/25 hover:brightness-110 transition-all"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-10 sm:pt-16 pb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-teal-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span>ระบบ Persistent Web Audio Engine & Sound Mixer</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
          สร้างบรรยากาศแห่งสมาธิ{" "}
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent">
            ด้วยเสียงที่คุณออกแบบได้
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          สัมผัสประสบการณ์เสียงบรรยากาศที่เล่นต่อเนื่องอย่างราบรื่นไม่มีสะดุด
          พร้อมฟังก์ชัน Sound Mixer สำหรับผสมเสียงสายฝน, ไวท์นอยส์ และสายลม
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>หยุดเสียงชั่วคราว</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>เริ่มฟังเสียงบรรยากาศ</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsMixerOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white font-medium text-sm transition-all cursor-pointer backdrop-blur-md"
          >
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>เปิด Sound Mixer</span>
          </button>
        </div>

        {/* Preset Tracks Grid */}
        <div className="w-full mt-16 text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-teal-400" />
                แทร็กเสียงบรรยากาศยอดนิยม
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                คลิกเพื่อเลือกและเล่นแทร็กทันที เสียงจะเล่นต่อเนื่องข้ามหน้าได้โดยไม่สะดุด
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tracks.map((track) => {
              const isSelected = track.id === activeTrack.id;
              const isCurrentlyPlaying = isSelected && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => selectTrack(track.id)}
                  className={`group relative p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                    isSelected
                      ? "bg-zinc-900/90 border-teal-500/50 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/30"
                      : "bg-zinc-900/40 border-white/10 hover:border-white/20 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/5 border border-white/10 text-zinc-300">
                      {track.category}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrentlyPlaying
                          ? "bg-teal-500 text-white shadow-md shadow-teal-500/30"
                          : "bg-white/5 group-hover:bg-white/10 text-zinc-300"
                      }`}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {track.subtitle}
                  </p>

                  {/* Frequency Visualizer indicator */}
                  {isCurrentlyPlaying && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-teal-400 font-mono">
                      <span>กำลังเล่น...</span>
                      <div className="flex items-end gap-1 h-3">
                        <span className="w-1 bg-teal-400 rounded-full animate-[bounce_0.7s_infinite]" />
                        <span className="w-1 bg-teal-400 rounded-full animate-[bounce_1.1s_infinite_0.2s]" />
                        <span className="w-1 bg-teal-400 rounded-full animate-[bounce_0.9s_infinite_0.4s]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="w-full mt-16 pt-12 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">
              Persistent Web Audio
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              สลับไปหน้าระบบสมาชิก ดูข้อมูล หรือเปลี่ยนหน้าเว็บโดยที่เสียงไม่หยุดชะงัก
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">
              Custom Sound Mixer
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              ปรับเพิ่ม/ลดเสียงฝนตก, คลื่นเสียง White Noise และเสียงลมบรรยากาศได้อย่างอิสระ
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">
              Secure Authentication
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              ระบบตรวจสอบความปลอดภัยด้วย Bcrypt, JWT Session และ Cookie ป้องกันการโจรกรรม
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
