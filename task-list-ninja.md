# Task List สำหรับ Ninja (Auth, Audio Engine & Login UI)

รายการงานและ Checklist สำหรับโมดูล Authentication, Web Audio Engine และ UI ที่เกี่ยวข้อง เพื่อป้องกันการทำงานทับซ้อนกับ Arnon

---

### Checklist รายการงานที่ต้องทำ

- [x] **1. Prisma Schema (User Model)**
  - [x] กำหนดโมเดล `User` ใน `prisma/schema.prisma` (id, email, username, password, spots Spot[])
  - [x] จัดเตรียม Relation เชื่อมโยงกับโมเดล `Spot` ของ Arnon (`spots Spot[]`)

- [x] **2. ระบบ Authentication (API & Core Logic)**
  - [x] ติดตั้งและตั้งค่าการเข้ารหัสรหัสผ่านด้วย `bcryptjs`
  - [x] ออกแบบระบบ Session / Cookie Management สำหรับจัดการสถานะผู้ใช้ (`jose` JWT + HTTP-only Cookie)
  - [x] สร้าง API Route สำหรับ **Register** (`/api/auth/register`) พร้อมการตรวจสอบข้อมูลซ้ำ (Email/Username)
  - [x] สร้าง API Route สำหรับ **Login** (`/api/auth/login`) ตรวจสอบรหัสผ่านและสร้าง Session Cookie
  - [x] สร้าง API Route สำหรับ **Logout** (`/api/auth/logout`) และดึงข้อมูลผู้ใช้ปัจจุบัน (`/api/auth/me`)

- [x] **3. UI หน้าจอ Login & Register (อ้างอิง Wireframe image_77e66d.jpg)**
  - [x] สร้าง Schema สำหรับ Client-side Form Validation ด้วย `zod`
  - [x] สร้างหน้า Login UI พร้อม Background Image, กล่องฟอร์มตรงกลาง (Logo, ช่องกรอก Email/Username, Password, ลิงก์ลืมรหัสผ่าน, ปุ่ม Login, ปุ่มล็อกอินทางเลือก, ลิงก์สมัครสมาชิก)
  - [x] สร้างหน้า Register UI รองรับการสมัครสมาชิกใหม่
  - [x] จัดการสถานะ Loading, Error Alert และ Feedback เมื่อเข้าสู่ระบบสำเร็จ

- [x] **4. Audio Engine (Persistent Web Audio & React Context)**
  - [x] สร้าง `AudioContext` และ Provider สำหรับควบคุมการเล่นเสียงให้เล่นได้ต่อเนื่องโดยไม่สะดุดเมื่อเปลี่ยนหน้าเว็บ (Persistent Web Audio)
  - [x] รองรับการเล่น/หยุด (Play/Pause), ปรับระดับเสียงรวม (Master Volume), และการสลับแทร็กเสียงบรรยากาศ
  - [x] เพิ่มฟังก์ชัน Sound Mixer สำหรับการเปิดผสมเสียงบรรยากาศ (เช่น เสียงฝน, White Noise, Ambient, Waves)

- [x] **5. UI แถบควบคุมเสียง (AudioPlayerBar)**
  - [x] สร้างคอมโพเนนต์ `AudioPlayerBar` แสดงด้านล่างหน้าจอ
  - [x] มีปุ่มควบคุม Play/Pause, แถบ Slider ปรับระดับเสียง, แสดงชื่อแทร็กเสียงบรรยากาศที่กำลังเล่น
  - [x] หน้าต่างป๊อปอัปหรือเมนู Mixer ปรับระดับเสียงแยกแต่ละประเภทบรรยากาศ (Rain / White Noise / Ambient / Waves)

---

### 🟡 In Progress

*(ไม่มีงานที่กำลังทำ - ทุกงานหลักเสร็จสมบูรณ์แล้ว พร้อมเริ่มฟีเจอร์ถัดไป)*

### ✅ Completed

- [x] **Daily Study Streak & Focus Time Tracker (ตัวนับสถิติเวลาอ่านหนังสือสะสมและสตรีคประจำวัน 🔥)**
  - Owner: Ninja
  - Area: User / Audio Engine / Gamification & Habits
  - Priority: High
  - Requirements:
    - ออกแบบระบบบันทึกเวลาฟัง/โฟกัสสะสมแบบเรียลไทม์ (Active Listening & Focus Time Tracking) ใน `AudioContext.tsx`
    - คำนวณจำนวนวันอ่านหนังสือต่อเนื่อง (Daily Study Streak Days 🔥) และสถิติสะสมรายวัน/สัปดาห์
    - บันทึกลงใน `localStorage` (`lhobmoom_study_stats_v1`) พร้อมระบบตรวจสอบวันที่อัตโนมัติ
    - สร้างปุ่ม Streak Badge บน `Header.tsx` แสดงจำนวนวันสตรีคและนาทีที่อ่านวันนี้ (เช่น `🔥 3 วัน | 45 น.`)
    - สร้างหน้าต่างโมดอลสรุปผลงาน `src/components/StudyStatsModal.tsx`:
      - แสดงสตรีคเปลวไฟและสถิติสะสม (เวลาวันนี้, เวลารวม, สถิติต่อเนื่องสูงสุด)
      - กราฟแท่งสถิติการอ่าน 7 วันย้อนหลัง (Weekly Mini Bar Chart)
      - ระบบเหรียญรางวัลสมาธิ (Study Achievement Badges: First Step, Deep Flow, Book Master, On Fire, Zen Master)
      - ปุ่มรีเซ็ตสถิติหากต้องการเริ่มต้นใหม่
    - เชื่อมโยงเข้ากับแถบผู้ใช้และหน้าต่าง Mobile Player
    - ตรวจสอบความเข้ากันได้กับ React 19, TypeScript, ESLint, และ Next.js Production Build
  - Status: Completed
  - Result:
    - ออกแบบ `StudyStats` interface และระบบสะสมเวลาอ่านหนังสือ/ฟังเสียงบรรยากาศแบบเรียลไทม์ (ทุกๆ 60 วินาที = 1 นาทีโฟกัส) ใน `src/context/AudioContext.tsx`
    - เพิ่มการคำนวณสตรีค (Daily Study Streak) ตรวจสอบความต่อเนื่องของวันแบบอัตโนมัติ และบันทึกลง `localStorage` (`lhobmoom_study_stats_v1`) อย่างปลอดภัย พร้อมรองรับ SSR Hydration
    - สร้างคอมโพเนนต์ `src/components/StudyStatsModal.tsx` ดีไซน์ Glassmorphism แสดงสตรีคเปลวไฟ, สถิติสะสมเวลาวันนี้/เวลารวม, กราฟแท่ง 7 วันย้อนหลัง (Weekly Mini Bar Chart), ระบบเหรียญตราความสำเร็จ 5 ระดับ (First Step, Deep Flow, Book Master, On Fire, Zen Master) และตัวเลือกรีเซ็ตสถิติ
    - เชื่อมต่อปุ่ม Streak Badge บน `src/components/Header.tsx` และ `src/components/MobilePlayerSheet.tsx` ให้ผู้ใช้คลิกเปิดดูผลงานได้ทันที
    - ผ่านการทดสอบครบ 4 รายการ: Unit Tests 5/5 ผ่าน, TypeScript Typecheck 0 errors, ESLint 0 errors, และ Next.js Production Build ผ่านฉลุย 100%

