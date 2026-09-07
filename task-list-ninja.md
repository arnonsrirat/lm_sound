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
