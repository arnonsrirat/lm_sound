# รายงานวิเคราะห์ระบบ LMSound

## 1. Current Architecture

### โครงสร้างหลัก

- `src/app/` เป็น Next.js App Router ทั้งหน้าเว็บและ Route Handlers
- `src/components/` รวม client components เช่น Feed, Spot Card, Audio Player, Mixer และ Admin Dashboard
- `src/actions/` รวม Server Actions สำหรับ Spot, Admin และ Media
- `src/lib/` รวม Prisma client, authentication, validation, fallback data และ site settings
- `prisma/schema.prisma` เป็น database schema หลักของ PostgreSQL ผ่าน Prisma
- `public/` เก็บ static assets และไฟล์ upload
- `Dockerfile` และ `docker-compose.yml` รองรับ production container

### Frontend flow

หน้าแรกอยู่ที่ `src/app/page.tsx`:

1. อ่าน query parameters `search` และ `noiseLevel`
2. อ่าน session ผ่าน `getSession()`
3. โหลด Spot ผ่าน `getSpots()` จาก `src/actions/spot.ts`
4. โหลด site settings ผ่าน `getSiteSettings()`
5. Render `Header`, `Sidebar`, `FeaturedBanner`, `SpotFeed`, `NowPlayingSidebar` และ `BottomNav`

`AudioProvider` และ `AudioPlayerBar` ถูก mount ที่ root layout ใน `src/app/layout.tsx` จึงคง state เสียงระหว่าง client-side navigation ได้

### Backend flow

Spot ใช้ทั้ง Server Actions และ Route Handlers:

- Server Actions: `src/actions/spot.ts`
- Collection API: `src/app/api/spots/route.ts`
- Individual Spot API: `src/app/api/spots/[id]/route.ts`

Validation ใช้ `spotSchema` จาก `src/lib/validations/spot.ts`

### Database flow

Prisma client อยู่ที่ `src/lib/prisma.ts` และ schema อยู่ที่ `prisma/schema.prisma`

หน้าแรกเรียก `getSpots()` ซึ่งมี timeout ราว 1.2 วินาทีและ fallback ไป `src/lib/fallbackSpots.ts` เมื่อ database ใช้งานไม่ได้หรือไม่มีข้อมูล ส่วน API routes เรียก Prisma โดยตรงและไม่มี fallback เดียวกัน

### Authentication flow

Authentication อยู่ใน:

- `src/lib/auth.ts`
- `src/lib/user-service.ts`
- `src/lib/validation.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`

Flow หลักคือ validate ข้อมูล, hash password ด้วย bcryptjs, ตรวจ password, สร้าง JWT ด้วย jose, เก็บใน HTTP-only cookie ชื่อ `lm_sound_session`, แล้วอ่านผ่าน `getSession()` หรือบังคับ login ผ่าน `requireAuth()` ไม่มี `middleware.ts` หรือ `src/middleware.ts`

### Audio flow

Audio state อยู่ใน `src/context/AudioContext.tsx`

- `SpotCard` เรียก `playSpot()`
- `AudioPlayerBar` เรียก `togglePlay()`, `nextTrack()` และ `prevTrack()`
- `SoundMixerModal` ควบคุม volume และ enable/disable ของ channels
- `NowPlayingSidebar` แสดงสถานะเพลงปัจจุบัน

## 2. Current Feature Status