- [x] **PWA Web App Manifest, Mobile Installability & Dynamic Soundscape Ambient Aura (PWA & บรรยากาศแสงเรืองตามอารมณ์เสียง)**
  - Owner: Ninja
  - Area: User / PWA / Audio Atmosphere UX
  - Priority: High
  - Requirements:
    - สร้างไฟล์ Next.js App Router Native Metadata Manifest `src/app/manifest.ts` รองรับการติดตั้งแบบ Standalone PWA ลงหน้าจอสมาร์ตโฟนและเดสก์ท็อป (Add to Home Screen)
    - ตั้งค่า Apple Web App meta tags (`apple-mobile-web-app-capable`, status-bar-style, icons) ใน `src/app/layout.tsx`
    - สร้างคอมโพเนนต์ `src/components/AmbientAura.tsx` แสดงแสงเรืองบรรยากาศ Ambient Mesh Glow พื้นหลังที่แปรเปลี่ยนโทนสีอัตโนมัติตามแทร็กที่เล่น (ฝนตก = Ocean Blue/Teal, สมาธิ/ธรรมชาติ = Emerald Zen, คาเฟ่ = Warm Amber, โค้ดดิ้ง = Cyberpunk Violet) และวงรอบ Pomodoro (Focus = Rose / Break = Cyan)
    - รองรับการปรับเอฟเฟกต์แสงแบบ GPU-accelerated เบา ไม่กินสเปกเครื่อง (Smooth CSS Transitions, pointer-events-none)
    - ตรวจสอบความเข้ากันได้กับ React 19, TypeScript, ESLint, และ Next.js Production Build
  - Status: Completed
  - Result:
    - สร้าง `src/app/manifest.ts` คอนฟิก PWA Web Manifest มาตรฐาน ครบทั้งชื่อแอป, ไอคอน, สีธีม, และการแสดงผลแบบ Standalone (สร้างเส้นทาง `/manifest.webmanifest` อัตโนมัติ)
    - เพิ่ม Apple Web App Meta Tags ใน `src/app/layout.tsx` รองรับการเปิดใช้งานเสมือนแอปเนทีฟบน iOS และ iPadOS
    - สร้างคอมโพเนนต์ `src/components/AmbientAura.tsx` เติมเต็มมิติแสงเรืองบรรยากาศ Mesh Blur ปรับเฉดสีตามอารมณ์เสียงและวงรอบ Pomodoro แบบเรียลไทม์ พร้อมแอนิเมชันหายใจเบาๆ เมื่อเล่นเสียง
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

- [x] **Pomodoro Study & Rest Cycle with Web Audio Zen Bell Chime (วงรอบสมาธิและพักผ่อน Pomodoro พร้อมเสียงระฆังเซนเตือนเมื่อจบรอบ)**
  - Owner: Ninja
  - Area: User / Audio Engine / Productivity Timer
  - Priority: High
  - Requirements:
    - ออกแบบและสร้างระบบสังเคราะห์เสียงระฆังเซน (Zen Singing Bowl / Meditation Bell Chime) ด้วย Web Audio API (ฮาร์โมนิกความถี่ 528 Hz Solfeggio Tone + Overtones) แบบ Pure Mathematical Synthesis ออฟไลน์ 100%
    - เพิ่มระบบวงรอบ Pomodoro Cycle ใน `AudioContext.tsx`:
      - โหมด: `focus` (ช่วงเวลาอ่านหนังสือ/ทำงาน) และ `break` (ช่วงเวลาพักสายตา)
      - ตัวเลือกเวลา: Classic 25/5 นาที, Extended 50/10 นาที, Micro-sprint 15/3 นาที
      - สลับสถานะอัตโนมัติเมื่อครบกำหนดเวลา พร้อมลั่นระฆังเซนเตือนนุ่มนวล
      - ปรับลดเสียงบรรยากาศลงระหว่างพักสายตา (Relaxing Rest Volume)
    - เพิ่มแผงควบคุม Pomodoro Studio ใน `SoundMixerModal.tsx` พร้อมปุ่ม "ทดสอบเสียงระฆังเซน 🔔"
    - แสดงแถบสถานะ Pomodoro Pill บน `AudioPlayerBar.tsx` และใน `MobilePlayerSheet.tsx`
    - บันทึกการตั้งค่าลง `localStorage` และรองรับ SSR Hydration
    - ตรวจสอบความเข้ากันได้กับ React 19, TypeScript, ESLint, และ Next.js Production Build
  - Status: Completed
  - Result:
    - ออกแบบและติดตั้งระบบสังเคราะห์เสียงระฆังเซนกังวาน (Zen Bell Chime) 4 ออสซิลเลเตอร์ฮาร์โมนิก (528 Hz, 1056 Hz, 1584 Hz, 2640 Hz) ด้วย Pure Math Envelope ใน `AudioContext.tsx`
    - พัฒนาระบบวงรอบ Pomodoro Cycle รองรับ 3 รูปแบบ: Classic 25/5m, Deep Study 50/10m, และ Sprint 15/3m พร้อมนับถอยหลังและสลับช่วงอัตโนมัติพร้อมเสียงระฆังเซนเตือน
    - สร้างแผงควบคุม Pomodoro Studio ใน `SoundMixerModal.tsx` แสดงเวลาที่เหลือ, แถบ Progress Bar, ปุ่มข้ามช่วง, ปุ่มยกเลิก, และปุ่มทดสอบเสียงระฆังเซน
    - เชื่อมต่อ Pomodoro Pill แสดงผลแบบเรียลไทม์บนแถบควบคุมเสียง `AudioPlayerBar.tsx` และใน `MobilePlayerSheet.tsx`
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

