"use client";

import { useEffect, useState } from "react";
import { noiseLevelLabels, type NoiseLevel } from "@/lib/validations/spot";

export default function NoiseGauge({
  noiseLevel,
  showLabel = true,
  compact = false,
}: {
  noiseLevel: string;
  showLabel?: boolean;
  compact?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const level = (noiseLevel in noiseLevelLabels ? noiseLevel : "moderate") as NoiseLevel;
  const label = noiseLevelLabels[level]?.label || "ปานกลาง";

  // มุมของเข็ม (อิงจาก 0° คือชี้ตรงขึ้นฟ้า 12 นาฬิกา)
  // quiet: -55° (เอียงไปทางซ้าย ชี้ตรงกลางโซนเขียว)
  // moderate: 0° (ชี้ตรงขึ้นฟ้า ชี้ตรงกลางโซนเหลือง)
  // lively: +55° (เอียงไปทางขวา ชี้ตรงกลางโซนแดง)
  const rotationMap: Record<NoiseLevel, number> = {
    quiet: -55,
    moderate: 0,
    lively: 55,
  };

  const needleRotation = rotationMap[level] ?? 0;

  // สีข้อความตามระดับ
  const textColorMap: Record<NoiseLevel, string> = {
    quiet: "text-emerald-500 dark:text-emerald-400",
    moderate: "text-amber-500 dark:text-amber-400",
    lively: "text-rose-500 dark:text-rose-400",
  };

  if (!mounted) {
    return (
      <span
        className={compact ? "inline-block h-6 w-12" : "inline-block h-9 w-18"}
        aria-hidden="true"
      />
    );
  }

  // ขนาดเกจ (อัตราส่วน 2:1 สำหรับครึ่งวงกลม 180 องศาพอดี)
  const sizeClasses = compact ? "w-14 h-7" : "w-20 h-10";
  const labelClasses = compact ? "text-[11px]" : "text-xs";
  const needleHeight = compact ? "h-[24px]" : "h-[34px]";
  const pivotSize = compact ? "w-2.5 h-2.5" : "w-3.5 h-3.5";

  return (
    <div className="inline-flex items-center gap-2.5 select-none" aria-label={`ระดับเสียง ${label}`}>
      {/* 180-Degree Full Semi-Circle Fan Gauge */}
      <div
        className={`relative rounded-t-full ${sizeClasses} shadow-sm border-t border-x border-white/25`}
        style={{
          // Conic Gradient ครบ 180 องศาเต็มเป๊ะ ตั้งแต่ 0deg (ซ้ายสุด) ถึง 180deg (ขวาสุด)
          background:
            "conic-gradient(from 270deg at 50% 100%, #22c55e 0deg, #84cc16 45deg, #eab308 90deg, #f97316 135deg, #ef4444 180deg, transparent 180deg)",
        }}
      >
        {/* เส้นแบ่งโซนบางๆ ที่ 60° (Quiet/Moderate) */}
        <div
          className="absolute bottom-0 left-1/2 h-full w-[1px] -translate-x-1/2 origin-bottom bg-white/40 pointer-events-none"
          style={{ transform: "rotate(-30deg)" }}
        />
        {/* เส้นแบ่งโซนบางๆ ที่ 120° (Moderate/Lively) */}
        <div
          className="absolute bottom-0 left-1/2 h-full w-[1px] -translate-x-1/2 origin-bottom bg-white/40 pointer-events-none"
          style={{ transform: "rotate(30deg)" }}
        />

        {/* เข็มชี้ระดับเสียง (หมุนจากจุดศูนย์กลางล่างสุด 50% 100% เชื่อมติดกับแกนกลาง 100%) */}
        <div
          className="absolute bottom-0 left-1/2 pointer-events-none z-10"
          style={{
            transform: `translateX(-50%) rotate(${needleRotation}deg)`,
            transformOrigin: "bottom center",
            transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* ตัวเข็มสีขาวเรียวยาว โคนเข็มยึดติดกับแกนกลางล่างสุด */}
          <div
            className={`${needleHeight} w-[2px] bg-white rounded-t-full shadow-[0_1px_4px_rgba(0,0,0,0.6)] flex flex-col items-center`}
          >
            {/* ปลายเข็มไฮไลท์สีแดง/ส้มจิ๋ว เพื่อความสมจริงเหมือนเกจวัดไมล์ */}
            <span className="w-full h-1 bg-amber-300 rounded-t-full" />
          </div>
        </div>

        {/* หมุดกึ่งกลางฐานเกจ (Center Pivot Hub) ทับอยู่บนโคนเข็มพอดี ไม่หลุดลอย */}
        <div
          className={`absolute bottom-0 left-1/2 ${pivotSize} -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-md border border-slate-300 z-20 flex items-center justify-center`}
        >
          {/* จุดกึ่งกลางแกนหมุน */}
          <div className="w-1 h-1 rounded-full bg-slate-600" />
        </div>
      </div>

      {/* ข้อความชื่อระดับเสียง */}
      {showLabel && (
        <span className={`font-bold tracking-wide ${labelClasses} ${textColorMap[level]}`}>
          {label}
        </span>
      )}
      <span className="sr-only">ระดับเสียงรบกวน: {label}</span>
    </div>
  );
}
