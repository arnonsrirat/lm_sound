<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# กติกาการทำงานร่วมกัน

## ภาษา
- สนทนากับผู้ใช้เป็น **ภาษาไทย** เสมอ (โค้ด, identifier, และข้อความ error ในไฟล์ให้คงตามต้นฉบับ)
- เก็บไฟล์นี้ไว้เป็นความจำระยะยาวของโปรเจกต์ — อ่านก่อนเริ่มงานทุกครั้ง

## ภาพรวมโปรเจกต์ (สรุปความเข้าใจ)
- **ชื่อ:** LMSound (หลบมุม Sound / LhobMoom Sound) — เว็บแอปแนะนำจุดอ่านหนังสือพร้อมเสียงบรรยากาศ
- **Stack:** Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS 4, Prisma + PostgreSQL, bcryptjs + jose (JWT session ใน HTTP-only cookie), Zod, Docker (multi-stage + docker-compose)
- **ฟีเจอร์หลัก:**
  - Spot CRUD (จุดอ่านหนังสือ) พร้อม Zod validation และ guard สิทธิ์เจ้าของ (แก้ไข/ลบได้เฉพาะ author → 403)
  - Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
  - Audio Engine แบบ Persistent Web Audio ผ่าน React Context (`src/context/AudioContext.tsx`) + Sound Mixer (Rain / White Noise / Ambient / Waves) + `AudioPlayerBar`
  - UI: Home feed (sidebar, header, featured banner, grid), Bottom nav บนมือถือ, ฟอร์มสร้าง/แก้ไข spot, หน้า login/register
- **โครงสร้างสำคัญ:**
  - `src/app/` — หน้าเว็บ + API routes (`/api/auth/*`, `/api/spots`)
  - `src/actions/spot.ts` — server actions
  - `src/components/` — SpotCard, SpotFeed, Header, Sidebar, AudioPlayerBar, SoundMixerModal ฯลฯ
  - `src/lib/` — prisma client, auth helpers, validation
  - `prisma/schema.prisma` — โมเดล `User` (email, username, password) → `Spot` (title, description, location, noiseLevel, imageUrl, audioUrl)
- **สภาพแวดล้อม:** ต้องมี `DATABASE_URL` และ `DIRECT_URL` ใน `.env` (ดูตัวอย่างที่ `.env.example`)
- **สถานะงาน:** งานใน `task-list-arnon.md` (Spot Core, Security, Feed UI, Docker) และ `task-list-ninja.md` (Auth, Audio Engine, Login UI) เสร็จหมดแล้ว ยังไม่มี automated tests
- **Git workflow:** แยกกิ่ง `main` (production, ห้าม push ตรง), `anon` (หัวหน้าทีม), `Ninja` (สมาชิก) — ดูรายละเอียดใน README.md