- [x] **3-Band Parametric Audio Equalizer & Studio EQ Presets (Tone Sculpting Engine)**
  - Owner: Ninja
  - Area: User / Audio Engine / DSP Equalizer
  - Priority: High
  - Requirements:
    - พัฒนาระบบ Web Audio 3-Band Parametric Equalizer (BiquadFilter Nodes: Lowshelf 120Hz, Peaking 1000Hz, Highshelf 6000Hz) เชื่อมต่อเข้ากับ Master Audio Bus ใน `AudioContext.tsx`
    - รองรับ 5 รูปแบบพรีเซ็ตสำเร็จรูปยอดนิยม:
      1. `flat`: สมดุลธรรมชาติ คมชัดดั้งเดิม (0 dB / 0 dB / 0 dB)
      2. `bass-boost`: เบสอุ่นลึก เพิ่มพลังเสียงฝนและคลื่นทะเล (+6 dB / 0 dB / -2 dB)
      3. `focus-clarity`: สมาธิคมชัด ตัดเสียงฮัมย่านต่ำ เพิ่มความโปร่งใส (-4 dB / +2 dB / +4 dB)
      4. `soft-comfort`: ฟังสบายนุ่มหู ลดเสียงแหลมล้าหูเมื่อใส่หูฟังนาน (+2 dB / -1 dB / -6 dB)
      5. `lofi-warmth`: โลไฟย้อนยุค โทนเสียงเทปคาสเซ็ทอบอุ่น (+5 dB / +3 dB / -5 dB)
    - รองรับการปรับแต่งสไลเดอร์ย่าน Bass, Mid, Treble แบบแมนนวล (-10 dB ถึง +10 dB) พร้อมปุ่ม Reset คืนค่าเริ่มต้น
    - บันทึกการตั้งค่าพรีเซ็ตและค่า dB ลง `localStorage` (`lmsound_eq_preset_v1`, `lhobmoom_eq_bands_v1`)
    - สร้างแผงควบคุม EQ ใน `SoundMixerModal.tsx` และเพิ่มตัวเลือก EQ ใน `MobilePlayerSheet.tsx`
    - ตรวจสอบความเข้ากันได้กับ React 19, TypeScript, ESLint, และ Next.js Production Build
  - Status: Completed
  - Result:
    - ออกแบบและติดตั้งโครงข่าย 3-Band BiquadFilter (Lowshelf 120Hz, Peaking 1000Hz Q=1.0, Highshelf 6000Hz) แทรกระหว่าง Master Gain และ Audio Destination ใน `AudioContext.tsx`
    - เพิ่มชุดพรีเซ็ต 5 สไตล์: Flat, Deep Warm Bass, Focus Clarity, Ear Comfort, Vintage Lo-Fi
    - รองรับสไลเดอร์ปรับย่านทุ้ม กลาง แหลม อิสระ (-10 dB ถึง +10 dB) พร้อมปุ่ม Reset คืนค่า Flat
    - เพิ่มแผงควบคุม EQ ในหน้าต่าง Sound Mixer (`SoundMixerModal.tsx`) และในแท็บเครื่องเล่นมือถือ (`MobilePlayerSheet.tsx`)
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

- [x] **Mini Player Drawer & Compact Mobile Fullscreen Player (Mobile Sound Sheet)**
  - Owner: Ninja
  - Area: User / Mobile UX / Audio Player Interface
  - Priority: High
  - Requirements:
    - ออกแบบและสร้างหน้าต่างขยายเสียงเต็มจอบนมือถือ (Mobile Fullscreen Player Sheet / Drawer) เมื่อผู้ใช้แตะที่การ์ดแถบเครื่องเล่นเสียงด้านล่าง
    - แสดงภาพหน้าปกจุดอ่านหนังสือขนาดใหญ่ คลื่นเสียง Harmonic Spectrum Visualizer แบบเต็มตา (28 Bars)
    - แสดงชื่อจุด, ระดับเสียงรบกวน, ปุ่มควบคุมเพลงขนาดใหญ่ที่กดง่ายด้วยนิ้วโป้ง (Large Thumb-Friendly Controls)
    - แถบ Seek Scrubbing Bar พร้อมเวลา `mm:ss` และปุ่มลัดข้ามเวลา `-5s` / `+5s`
    - เพิ่ม Quick Channel Sliders (Rain, White Noise, Ambient, Waves) และสลับโหมดคลื่นสมอง (Binaural Beats) + มิติเสียงอคูสติก (Spatial Acoustics) ได้โดยตรงภายใน Sheet
    - มีปุ่มยุบหน้าต่าง (Collapse / Swipe Down Handle) เพื่อกลับสู่แถบเล่นเพลงปกติ
    - ตรวจสอบความปลอดภัยต่อ SSR, React 19, Tailwind CSS 4, และ Responsive Layout
  - Status: Completed
  - Result:
    - สร้างคอมโพเนนต์ `src/components/MobilePlayerSheet.tsx` รองรับ 3 แท็บการใช้งาน: "เครื่องเล่นเสียง" (Player), "ผสมเสียง" (Mixer), และ "คลื่นสมอง & มิติ" (Brainwave & Spatial)
    - มีหน้าปกใหญ่, Waveform Visualizer (28 bars), แถบเลื่อนเวลา Seek Scrubber พร้อมปุ่มข้ามเวลา ±5 วิ, ปุ่มกด Play/Pause ขนาดใหญ่แบบ Thumb-friendly
    - เชื่อมโยงเข้ากับ `AudioPlayerBar.tsx` โดยแตะที่ Track Card หรือปุ่ม Chevron บนมือถือเพื่อเปิด Drawer เต็มจอ
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