| Feature | Status | Implementation | Important Files | Notes |
| --- | --- | --- | --- | --- |
| Register | Complete | Register API, validation, user creation | `src/app/api/auth/register/route.ts`, `src/lib/validation.ts`, `src/lib/user-service.ts` | มี Prisma และ in-memory fallback |
| Login | Complete | ตรวจ identifier/password และสร้าง JWT cookie | `src/app/api/auth/login/route.ts`, `src/lib/auth.ts` | รองรับ email หรือ username |
| Logout | Complete | ล้าง session cookie | `src/app/api/auth/logout/route.ts`, `src/lib/auth.ts` | ใช้ `maxAge: 0` |
| HTTP-only session | Complete | JWT ใน HTTP-only cookie | `src/lib/auth.ts` | ใช้ `sameSite: lax` |
| Password hashing | Complete | bcrypt hash/compare | `src/lib/auth.ts` | salt rounds = 10 |
| Spot create | Complete | Server Action และ POST API | `src/actions/spot.ts`, `src/app/api/spots/route.ts` | ต้อง login |
| Spot read | Potential Issue | หน้าแรกมี DB timeout + fallback; API ใช้ Prisma ตรง | `src/actions/spot.ts`, `src/app/api/spots/route.ts` | behavior ต่างกัน |
| Spot update | Potential Issue | Server Action และ PUT API | `src/actions/spot.ts`, `src/app/api/spots/[id]/route.ts` | policy admin ไม่ตรงกัน |
| Spot delete | Potential Issue | Server Action และ DELETE API | `src/actions/spot.ts`, `src/app/api/spots/[id]/route.ts` | policy admin ไม่ตรงกัน |
| Ownership authorization | Potential Issue | `assertSpotOwnership()` | `src/lib/auth.ts` | API ไม่ส่ง admin override |
| Feed | Complete | Server-loaded responsive feed | `src/app/page.tsx`, `src/components/SpotFeed.tsx` | มี fallback data |
| Search | Complete | query param, server search, client filtering | `src/actions/spot.ts`, `src/components/SpotFeed.tsx`, `src/components/Header.tsx` | filter ซ้ำสองชั้น |
| Zone filtering | Partial | ใช้ `location` เป็น text search | `src/components/SpotFeed.tsx`, `src/actions/spot.ts` | ไม่มี zone field |
| Noise filtering | Complete / Different from blueprint | `quiet`, `moderate`, `lively` | `src/lib/validations/spot.ts`, `src/components/SpotFeed.tsx` | ไม่ใช่ scale 1-5 |
| Persistent audio | Complete | Provider อยู่ root layout และเก็บ audio refs | `src/app/layout.tsx`, `src/context/AudioContext.tsx` | อยู่ต่อระหว่าง client navigation |
| AudioPlayerBar | Complete | global fixed player | `src/components/AudioPlayerBar.tsx` | อ่าน AudioProvider |
| Mixer | Partial | 4 Web Audio synthesizer channels | `src/context/AudioContext.tsx`, `src/components/SoundMixerModal.tsx` | Spot audio ไม่ผ่าน mixer graph |
| Docker setup | Complete | multi-stage standalone image | `Dockerfile`, `docker-compose.yml` | mount uploads volume |
| Prisma / Neon setup | Potential Issue | Postgres datasource และ direct URL | `prisma/schema.prisma`, `.env.example` | มี placeholder credentials และ env mismatch |

## 3. Database Review

### User model

`prisma/schema.prisma` กำหนด `User` ด้วย `id`, `email`, `username`, `password`, `role`, timestamps และ relation `spots`

- `email` และ `username` มี unique constraint
- `password` เก็บ password hash
- `role` เป็น String default `USER`
- User หนึ่งคนมี Spot ได้หลายรายการ

### Spot model

Spot มี `id`, `title`, `description`, `location`, `noiseLevel`, `imageUrl`, `audioUrl`, `authorId`, timestamps และ relation กลับไป User

มี index เฉพาะ:

```prisma
@@index([authorId])
```

### SiteSetting model

`SiteSetting` เป็น key-value store สำหรับ admin configurable settings เช่น logo, banner, site name, tagline, festival theme และ banner text โดย logic อยู่ใน `src/lib/site-settings.ts`

### ความพร้อมสำหรับ Plus-One features

ไม่พบ fields ที่ structured สำหรับ facilities, zone, noise score 1-5, mood, focus intention, user recipes หรือ audio analysis

- Sound Match: ทำได้โดยไม่แก้ schema จาก `noiseLevel`, `location`, title และ description แต่ความแม่นยำด้าน facilities จำกัด
- Living Sound Card: ทำได้โดยไม่แก้ schema จาก `activeTrack.id` และ `isPlaying`
- Focus Recipe: ทำได้โดยไม่แก้ schema โดยเก็บเป็น TypeScript configuration

ยังไม่ควรทำ migration สำหรับ Plus-One version แรก

## 4. Audio Architecture Review

### Lifecycle

```text
SpotCard
  -> handleTogglePlay()
  -> useAudio().playSpot(track)
  -> AudioProvider.setActiveTrack()
  -> getOrCreateAudioContext()
  -> create/replace HTMLAudioElement
  -> HTMLAudioElement.play()
  -> AudioPlayerBar / NowPlayingSidebar อ่าน context state
```

`src/components/SpotCard.tsx` ส่ง Spot ID, title, description, category, image URL, audio URL และ location ไป `playSpot()` ใน `src/context/AudioContext.tsx`

### ระบบเสียงปัจจุบัน

มีสอง audio paths แยกกัน:

