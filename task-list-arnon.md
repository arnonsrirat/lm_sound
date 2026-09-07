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