- [x] **Binaural Beats & Frequency Brainwave Layer (Alpha / Theta Focus Waves)**
  - Owner: Ninja
  - Area: User / Audio Engine / Neurological Soundscape
  - Priority: High
  - Requirements:
    - ออกแบบโมดูลกำเนิดคลื่นความถี่ Binaural Beats ผ่าน Web Audio API แยกแชนเนลซ้าย-ขวาอิสระ (Stereo Panner / Channel Merger) เพื่อสร้างปรากฏการณ์คลื่นความถี่สมอง
    - รองรับ 3 คลื่นความถี่สมองยอดนิยมสำหรับอ่านหนังสือและสมาธิ:
      1. `alpha` (10 Hz Beat, Base 216 Hz): สมาธิลึก อ่านหนังสือจำแม่น ผ่อนคลายแต่ตื่นตัว (Alpha Flow)
      2. `theta` (6 Hz Beat, Base 144 Hz): ผ่อนคลายลึก จินตนาการ ความคิดสร้างสรรค์และตกผลึกไอเดีย (Deep Creative Calm)
      3. `beta` (15 Hz Beat, Base 240 Hz): ตื่นตัวสูง วิเคราะห์แก้โจทย์ตรรกะหรือโค้ดดิ้งที่ซับซ้อน (Active Problem Solving)
    - สามารถเลือกเปิด/ปิด และปรับระดับเสียงคลื่นความถี่แยกอิสระ (ความดังนุ่มนวลเริ่มต้น 15%)
    - บันทึกการตั้งค่าลง `localStorage` เพื่อจดจำคลื่นสมองที่ผู้ใช้เลือก
    - เพิ่มแผงควบคุม "คลื่นสมองช่วยโฟกัส (Binaural Beats Studio)" ใน `SoundMixerModal.tsx`
    - ตรวจสอบความเข้ากันได้กับ Persistent Web Audio, React 19, และ Next.js Production Build
  - Status: Completed
  - Result:
    - สร้างโครงข่ายกำเนิดคลื่นความถี่ Binaural Beats สองออสซิลเลเตอร์แยก Panner ซ้าย-ขวาอิสระใน `AudioContext.tsx`
    - รองรับ 3 โหมดคลื่นสมอง: คลื่นอัลฟา (Alpha 10Hz), คลื่นเธตา (Theta 6Hz), คลื่นบีตา (Beta 15Hz) พร้อมโหมดปิด (Off)
    - รองรับ Slider ปรับระดับเสียงคลื่นความถี่แยกอิสระ (0 - 50%) พร้อม Smooth Ramp ไม่สะดุดหู และจดจำลง `localStorage` อัตโนมัติ
    - เพิ่มแผงควบคุม "คลื่นสมองช่วยสมาธิ (Binaural Beats Studio)" ใน `SoundMixerModal.tsx` พร้อมป้ายแนะนำการใช้หูฟังสเตอริโอ
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)


- [x] **Audio Spatial Acoustics & Reverb Modes (Acoustic Space Simulator)**
  - Owner: Ninja
  - Area: User / Audio Engine / DSP Audio Effects
  - Priority: High
  - Requirements:
    - ออกแบบโมดูลจำลองมิติเสียงบรรยากาศ (Spatial Acoustics & Reverb) ใน `AudioContext.tsx`
    - รองรับ 4 โหมดมิติอะคูสติก:
      1. `natural`: เสียงต้นฉบับธรรมชาติ คมชัด ไม่ปรุงแต่ง
      2. `cozy-room`: ห้องอ่านหนังสือส่วนตัว อบอุ่น นุ่มนวล (Warm Low-pass & Short Room Reflection)
      3. `rainy-window`: ริมหน้าต่างกระจกยามฝนพรำ (Window Resonance & High-shelf cut)
      4. `cathedral-echo`: โถงห้องสมุดเพดานสูง / กว้างใหญ่ (Deep Spacious Echo & Long Decay Reverb)
    - สร้างสังเคราะห์ Impulse Response / Delay-Feedback Network ด้วย Web Audio API อย่างเบา ไม่สะดุด และไม่เปลือง CPU
    - เพิ่มแผงเลือกโหมด "มิติเสียงบรรยากาศ (Spatial Acoustics)" ใน `SoundMixerModal.tsx` พร้อมแสดงไอคอนและคำอธิบายสไตล์มิติเสียง
    - บันทึกการตั้งค่าลง `localStorage` เพื่อคงสถานะเมื่อผู้ใช้กลับมาใช้งานใหม่
    - ตรวจสอบความเข้ากันได้กับ React 19, TypeScript, ESLint, และ Next.js Production Build
  - Status: Completed
  - Result:
    - ออกแบบและสร้างโครงข่าย DSP Spatial Bus ใน `AudioContext.tsx` แยก Dry/Wet Path ผ่าน `ConvolverNode` และ `BiquadFilterNode`
    - สร้างฟังก์ชันสังเคราะห์ Impulse Response แบบ Pure Mathematical Curve ออฟไลน์ 100% ไม่ต้องโหลดไฟล์เสียงภายนอก
    - เพิ่มชุดตัวเลือก 4 มิติเสียง `ACOUSTIC_SPACES` (Natural Direct, Cozy Study Room, Rainy Windowpane, Grand Library Hall) พร้อม `localStorage` persistence
    - เพิ่มแผงเลือกมิติเสียงอะคูสติกใน `SoundMixerModal.tsx` แสดง Emoji, อัตราส่วน Dry/Wet, และสถานะ Active
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)