1. `HTMLAudioElement` สำหรับ `activeTrack.audioUrl`
2. Web Audio API สำหรับ generated mixer channels

Web Audio API มี:

- `AudioContext`
- `GainNode` สำหรับ master และแต่ละ channel
- `AudioBufferSourceNode` สำหรับ rain, white noise และ waves
- `OscillatorNode` สำหรับ ambient drone
- filters และ LFO

ไม่พบ:

- `MediaElementAudioSourceNode`
- `AnalyserNode`

ดังนั้น Spot audio ไม่ได้เชื่อมผ่าน Web Audio graph เดียวกับ mixer

### Persistent audio

เสียง persist ระหว่าง client-side navigation เพราะ `AudioProvider` ถูก mount ใน `src/app/layout.tsx` และ audio refs อยู่ใน provider

การ reload เต็มหน้า เสียงหยุดตามปกติ และ `.play().catch(() => {})` กลืน error จาก autoplay restriction โดยไม่แจ้งผู้ใช้

### การเพิ่ม AnalyserNode

ทำได้ แต่เป็นงานระดับ Medium:

1. สร้าง `MediaElementAudioSourceNode` จาก HTMLAudioElement เพียงครั้งเดียว
2. ต่อเข้า `AnalyserNode`
3. ต่อไป destination โดยไม่ซ้ำ path
4. อ่าน amplitude/frequency ผ่าน `requestAnimationFrame()`
5. expose state ผ่าน AudioProvider

ข้อควรระวังคือ media source เดิมสร้างซ้ำไม่ได้, ต้องจัดการเปลี่ยน source, และต้องไม่ต่อ output ซ้ำจนเกิดเสียงซ้อน สำหรับเวลาจำกัดควรใช้ state-based animation ก่อน

## 5. Feasibility of the Three Plus-One Features

### A. Sound Match

- Complexity: Low
- Engineering effort: Very Small ถึง Small
- Risk: Low
- Database changes: ไม่ต้องการ
- Modify: `src/components/SpotFeed.tsx`, `src/components/SpotCard.tsx`
- Create: `src/lib/soundMatch.ts`, อาจมี `src/components/SoundMatchSelector.tsx`
- Conflict risk: ต่ำถึงปานกลาง เพราะแตะ feed และ SpotCard

### B. Living Sound Card

- Complexity: Low สำหรับ state animation; Medium สำหรับ actual analyser
- Engineering effort: Very Small สำหรับ animation; Medium สำหรับ analyser
- Risk: Low สำหรับ animation; Medium สำหรับ analyser
- Database changes: ไม่ต้องการ
- Modify: `src/components/SpotCard.tsx`, อาจ `src/app/globals.css`; ถ้าทำ actual analysis ต้องแก้ `src/context/AudioContext.tsx`
- Create: ไม่จำเป็น; อาจแยก `src/components/PlayingVisualizer.tsx`
- Conflict risk: ปานกลางถึงสูง เพราะแตะ SpotCard และ AudioContext

### C. Focus Recipe

- Complexity: Low ถึง Medium
- Engineering effort: Small
- Risk: Medium
- Database changes: ไม่ต้องการ
- Modify: `src/context/AudioContext.tsx`, `src/components/SoundMixerModal.tsx`, อาจ `src/components/AudioPlayerBar.tsx`
- Create: `src/lib/soundPresets.ts`
- Conflict risk: สูง เพราะแตะ AudioContext และ Mixer

Spot Ambient ใน recipe ควรระวัง: current mixer ไม่มี Spot audio channel จริง จึงควรตีความ channel `ambient` เป็น generated atmospheric drone หรือปรับชื่อ UI ให้ตรงความจริง

## 6. Recommended Implementation Order

1. Focus Recipe
2. Living Sound Card แบบ state-based
3. Sound Match

Focus Recipe ใช้ audio state ที่มีอยู่และให้ demo impact สูงโดยไม่ต้องแก้ schema Living Sound Card แบบ state-based ใช้ `isPlaying` และ `activeTrack.id` ได้ทันทีโดยไม่เสี่ยงกับ Web Audio analysis ส่วน Sound Match ทำง่ายแต่คุณค่าจะจำกัดเพราะ facilities ยังไม่เป็น structured data

## 7. Proposed Component Architecture

