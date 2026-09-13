# Task List: Arnon (หลบมุม Sound - LhobMoom Sound)
โมดูลที่รับผิดชอบ: **Spot Core, Security, Feed UI & Docker Infrastructure**

---

### [x] 1. Docker & Infrastructure Setup
- [x] สร้าง `Dockerfile` แบบ Multi-stage build สำหรับ Next.js 14 App Router
- [x] สร้าง `docker-compose.yml` สำหรับรัน Container ของ Next.js และจัดการ Environment Variables
- [x] สร้าง `.dockerignore` เพื่อละเว้นไฟล์ที่ไม่จำเป็น เช่น `node_modules`, `.next`, `.git`
- [x] จัดเตรียม `.env.example` สำหรับการรันงานทั้งแบบ Local และ Docker

---

### [x] 2. Prisma Schema: โมเดล Spot
- [x] กำหนด Schema โมเดล `Spot` ใน `prisma/schema.prisma`
  - ฟิลด์ที่จำเป็น: `id`, `title`, `description`, `location`, `noiseLevel`, `imageUrl`, `audioUrl`, `authorId`, `createdAt`, `updatedAt`
- [x] เชื่อม Relation แบบ Many-to-One กับโมเดล `User` (`author User @relation(...)`)
- [x] รันคำสั่ง `npx prisma generate` เพื่อสร้าง Type และ Client

---

### [x] 3. API & Server Actions (Spot CRUD) พร้อม Zod Validation
- [x] สร้าง Zod Schema (`spotSchema`) สำหรับตรวจสอบความถูกต้องของข้อมูล (Title, Description, Noise Level, URLs ฯลฯ)
- [x] สร้าง Server Actions หรือ Route Handlers:
  - [x] **Create Spot:** เพิ่มจุดอ่านหนังสือใหม่ พร้อมบันทึก `authorId`
  - [x] **Read Spots (Feed):** ดึงรายการจุดอ่านหนังสือทั้งหมด รองรับการค้นหา (Search) และตัวกรอง (Filter)
  - [x] **Read Spot by ID:** ดึงข้อมูลรายละเอียดของจุดอ่านหนังสือรายตัว
  - [x] **Update Spot:** อัปเดตข้อมูลจุดอ่านหนังสือ
  - [x] **Delete Spot:** ลบจุดอ่านหนังสือออกจากระบบ

---

### [x] 4. Authorization Guard & Security
- [x] สร้าง Guard Function หรือ Helper สำหรับตรวจสอบสิทธิ์ผู้ใช้จาก Session
- [x] ป้องกันการ Update และ Delete: อนุญาตเฉพาะกรณีที่ `session.userId === spot.authorId`
- [x] ส่ง HTTP 403 Forbidden หรือโยน Error ชัดเจนเมื่อพยายามแก้ไข/ลบข้อมูลที่ตนเองไม่ได้เป็นเจ้าของ

---

### [x] 5. UI: Feed & Wireframe Implementation (Desktop & Mobile)
- [x] **SpotCard Component:** การ์ดแสดงข้อมูลจุดอ่านหนังสือ (รูปภาพ, ชื่อสถานที่, พิกัด, ระดับเสียงรบกวน, ปุ่มเล่นเสียงพรีวิว)
- [x] **Home Page Desktop (อ้างอิง Wireframe image_77e669.jpg):**
  - [x] Sidebar Navbar ทางซ้าย
  - [x] Top Header: Logo, Search Bar, Theme Toggle, Login Button
  - [x] Featured Sound Banner: แบนเนอร์แนะนำจุดอ่านหนังสือเด่น
  - [x] Popular / Feed Grid: รายการจุดอ่านหนังสือยอดนิยมแบบ Grid Layout
- [x] **Home Page Mobile (อ้างอิง Wireframe image_77e66e.png):**
  - [x] Mobile Top Header: Logo, Search, Profile Icon
  - [x] Featured Sound Banner & Feed Grid รายการจุดอ่านหนังสือ
  - [x] Bottom Navigation Bar
- [x] **Spot Form Pages:**
  - [x] หน้าเพิ่มจุดอ่านหนังสือใหม่ (Create Spot Form)
  - [x] หน้าแก้ไขจุดอ่านหนังสือ (Edit Spot Form) พร้อมแสดงผล Validation Errors

---

## Current Sprint

### In Progress

- [x] Modernize Framework & Dependencies
  - Owner: Arnon
  - Area: Shared / Infrastructure
  - Priority: Critical
  - Requirements:
    - Upgrade Next.js to at least 16.3.5 using a stable production release
    - Upgrade React and React DOM to compatible stable versions
    - Review directly related dependencies and compatibility
    - Update the npm lockfile consistently
    - Resolve lint errors introduced by the React 19.3 upgrade
    - Validate lint, type checking, Prisma generation, and production build
    - Preserve existing authentication, authorization, audio, Admin, and User behavior
  - Status: Completed
  - Result:
    - Next.js 16.3.5 and React/React DOM 19.3.0 are installed with a consistent npm lockfile.
    - React 19.3 lint errors were resolved without changing the audio/auth behavior.
    - ESLint, TypeScript, Prisma Client generation, and production compilation passed.
    - Build runtime emitted expected DATABASE_URL errors because this environment has no database credentials; the build still exited successfully.

---

## Next Sprint

### Needs Review