- [x] **Audio Track Duration & Progress Scrubbing (Seek Bar & Stream Counter)**
  - Owner: Ninja
  - Area: User / Audio Engine / Client UX
  - Priority: High
  - Requirements:
    - เพิ่มสถานะ `currentTime`, `duration` และฟังก์ชัน `seek(seconds: number)` ใน `AudioContext.tsx` โดยติดตามอีเวนต์ `timeupdate`, `loadedmetadata`, `durationchange` ของ `HTMLAudioElement`
    - ออกแบบการแสดงผลทั้งสองโหมด: โหมดแทร็กไฟล์เสียงจริง (แสดง `01:23 / 04:50` พร้อมแถบ Seek Slider) และโหมดเสียงสังเคราะห์วนลูป (แสดงตัวนับเวลาที่กำลังฟังสด `Live Ambient ∞`)
    - สร้างแถบ Seek Slider สไตล์ Dark Neon พร้อมฟังก์ชันลาก/คลิกเปลี่ยนตำแหน่งเสียงใน `AudioPlayerBar.tsx` และ `SpotDetailInteractive.tsx`
    - ผสานการกดคีย์ลัด `Shift + ArrowLeft` และ `Shift + ArrowRight` สำหรับย้อนหลัง/ข้ามเวลา 5 วินาที
    - ป้องกันปัญหา Performance ด้วย Throttle / Smooth updating และไม่กระทบสถาปัตยกรรม Persistent Web Audio
  - Status: Completed
  - Result:
    - เพิ่มคุณสมบัติ `currentTime`, `duration`, `isLiveStream`, `seek(seconds)`, `skipTime(deltaSeconds)` ใน `AudioContext.tsx`
    - เพิ่มแถบ Interactive Top Scrubber ด้านบนของ `AudioPlayerBar.tsx` พร้อมแสดงผลตัวเลขนับเวลา `mm:ss` และ mini scrubber ในแผงควบคุมกลาง
    - ผสานแถบ Seek Bar และปุ่มข้ามเวลา `±5s` ลงใน Live Sound Card ของ `SpotDetailInteractive.tsx`
    - เพิ่มคีย์ลัดระดับสากล `Shift + ←` / `Shift + →` สำหรับเลื่อนเวลา ±5 วินาที พร้อมแสดงข้อความ HUD Toast และบันทึกใน `KeyboardShortcutsModal.tsx`
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)


- [x] **Interactive Micro Waveform & Audio Spectrum Visualizer**
  - Owner: Ninja
  - Area: User / Audio Visualizer / UI
  - Priority: High
  - Requirements:
    - ออกแบบและสร้างคอมโพเนนต์ `InteractiveWaveform.tsx` แสดงแถบคลื่นเสียง Harmonic Spectrum 24–32 แท่ง
    - ตอบสนองแบบไดนามิกตามสถานะการเล่นเสียง (`isPlaying`): เคลื่อนไหวลื่นไหลด้วย CSS Wave Harmonics และไล่เฉดสี Neon Violet / Fuchsia / Cyan
    - ผสานเข้ากับหน้า `SpotDetailInteractive.tsx` และแถบควบคุมเสียง `AudioPlayerBar.tsx`
    - ไม่ใช้ AnalyserNode เพื่อรักษาความเบาและคงสถาปัตยกรรม Persistent Web Audio
    - ตรวจสอบความเข้ากันได้กับ React 19, Tailwind CSS 4, และ Responsive Layout
  - Status: Completed
  - Result:
    - สร้าง `src/components/InteractiveWaveform.tsx` แสดงแอนิเมชันคลื่นเสียง Micro Waveform แถบสเปกตรัมฮาร์มอนิก 24-32 แท่ง ตอบสนองต่อสถานะ `isPlaying` โดยอัตโนมัติ
    - ผสานเข้ากับ Live Sound Card ใน `SpotDetailInteractive.tsx` (ขนาด 24 แท่งคลื่น พร้อมความสูง 48px และ badge "LIVE AMBIENT SPECTRUM")
    - ผสานเข้ากับ `AudioPlayerBar.tsx` (แถบคลื่น 16 แท่งข้างปุ่มเล่น/หยุดบนหน้าจอ Desktop พร้อมสถานะ active wave)
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)


- [x] **Custom Soundscape Presets & User Blend Bookmark**
  - Owner: Ninja
  - Area: User / Audio Engine / Personalization
  - Priority: High
  - Requirements:
    - ออกแบบและสร้างระบบบันทึกสูตรผสมเสียงส่วนตัว (Save Custom Blend) ของผู้ใช้ พร้อมตั้งชื่อและเลือก Emoji สัญลักษณ์
    - จัดเก็บลงใน `localStorage` (`customBlends`: สูงสุด 10 รายการ) เพื่อให้สูตรเสียงไม่สูญหายเมื่อรีเฟรชหรือกลับมาใช้งานใหม่
    - เพิ่มแผง **"สูตรผสมเสียงของฉัน (My Sound Blends)"** ใน `SoundMixerModal.tsx` ให้ผู้ใช้เรียกใช้สูตรผสมเสียงโปรดได้ใน 1 คลิก
    - มีปุ่มบันทึกสูตรปัจจุบัน และปุ่มลบสูตรที่ไม่ต้องการออกได้
    - ตรวจสอบความปลอดภัยต่อ SSR Hydration, React 19, และ Persistent Web Audio Engine
  - Status: Completed
  - Result:
    - เพิ่ม `CustomBlend` interface และฟังก์ชัน `saveCustomBlend`, `deleteCustomBlend`, `applyCustomBlend` พร้อมจัดเก็บลง `localStorage` อัตโนมัติใน `AudioContext.tsx`
    - สร้างแผงจัดการ "สูตรผสมเสียงของฉัน (My Blends)" ภายใน `SoundMixerModal.tsx` รองรับการตั้งชื่อและเลือก Emoji ประจำสูตร
    - รองรับการคลิก 1-Click เพื่อเรียกใช้สูตรส่วนตัวได้ทันที พร้อมปุ่มลบสูตร และป้ายสรุปอัตราส่วนระดับเสียง
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