```text
AudioProvider
├── activeTrack
├── isPlaying
├── mixerChannels
├── activeSoundPreset
├── playSpot()
├── togglePlay()
├── applySoundPreset()
└── optional analyser state

SpotCard
├── Play/Pause button
├── activeTrack.id comparison
├── Living Sound visualization
└── optional Sound Match badge

SpotFeed
├── existing search/filter
├── optional focus intention selector
└── render scored Spot cards

AudioPlayerBar
├── current Spot/track
├── play controls
├── master volume
├── mixer trigger
└── active recipe label

SoundMixerModal
├── existing channel sliders
├── existing preset tracks
└── Focus Recipe preset buttons
```

แนวทางนี้คง `AudioProvider` เป็น single source of truth และไม่สร้าง audio state ซ้ำใน SpotCard

## 8. Minimal File Change Plan

### CREATE

- `src/lib/soundPresets.ts`
- `src/lib/soundMatch.ts` (หากทำ Sound Match)
- `src/components/SoundMatchSelector.tsx` (เฉพาะกรณีแยก selector ออกจาก SpotFeed)

### MODIFY

- `src/context/AudioContext.tsx`
- `src/components/SoundMixerModal.tsx`
- `src/components/AudioPlayerBar.tsx`
- `src/components/SpotCard.tsx`
- `src/components/SpotFeed.tsx`
- `src/app/globals.css` เฉพาะกรณีเพิ่ม animation/style

### NO CHANGE

- `prisma/schema.prisma`
- Prisma migrations
- authentication implementation
- `src/actions/spot.ts`
- Spot API routes
- Docker configuration
- `src/app/layout.tsx`

## 9. Risks / Technical Debt

1. Spot audio กับ generated mixer audio อยู่คนละ audio graph ใน `src/context/AudioContext.tsx`
2. ไม่มี `AnalyserNode`; actual audio-reactive visualizer ต้องเพิ่ม media-element audio graph อย่างรอบคอบ
3. Facilities ไม่มีใน `prisma/schema.prisma`, `src/lib/validations/spot.ts` หรือ `src/components/SpotForm.tsx`
4. Zone ไม่มี field โดยตรง; `location` เป็น free-form string
5. Noise model เป็น 3 labels ไม่ตรง blueprint ที่ระบุ 1-5
6. Authorization policy ของ Server Action กับ API route ไม่ตรงกัน: `src/actions/spot.ts` อนุญาต admin override แต่ `src/app/api/spots/[id]/route.ts` ไม่ส่ง role ไป guard
7. `src/lib/auth.ts` ใช้ `JWT_SECRET` แต่ `.env.example` และ `docker-compose.yml` ระบุ `SESSION_SECRET`; production อาจ fallback ไปใช้ secret hard-coded
8. `.env.example` มี Neon URL placeholder; code บางส่วน fallback ได้ แต่ API routes อาจยังพยายามเชื่อม database
9. Search/filter ทำทั้ง server และ client ซึ่งทำให้ behavior ซ้ำกัน
10. `audio.play().catch(() => {})` กลืน autoplay/error feedback
11. Audio nodes/HTMLAudioElement ไม่มี explicit cleanup; ปัจจุบันรับได้เพราะ provider persistent แต่ต้องระวังเมื่อเพิ่ม analyser หรือ dynamic audio sources
12. `registerSchema` รองรับ `name` แต่ Prisma User ไม่มี `name`; `userService` map กลับเป็น username หรือเก็บได้เฉพาะ in-memory fallback

## 10. Final Recommendation

### สิ่งที่ผมแนะนำให้ทำต่อทันที

1. ทำ Focus Recipe โดยสร้าง `src/lib/soundPresets.ts` และเพิ่ม `activeSoundPreset` กับ `applySoundPreset` ใน `src/context/AudioContext.tsx` จากนั้นเชื่อมกับ `src/components/SoundMixerModal.tsx`
2. เพิ่ม Living Sound Card แบบ state-based ใน `src/components/SpotCard.tsx` โดยใช้ `isPlaying && activeTrack.id === spot.id` และยังไม่เพิ่ม `AnalyserNode`
3. ทำ Sound Match เป็น deterministic scoring utility ใน `src/lib/soundMatch.ts` พร้อม badge ใน `src/components/SpotCard.tsx` โดยอิง `noiseLevel`, `location`, title และ description ที่มีอยู่แล้ว

ยังไม่ควรเริ่มจาก Prisma migration เพราะ Plus-One features ทั้งหมดทำได้โดยไม่เปลี่ยน schema และการเปลี่ยน schema ตอนนี้เพิ่มความเสี่ยงต่อเวลาและ merge conflict โดยไม่จำเป็น