- [ ] Production Security & Database Readiness
  - Owner: Arnon
  - Area: Security / Infrastructure
  - Priority: Critical
  - Requirements:
    - Unify JWT session secret configuration and reject unsafe production fallbacks
    - Align ownership and admin authorization across Server Actions and API routes
    - Validate database environment configuration and production Docker wiring
    - Add a repeatable automated test foundation for auth, authorization, and Spot CRUD
  - Status: Needs Review
  - Result:
    - SESSION_SECRET is the canonical JWT secret with production length checks and no hard-coded production fallback.
    - Spot API ownership now supports the same admin override policy as Server Actions; read APIs share the existing fallback behavior.
    - Docker Compose now fails early when DATABASE_URL, DIRECT_URL, or SESSION_SECRET is missing.
    - Added `npm test`, database scripts, and five passing auth/validation tests.
    - TypeScript, lint, Prisma generation, and production build pass; live database verification remains pending real credentials.

- [x] Local Development Demo Login
  - Owner: Arnon
  - Area: Authentication / Development
  - Priority: High
  - Requirements:
    - Keep localhost login usable without a configured database
    - Ensure seeded in-memory demo credentials match their documented passwords
  - Status: Completed
  - Result:
    - Corrected demo and admin bcrypt hashes; localhost login verified with HTTP 200 for both accounts.

- [ ] Campus Map, Media Library & Spot UX Upgrade
  - Owner: Arnon (Admin / Shared integration; coordinate User UI with Ninja)
  - Area: Spot Core / Admin / Shared UX
  - Priority: Critical
  - Requirements:
    - Replace image and audio URL inputs with in-system media library pickers
    - Add Thaksin University Phatthalung campus-only map pinning and map display
    - Require authentication before opening the create-spot flow; remove add-spot CTA from home feed
    - Show campus map and existing spot pins on the home page without allowing navigation outside campus bounds
    - Replace noise display with a clear dashboard-style gauge
    - Allow Admin to analyze uploaded ambient audio and confirm or override the suggested noise level
    - Add reusable modal and toast notifications for these flows
    - Keep existing visual structure while improving button affordances and click states
  - Status: Needs Review
  - Result:
    - Added campus-bounded Leaflet map with pin selection and home-page spot map.
    - Added image/audio media-library picker flow and secure audio upload/serving support.
    - Added campus coordinate validation, create-page login redirect, dashboard-style noise gauge, and admin audio RMS analysis with manual level confirmation.
    - Removed home-page add CTA and filtered unauthenticated sidebar navigation; existing admin toast/modal flows remain in use.
    - TypeScript, lint, tests, and production build pass. Build logs still warn when DATABASE_URL is intentionally absent in local demo mode.
    - ปรับ AdminSidebar ให้ใช้โครงสร้าง dark sidebar แบบหน้าเว็บตัวอย่าง พร้อมเส้นแบ่งกลุ่มเมนูและเมนูหลังบ้านเท่านั้น
    - Sidebar หน้า Home ทั้งผู้ใช้ทั่วไปและผู้ใช้ที่ล็อกอินแล้วเอาเมนูเสียงแนะนำ/เสียงยอดนิยมออก และเพิ่มเมนูจัดการ Admin เมื่อเป็นผู้ดูแลระบบ
    - เชื่อมเมนู Admin ใน Sidebar ไปยังแท็บต่าง ๆ ของ `/admin` ผ่าน query string และตัดเมนู “จัดการระบบ” ที่ซ้ำซ้อนออก
    - Sidebar หน้า Home ถูกลดเหลือเมนู Home เพียงรายการเดียวตามแบบผู้ใช้ทั่วไป โดยย้ายเมนูจัดการไว้เฉพาะใน AdminSidebar ของ `/admin`
    - ปรับโลโก้ Admin ให้กลับ `/admin` ภายในหลังบ้าน และปุ่ม “ชมหน้าเว็บ” เปิดหน้า Home ผู้ใช้ในแท็บเดิมเพื่อใช้ตรวจสอบการแสดงผลได้ทันที
    - แก้ z-index ของ Media Picker ไม่ให้แผนที่ลอยทับ modal และจำกัด picker ให้เห็นเฉพาะ `general` สำหรับภาพหรือ `audio` สำหรับเสียง พร้อมปิดการแก้ไข URL ในฟอร์ม Admin
    - เพิ่มการย้ายไฟล์ในคลังสื่อด้วยเมนูสามจุดเลือกโฟลเดอร์ปลายทาง และรองรับการลากไฟล์ไปยังโฟลเดอร์อื่นเพื่อเปิดขั้นตอนย้าย
    - ขยายหน้า Themes เป็นตัวปรับแต่งสีทุกส่วนด้วย color picker, คำนวณชุดสี Light/Dark, บันทึก preset ตั้งชื่อพร้อม swatches และเรียกกลับมาแก้ไขได้
    - แยกตัวแก้ไขเป็นโหมดธีมสว่าง/ธีมมืด พร้อมคำนวณชุดสีอีกโหมดให้อัตโนมัติจากโหมดที่กำลังเลือก
    - แก้การลบ Spot ที่มาจาก fallback store ให้ Admin ลบได้จริงและไม่กลับมาแสดงซ้ำเมื่อฐานข้อมูลยังไม่พร้อม
    - ย้ายหน้า Admin มาแสดงที่ `/` สำหรับ Session ที่มี role `ADMIN`; เส้นทาง `/admin` เดิมเปลี่ยนเป็น redirect กลับ `/` และ Login ทุก role กลับเข้า `/` ตาม session