- [x] **Soundscape Share Link & URL Preset Blend System**
  - Owner: Ninja
  - Area: User / Audio Engine / Social Sharing
  - Priority: High
  - Requirements:
    - ออกแบบและสร้างฟังก์ชันสร้างลิงก์แชร์เซ็ตผสมเสียง (Share Soundscape Link): นำสถานะ Preset, ระดับเสียงแต่ละช่อง (`rain`, `whitenoise`, `ambient`, `waves`), และตัวตั้งเวลา (`timer`) เข้ารหัสเป็น URL query parameters
    - เพิ่มปุ่มคัดลอกลิงก์แชร์ (Share Soundscape) ใน `SoundMixerModal.tsx` พร้อมแสดงฟีดแบ็ก "คัดลอกลิงก์แล้ว!"
    - สร้าง URL Parameter Reader ภายใน `AudioContext.tsx`: เมื่อมีคนเปิดลิงก์แชร์ ระบบจะปรับระดับเสียงและโหมดพรีเซ็ตตามที่ผู้ส่งแชร์มาให้ทันที
    - มีระบบตรวจสอบความปลอดภัย (Sanitization & Range Clamping 0-1) สำหรับพารามิเตอร์เสียงทั้งหมด
    - ตรวจสอบความเข้ากันได้กับ Next.js 16 App Router (`useSearchParams` หรือ window location), React 19, และ Persistent Web Audio Engine
  - Status: Completed
  - Result:
    - เพิ่มฟังก์ชัน `getShareableUrl` ใน `AudioContext.tsx` สร้าง URL สำหรับแชร์การผสมเสียงแบบละเอียด (เช่น `?preset=custom&rain=80&ambient=50&timer=25`)
    - เพิ่มระบบอ่าน Query Parameters เมื่อเปิดหน้าเว็บ พร้อม Sanitization และ Clamping ระดับเสียง (0 - 100%) เพื่อปรับใช้บรรยากาศเสียงตามลิงก์ที่เพื่อนแชร์มาให้อัตโนมัติ
    - เพิ่มปุ่ม "แชร์การผสมเสียงนี้ (Share)" ใน `SoundMixerModal.tsx` พร้อมแอนิเมชันปุ่ม Checkmark คัดลอกลิงก์แชร์ลงคลิปบอร์ดอย่างรวดเร็ว
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

- [x] **Recently Played History & Quick Replay Queue**
  - Owner: Ninja
  - Area: User / Audio Engine / Client UX
  - Priority: High
  - Requirements:
    - บันทึกประวัติจุดอ่านหนังสือและแทร็กเสียงที่เพิ่งเปิดฟังล่าสุด (`recentlyPlayed`: สูงสุด 6 รายการ) ลงใน `localStorage` อัตโนมัติ
    - เพิ่มสถานะ `recentlyPlayed` และฟังก์ชัน `clearRecentlyPlayed` ใน `AudioContext`
    - เพิ่มแผง **"เพิ่งเปิดฟังล่าสุด (Recently Played)"** ใน `NowPlayingSidebar.tsx` พร้อมปุ่ม Quick Replay ให้ผู้ใช้สลับกลับไปฟังจุดก่อนหน้าได้ทันทีใน 1 คลิก
    - แสดงภาพขนาดย่อ (Thumbnail), ชื่อสถานที่, หมวดหมู่เสียง, และตัวบ่งชี้สถานะกำลังเล่น
    - รองรับปุ่มล้างประวัติการฟัง (Clear History) เมื่อผู้ใช้ต้องการรีเซ็ต
    - ตรวจสอบความปลอดภัยต่อ SSR Hydration และ React 19
  - Status: Completed
  - Result:
    - เพิ่มคิวจัดเก็บประวัติการฟัง `recentlyPlayed` และฟังก์ชัน `clearRecentlyPlayed` ใน `AudioContext.tsx` พร้อมบันทึกลง `localStorage` อัตโนมัติ
    - สร้างแผงแสดงรายการ "เพิ่งเปิดฟังล่าสุด" ใน `NowPlayingSidebar.tsx` พร้อมปุ่มเล่นซ้ำทันที (Quick Replay) ในคลิกเดียว
    - มีตัวบ่งชี้แทร็กที่กำลังเล่น (Active Ring + Animated Pulse Dot) และปุ่มล้างประวัติ
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

- [x] **Audio Error Resilience & Seamless Synthesizer Fallback**
  - Owner: Ninja
  - Area: User / Audio Engine / Reliability
  - Priority: High
  - Requirements:
    - ดักจับ Audio Network & Loading Error จาก external audio URLs (`audio.onerror`, `play().catch()`, 404, Network Offline)
    - Seamless Graceful Fallback: สลับไปเปิด Web Audio Synthesized Ambience (Rain / Pink Noise / Ambient Drone) อัตโนมัติ ป้องกันไม่ให้เกิดความเงียบกริบกะทันหัน
    - เพิ่มสถานะ `isSynthesizerFallback` ใน `AudioContext`
    - แสดง Audio Engine Resilient Badge บน `AudioPlayerBar` แจ้งสถานะการทำงานของ Web Audio Synthesizer
    - มีระบบ Auto-Retry เชื่อมต่อไฟล์เสียงภายนอกใหม่อัตโนมัติเมื่อเครือข่ายกลับมาใช้งานได้
    - ตรวจสอบความเข้ากันได้กับ React 19, Persistent Web Audio Engine, และ AudioContext lifecycle
  - Status: Completed
  - Result:
    - ติดตั้งระบบดักจับ Error ใน `AudioContext.tsx` (`onerror`, `play().catch()`): สลับการทำงานไปใช้ Web Audio Synthesized Ambience อัตโนมัติเมื่อไฟล์เสียงภายนอกเข้าถึงไม่ได้
    - เพิ่มสถานะ `isSynthesizerFallback` และฟังก์ชัน `retryAudioSource` ใน `AudioContextType`
    - เพิ่มป้ายกำกับ `✨ Web Audio Synth` สีมรกตเรืองแสงบน `AudioPlayerBar.tsx` เพื่อให้ผู้ใช้ทราบสถานะว่าระบบเสียงยังคงบรรเลงต่อเนื่องแม้ออฟไลน์
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

- [x] **Focus Keyboard Shortcuts & Audio Hotkeys System**
  - Owner: Ninja
  - Area: User / Desktop UX / Audio Hotkeys
  - Priority: High
  - Requirements:
    - สร้างระบบ Global Keyboard Event Listener สำหรับควบคุมเสียงและสมาธิได้ทันที:
      - `Space`: เล่น / หยุดเสียงชั่วคราว (Play / Pause)
      - `m` หรือ `M`: เปิด / ปิดเสียง (Toggle Mute)
      - `ArrowUp` / `ArrowDown`: เพิ่ม / ลดระดับเสียงทีละ 5% พร้อม HUD Toast Feedback
      - `ArrowRight` / `ArrowLeft`: เปลี่ยนแทร็กเสียงบรรยากาศถัดไป / ย้อนกลับ
      - `t` หรือ `T`: เปิด / ปิดเมนูตั้งเวลา Focus & Sleep Timer
      - `x` หรือ `X`: เปิด / ปิดหน้าต่าง Sound Mixer Studio
      - `?`: เปิด / ปิดหน้าต่างแนะนำคีย์ลัด (Keyboard Shortcuts Guide)
      - `Escape`: ปิดทุกหน้าต่าง Popover และ Modal
    - ป้องกันการรบกวนการพิมพ์ข้อความ (Input & Textarea Safeguard): ข้ามการทำงานเมื่อ Cursor อยู่ในช่อง Input, Textarea หรือฟอร์มค้นหา
    - สร้าง Keyboard Shortcuts Guide Modal แบบ Glassmorphism พร้อมปุ่ม Keycap Badges ดีไซน์พรีเมียม
    - เพิ่มปุ่มเรียกดูคู่มือคีย์ลัดบนแถบ `AudioPlayerBar` ให้ค้นพบและใช้งานได้สะดวก
    - ตรวจสอบความเข้ากันได้กับ React 19, Client Component Lifecycle, และ Accessibility
  - Status: Completed
  - Result:
    - สร้างคอมโพเนนต์ `KeyboardShortcutsModal.tsx` แสดงรายการคีย์ลัดทั้งหมดด้วยดีไซน์คีย์แคป Glassmorphism
    - ติดตั้ง Global Keyboard Event Listener ใน `AudioPlayerBar.tsx` พร้อมระบบป้องกันการพิมพ์ชนกับ Input/Textarea/ContentEditable
    - เพิ่ม Floating HUD Toast Feedback เรืองแสงกลางจอด้านล่าง แจ้งเตือนระดับเสียงและสถานะทันทีเมื่อกดปุ่มลัด
    - เพิ่มปุ่มเปิดคู่มือลัดบน `AudioPlayerBar` (พร้อมรองรับการกด `?` หรือคลิกไอคอนคีย์บอร์ด)
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

### ✅ Completed

- [x] **Focus Sleep Timer, Audio State Persistence & Mobile Player UX**
  - Owner: Ninja
  - Area: User / Audio Engine / Mobile UX
  - Priority: High
  - Requirements:
    - ออกแบบและสร้างตัวตั้งเวลาโฟกัสและกล่อมนอน (Focus & Sleep Timer): รองรับ 15m, 25m (Pomodoro), 45m, 60m พร้อมตัวเลือกกำหนดเองหรือยกเลิก
    - ระบบ Smooth Fade-out ในช่วง 30 วินาทีสุดท้ายก่อนหยุดเสียงบรรยากาศอัตโนมัติอย่างนุ่มนวล
    - เพิ่ม Audio State & Volume Persistence (`localStorage`): จดจำระดับ Master Volume, ค่า Volume แยกของแต่ละช่องเสียง (Mixer Channels), และ Preset ID ล่าสุด ไม่ให้เสียงดังตกใจหรือค่าเซ็ตติ้งหายเมื่อรีเฟรช
    - ปรับปรุง Mobile UX บน `AudioPlayerBar`: เพิ่ม Quick Volume Popover และปุ่มตั้งเวลา Timer บนหน้าจอมือถือ (จากเดิมที่ volume slider ถูกซ่อนบนจอเล็ก) ให้ผู้ใช้มือถือปรับเสียงและตั้งเวลาได้สะดวก ไม่ต้องเปิด Modal เต็มจอ
    - ตรวจสอบความเข้ากันได้กับ React 19, SSR Hydration, และ Persistent Web Audio Engine
  - Status: Completed
  - Result:
    - เพิ่ม `SLEEP_TIMER_OPTIONS` (15m Power Nap, 25m Pomodoro, 45m Study Block, 60m Deep Sleep) พร้อมตัวนับถอยหลังเรียลไทม์และระบบหรี่เสียงนุ่มนวล (Smooth 30s Fade-Out) ก่อนหยุดเสียงใน `AudioContext.tsx`
    - เพิ่มระบบบันทึกและโหลดค่าการตั้งค่าเสียงอัตโนมัติลง `localStorage` อย่างปลอดภัยต่อ SSR Hydration (จดจำ Master Volume, สถานะช่องเสียง Mixer, และค่า Preset ที่ผู้ใช้เลือก)
    - ยกระดับ `AudioPlayerBar`: เพิ่มปุ่ม Timer พร้อม Badge ตัวเลขนับถอยหลังกะพริบและ Popover Menu สำหรับตั้งเวลา, เพิ่ม Mobile Quick Volume Popover ให้ผู้ใช้มือถือปรับเสียงได้ทันทีโดยไม่ต้องเปิด Modal เต็มจอ
    - เพิ่มแผงตั้งเวลา Focus & Sleep Timer ภายใน `SoundMixerModal` ให้ปรับแต่งร่วมกับเสียงสังเคราะห์ได้อย่างกลมกลืน
    - ผ่านการทดสอบทั้งหมด: TypeScript (`npx tsc --noEmit`), ESLint (`npm run lint`), Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

- [x] **Sound Match & Focus Intention Filter**
  - Owner: Ninja
  - Area: User / Sound Matching / UI
  - Priority: High
  - Requirements:
    - ออกแบบและสร้างระบบ Sound Match (จับคู่จุดอ่านหนังสือจากเจตนาการโฟกัสของผู้ใช้)
    - รองรับ 4 เจตนาหลัก: 🎯 ติวสอบเงียบกริบ (Deep Silent Study), 👥 ทำงานกลุ่ม/ประชุม (Group Discussion), ☕ ผ่อนคลายสบายสมอง (Chill & Creative), 🌙 โต้รุ่งยามดึก 24 ชม. (Late Night Grind)
    - คำนวณความตรงกันแบบ Deterministic Matching Score จากฟิลด์ที่มีอยู่จริง (`noiseLevel`, `title`, `description`, `location`) โดยไม่พึ่ง Machine Learning และไม่แก้ Database Schema
    - แสดงป้ายกำกับ Match Score (เช่น 🎯 98% Match) และไฮไลต์จุดอ่านหนังสือที่ตรงที่สุด พร้อมปุ่มสุ่ม/เลือกฟังเสียงตัวอย่างได้ทันที
    - รองรับการเปิด/ปิดโหมด Sound Match และการรีเซ็ตกลับสู่ฟีดปกติอย่างลื่นไหล
  - Status: Completed
  - Result:
    - เพิ่ม `SOUND_MATCH_INTENTIONS` 4 โหมดเจตนา พร้อมฟังก์ชันคำนวณคะแนนจับคู่แบบ Deterministic ใน `SpotFeed.tsx`
    - สร้าง Sound Match Selector Panel พร้อมแถบสรุปผลและปุ่มเล่นเสียงของจุดที่ Match สูงสุดอันดับ 1 ทันที
    - เพิ่มป้ายกำกับ `🏆 Best Match` และ `% Match` บนการ์ด `SpotCard`
    - ทดสอบผ่านทั้งหมด: TypeScript, ESLint, Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

### ✅ Completed

- [x] **Living Sound Card & Ambient Reactivity**
  - Owner: Ninja
  - Area: User / Audio / UI
  - Priority: High
  - Requirements:
    - เพิ่ม Living Sound Card State เมื่อ Spot กำลังเล่นเสียง (`isPlaying && activeTrack.id === spot.id`)
    - แสดง Animated Audio Waveform & Equalizer Bars บนการ์ดแบบไดนามิก
    - เพิ่มขอบเรืองแสง (Glow Border), Sound Aura Effect, และ Badge บอกสถานะ "กำลังถ่ายทอดเสียงสด (LIVE AMBIENT)"
    - ปรับปรุงการตอบสนองบน SpotCard, FeaturedBanner, และหน้า Spot Detail ให้สอดคล้องกันอย่างมีมิติ
    - ไม่ใช้ AnalyserNode เพื่อรักษา Performance และคงสถาปัตยกรรม Persistent Web Audio
  - Status: Completed
  - Result:
    - เพิ่ม CSS Keyframes (`livingSoundAura`, `waveBounce`, `soundRipple`) ใน `globals.css`
    - เพิ่ม Living Sound Card State ใน `SpotCard`: กรอบนีออนเรืองแสง breathing aura, แถบสเปกตรัมเสียง, ปุ่มเล่นพร้อมคลื่นเสียง ripple, และ 6-bar dynamic equalizer
    - ปรับปรุง `FeaturedBanner` และ `SpotDetailInteractive` ให้มีสถานะถ่ายทอดเสียงสด LIVE SOUND และคลื่น equalizer bar สอดคล้องกัน
    - ปรับแก้ `isFavorite` state initialization ให้เป็นไปตามหลักการ React 19 และกำจัด cascading render
    - ทดสอบผ่านทั้งหมด: TypeScript, ESLint, Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

### ✅ Completed

- [x] **Focus Recipe & Sound Mixer Integration**
  - Owner: Ninja
  - Area: User / Audio
  - Priority: High
  - Requirements:
    - เพิ่มโหมด Focus Recipe มาตรฐาน 4 โหมด: Deep Focus, Rainy Study, Café Mode, Night Coding
    - เชื่อมต่อ Focus Recipe เข้ากับ Sound Mixer (ทั้งใน `SoundMixerModal` และ `NowPlayingSidebar`)
    - แสดงสถานะ Active Preset ชัดเจน พร้อมสลับเป็นโหมด Custom เมื่อผู้ใช้ปรับ Slider เองแบบ Manual
    - ไม่ต้องแก้ Database Schema (ใช้ TypeScript configuration + AudioContext State)
    - ตรวจสอบความเข้ากันได้และการทำงานร่วมกับ Living Sound Card และ Persistent Audio Engine
  - Status: Completed
  - Result:
    - เพิ่มค่าพรีเซ็ตมาตรฐาน 4 โหมด (Deep Focus, Rainy Study, Café Mode, Night Coding) พร้อม TypeScript types ใน `AudioContext.tsx`
    - เพิ่ม Focus Recipe Cards, ตัวชี้วัดสถานะโหมดใช้งาน, และระบบสลับเป็น Custom Mode เมื่อปรับแต่ง Slider เองใน `SoundMixerModal`
    - อัปเดตชิปพรีเซ็ตและตัวแจ้งเตือน Custom Mode ใน `NowPlayingSidebar` และ `SpotFeed`
    - ทดสอบผ่านทั้งหมด: TypeScript, ESLint, Unit Tests (`npm test`), และ Next.js Production Build (`npm run build`)

