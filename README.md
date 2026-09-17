# LMSound

LMSound หรือ LhobMoom Sound คือเว็บแอปพลิเคชันสำหรับค้นหาและแนะนำสถานที่อ่านหนังสือ พร้อมเสียงบรรยากาศสำหรับช่วยเพิ่มสมาธิและความผ่อนคลาย

ระบบรองรับการค้นหาสถานที่ผ่านแผนที่ การแสดงระดับเสียง สิ่งอำนวยความสะดวก เพลงผ่อนคลาย ระบบสมาชิก ระบบผู้ดูแลระบบ และการจัดการไฟล์สื่อผ่าน Cloud Storage

## ข้อมูลโครงงาน

- ชื่อโครงงาน: LMSound
- ประเภท: Web Application
- รายวิชา: 0214321 Web Application Design and Development
- Repository: https://github.com/arnonsrirat/lm_sound
- Production URL: https://lmsound.arnoncore.com

## ฟีเจอร์หลัก

### สำหรับผู้ใช้งาน

- ดูสถานที่อ่านหนังสือแนะนำ
- ดูสถานที่ผ่าน Interactive Map
- แสดงหมุดสถานที่ทั้งหมดบนแผนที่
- แสดงรายละเอียดสถานที่ รูปภาพ ระดับเสียง และระยะทาง
- แสดงสิ่งอำนวยความสะดวก เช่น ปลั๊กไฟ Wi-Fi แสงสว่าง เครื่องปรับอากาศ พัดลม ห้องน้ำ และที่จอดรถ
- ระบบค้นหาและกรองสถานที่
- ระบบกดถูกใจสถานที่
- ระบบแนะนำสถานที่ตามช่วงเวลา
- ระบบเล่นเสียงบรรยากาศ
- Sound Mixer สำหรับผสมเสียง Rain, White Noise, Ambient, Waves และ Thunder
- คลังเพลงผ่อนคลาย
- ระบบเล่นเพลงและสร้างเพลย์ลิสต์
- ระบบให้คะแนนเพลง
- ระบบบัญชีผู้ใช้และแก้ไขโปรไฟล์
- ระบบสมัครสมาชิกและยืนยันอีเมล
- ระบบลืมรหัสผ่านและรีเซ็ตรหัสผ่านผ่านอีเมล
- Login ด้วย Google OAuth
- รองรับการใช้งานบนโทรศัพท์มือถือ
- รองรับการติดตั้งเป็น Progressive Web App
- รองรับธีมสว่างและธีมมืด
- ใช้ Toast และ Modal Notification แทน `window.alert`

### สำหรับผู้ดูแลระบบ

- จัดการสถานที่อ่านหนังสือ เพิ่ม แก้ไข และลบสถานที่
- ปักหมุดสถานที่ผ่านแผนที่ และดูหมุดอื่นระหว่างแก้ไขข้อมูล
- จัดการรูปภาพ Banner และ Logo
- จัดการคลังภาพ ไฟล์เสียง และเพลง
- จัดการคลังเพลงผ่อนคลาย Playlist และ Album
- เลือกเพลงที่ต้องการเผยแพร่หรือซ่อน
- จัดการข้อมูลผู้ใช้งานและเปลี่ยนสิทธิ์ USER หรือ ADMIN
- ตั้งค่าธีม สี โลโก้ และ Banner
- ตั้งค่าธีมเทศกาลตามวันที่และช่วงเวลา
- เชื่อมต่อ Google Drive และตรวจสอบพื้นที่จัดเก็บ
- รองรับ Cloudflare R2 สำหรับเก็บไฟล์สื่อ
- แสดงสถานะการอัปโหลดและเปอร์เซ็นต์ความคืบหน้า
- รองรับ Resumable Upload สำหรับไฟล์ขนาดใหญ่

## เทคโนโลยีที่ใช้

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- React Leaflet และ Leaflet
- Lucide React

### Backend

- Next.js App Router
- Next.js API Routes
- Server Actions
- Prisma ORM
- PostgreSQL
- Zod
- bcryptjs
- jose JWT

### บริการภายนอกและการ Deploy

- Cloudflare R2
- Google Drive API
- Google OAuth
- Resend Email API
- Docker
- VPS

## สถาปัตยกรรมระบบ

```text
Client / Browser
       |
       v
Next.js App Router
       |
       +-- React Components
       +-- Server Actions
       +-- API Routes
       +-- Authentication
       |
       v
Prisma ORM
       |
       v
PostgreSQL
```

สำหรับไฟล์สื่อ ระบบใช้ Direct Upload เพื่อลดภาระของ Application Server

```text
Browser
   |
   | ขอสิทธิ์อัปโหลด
   v
Next.js API
   |
   | สร้าง Presigned URL
   v
Browser
   |
   | Upload โดยตรง
   v
Cloudflare R2
   |
   | แจ้งการอัปโหลดสำเร็จ
   v
Next.js API
   |
   v
Prisma + PostgreSQL
```

ฐานข้อมูลเก็บเฉพาะ Metadata ของไฟล์ เช่น ชื่อไฟล์ ประเภทไฟล์ ขนาด File Key URL เจ้าของไฟล์ และวันที่อัปโหลด ส่วนข้อมูล Binary จะจัดเก็บไว้ใน Cloud Storage

## โครงสร้างโฟลเดอร์สำคัญ

```text
src/
├── actions/
│   ├── admin.ts
│   ├── engagement.ts
│   └── spot.ts
├── app/
│   ├── api/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── relaxation/
│   │   ├── spots/
│   │   └── uploads/
│   ├── admin/
│   ├── forgot-password/
│   ├── login/
│   ├── profile/
│   ├── register/
│   └── relaxation/
├── components/
│   ├── admin/
│   ├── AudioPlayerBar.tsx
│   ├── BottomNav.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── SpotCard.tsx
│   ├── SpotFeed.tsx
│   └── SoundMixerModal.tsx
├── context/
│   └── AudioContext.tsx
└── lib/
    ├── auth.ts
    ├── prisma.ts
    ├── r2/
    ├── user-service.ts
    ├── validation.ts
    └── validations/
```

## API ที่สำคัญ

### Authentication

| Method | Path | รายละเอียด |
| --- | --- | --- |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/logout` | ออกจากระบบ |
| GET | `/api/auth/me` | ตรวจสอบ Session ปัจจุบัน |
| GET | `/api/auth/google` | เริ่มต้น Google Login |
| GET | `/api/auth/google/callback` | Google OAuth Callback |
| POST | `/api/auth/verify-email` | ยืนยันอีเมล |
| POST | `/api/auth/password-reset` | ขอรหัสและรีเซ็ตรหัสผ่าน |

### สถานที่

| Method | Path | รายละเอียด |
| --- | --- | --- |
| GET | `/api/spots` | ดึงรายการสถานที่ |
| POST | `/api/spots` | เพิ่มสถานที่ |
| GET | `/api/spots/:id` | ดูรายละเอียดสถานที่ |
| PUT | `/api/spots/:id` | แก้ไขสถานที่ |
| DELETE | `/api/spots/:id` | ลบสถานที่ |
| POST | `/api/spots/:id/engagement` | กดถูกใจหรือจัดการ Engagement |

### Upload

| Method | Path | รายละเอียด |
| --- | --- | --- |
| POST | `/api/uploads/presign` | ขอ Presigned Upload URL |
| POST | `/api/uploads/complete` | ยืนยันการอัปโหลดสำเร็จ |
| GET | `/api/uploads/status` | ตรวจสอบสถานะการอัปโหลด |
| GET | `/api/uploads/:key` | ดึงไฟล์จาก Storage |

### Admin

| Method | Path | รายละเอียด |
| --- | --- | --- |
| GET | `/api/admin/media` | ดึงรายการไฟล์ในคลัง |
| POST | `/api/admin/media` | อัปโหลดไฟล์ |
| PATCH | `/api/admin/media` | แก้ไข Metadata หรือสถานะเผยแพร่ |
| DELETE | `/api/admin/media/:fileId` | ลบไฟล์ |
| GET | `/api/admin/google-drive/status` | ตรวจสอบสถานะ Google Drive |
| GET | `/api/admin/relaxation` | ดึงข้อมูลเพลงผ่อนคลาย |
| POST | `/api/admin/relaxation` | สร้าง Playlist |
| PATCH | `/api/admin/relaxation` | แก้ไขสถานะเพลง |
| DELETE | `/api/admin/relaxation` | ลบ Playlist |

## การตรวจสอบสิทธิ์

- ผู้ใช้ทั่วไปสามารถดูข้อมูลสถานที่และเพลงที่เผยแพร่แล้ว
- ผู้ใช้ที่ Login แล้วจึงสามารถฟังเพลงผ่อนคลายได้
- เจ้าของสถานที่สามารถแก้ไขหรือลบข้อมูลของตนเอง
- ADMIN สามารถจัดการสถานที่ของผู้ใช้ทุกคนได้
- ADMIN สามารถจัดการผู้ใช้ ไฟล์สื่อ เพลง Playlist และ Site Settings
- API ตรวจสอบ Session ผ่าน HTTP-only Cookie
- ไม่เชื่อถือ `userId` ที่ส่งมาจาก Client โดยตรง
- ทุกการแก้ไขหรือลบข้อมูลจะตรวจสอบสิทธิ์ก่อนดำเนินการ

## ความต้องการของระบบ

- Node.js 20 ขึ้นไป
- npm
- PostgreSQL
- Git
- Docker หรือ Docker Desktop ถ้าต้องการรันด้วย Docker
- บัญชี Cloudflare R2 สำหรับเก็บไฟล์
- บัญชี Google Cloud สำหรับ OAuth และ Google Drive
- บัญชี Resend สำหรับส่งอีเมล

## การติดตั้งบนเครื่อง Local

### 1. Clone Repository

```bash
git clone https://github.com/arnonsrirat/lm_sound.git
cd lm_sound
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. สร้างไฟล์ Environment

บน macOS หรือ Linux

```bash
cp .env.example .env
```

บน Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### 4. ตั้งค่า Environment Variables

ตัวอย่างไฟล์ `.env`

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB_NAME?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@DIRECT_HOST/DB_NAME?sslmode=require"

SESSION_SECRET="ใส่ค่าสุ่มที่มีความยาวอย่างน้อย 32 ตัวอักษร"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

GOOGLE_DRIVE_CLIENT_ID=""
GOOGLE_DRIVE_CLIENT_SECRET=""
GOOGLE_DRIVE_REDIRECT_URI="http://localhost:3000/api/admin/google-drive/callback"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

RESEND_API_KEY=""
RESEND_FROM_EMAIL="LMSound <no-reply@your-domain.com>"

R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""
```

ห้ามนำค่า Secret ขึ้น GitHub โดยเฉพาะ `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY` และ `R2_SECRET_ACCESS_KEY`

### 5. สร้าง Prisma Client

```bash
npm run db:generate
```

### 6. อัปเดตฐานข้อมูล

สำหรับฐานข้อมูลที่มี Migration แล้ว

```bash
npm run db:deploy
```

หากต้องการสร้าง Migration ใหม่ในระหว่างพัฒนา

```bash
npx prisma migrate dev
```

### 7. เริ่มระบบในโหมด Development

```bash
npm run dev
```

เปิดเว็บไซต์ที่ `http://localhost:3000`

## บัญชีทดสอบ Localhost

### ผู้ใช้ทั่วไป

```text
Email: demo@lmsound.com
Username: demouser
Password: password123
```

### ผู้ดูแลระบบ

```text
Email: admin@lmsound.com
Username: admin
Password: admin1234
```

บัญชีเหล่านี้ใช้สำหรับโหมด Development หรือ Fallback ใน Localhost เท่านั้น ใน Production ควรใช้บัญชีที่สร้างในฐานข้อมูลจริง และควรเปลี่ยนรหัสผ่านก่อนใช้งานจริง

## คำสั่งที่ใช้บ่อย

```bash
# เริ่ม Development Server
npm run dev

# Build Production
npm run build

# เริ่ม Production Server
npm run start

# ตรวจสอบ Lint
npm run lint

# รัน Test
npm run test

# สร้าง Prisma Client
npm run db:generate

# Deploy Database Migration
npm run db:deploy
```

## การรันด้วย Docker

สร้างไฟล์ `.env` ให้เรียบร้อยก่อน จากนั้นใช้คำสั่ง

```bash
docker compose up -d --build
```

ตรวจสอบ Container

```bash
docker compose ps
```

ดู Log

```bash
docker compose logs -f app
```

หยุดระบบ

```bash
docker compose down
```

เว็บไซต์จะเปิดที่ `http://localhost:3000`

## Cloudflare R2

Cloudflare R2 ใช้สำหรับจัดเก็บรูปภาพ รูปโปรไฟล์ รูป Banner รูป Logo เพลง เสียงบรรยากาศ เอกสาร และไฟล์ที่ผู้ใช้อัปโหลด

ตัวอย่าง File Key

```text
users/42/images/f78c28a1.webp
users/42/audio/8d82b6c1.mp3
users/42/music/a92c44e2.mp3
```

ระบบจะไม่เก็บ Binary ของไฟล์ไว้ในฐานข้อมูลโดยตรง แต่จะเก็บเฉพาะ Metadata ของไฟล์ใน PostgreSQL

```text
เลือกไฟล์บน Browser
        |
        v
บีบอัดหรือปรับขนาดไฟล์
        |
        v
ขอ Presigned URL จาก Server
        |
        v
Upload โดยตรงไป Cloudflare R2
        |
        v
แจ้ง Server ว่า Upload สำเร็จ
        |
        v
บันทึก Metadata ด้วย Prisma
```

## Google Login

สร้าง OAuth Client ใน Google Cloud Console และตั้งค่า Redirect URI ดังนี้

สำหรับ Localhost

```text
http://localhost:3000/api/auth/google/callback
```

สำหรับ Production

```text
https://lmsound.arnoncore.com/api/auth/google/callback
```

จากนั้นใส่ค่าลงใน `.env`

```env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""
```

## Google Drive

Google Drive ใช้สำหรับเชื่อมต่อคลังสื่อของผู้ดูแลระบบ

Redirect URI สำหรับ Localhost

```text
http://localhost:3000/api/admin/google-drive/callback
```

Redirect URI สำหรับ Production

```text
https://lmsound.arnoncore.com/api/admin/google-drive/callback
```

ตั้งค่า Environment Variables

```env
GOOGLE_DRIVE_CLIENT_ID=""
GOOGLE_DRIVE_CLIENT_SECRET=""
GOOGLE_DRIVE_REDIRECT_URI=""
```

หลังจาก Login ด้วยบัญชี ADMIN แล้ว สามารถเชื่อมต่อ Google Drive ได้จากหน้า Admin

## Resend Email

Resend ใช้สำหรับส่งอีเมลยืนยันบัญชี รหัสยืนยันการรีเซ็ตรหัสผ่าน และอีเมลระบบอื่น ๆ

```env
RESEND_API_KEY=""
RESEND_FROM_EMAIL="LMSound <no-reply@your-domain.com>"
```

โดเมนที่ใช้ส่งอีเมลต้องผ่านการยืนยันใน Resend ก่อน

## การ Deploy Production

ระบบ Production ใช้ Docker และ VPS

```bash
# Build Image
docker build -t lmsound .

# รัน Container
docker compose up -d --build

# ตรวจสอบสถานะ
docker compose ps

# ตรวจสอบ Log
docker compose logs -f app
```

ควรตั้งค่า Environment Variables ของ Production ให้ครบก่อน Deploy โดยเฉพาะ `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` และ `R2_PUBLIC_URL`

## Git Workflow

ทีมใช้ Branch แยกตามหน้าที่

- `main` ใช้สำหรับ Production
- `anon` ใช้สำหรับงานของหัวหน้าทีม
- `Ninja` ใช้สำหรับงานของสมาชิกทีม

### การทำงานบน Branch ของตนเอง

```bash
git checkout anon
git pull origin main

# แก้ไขโค้ดและทดสอบ

git add .
git commit -m "อธิบายสิ่งที่แก้ไข"
git push origin anon
```

### การ Merge เข้า Main

```bash
git checkout main
git pull origin main
git merge anon
git push origin main
```

ก่อน Merge ควรตรวจสอบ

```bash
npm run lint
npm run test
npm run build
```

## การทดสอบระบบ

- สมัครสมาชิกด้วยข้อมูลที่ถูกต้องและตรวจสอบอีเมลซ้ำ
- Login ด้วย Email หรือ Username
- Login ด้วย Google
- Logout และตรวจสอบการล้าง Session
- ลืมรหัสผ่านและยืนยันรหัสทางอีเมล
- ตรวจสอบสิทธิ์ USER และ ADMIN
- ป้องกันผู้ใช้แก้ไขข้อมูลของผู้อื่น
- เพิ่ม แก้ไข และลบสถานที่
- แสดงสถานที่ทั้งหมดบนแผนที่
- กดถูกใจและแสดง Notification
- อัปโหลดรูปภาพและไฟล์เสียงขนาดใหญ่
- ตรวจสอบสถานะ Upload และ Retry
- เล่นเสียงบรรยากาศและเปิด Sound Mixer
- เปิดเพลงผ่อนคลายและสร้าง Playlist
- เปิดหรือซ่อนเพลงจากฝั่ง Admin
- เปลี่ยนธีมสว่างและธีมมืด
- ตรวจสอบการแสดงผลบนโทรศัพท์มือถือ
- ทดสอบการติดตั้ง Progressive Web App

## Security

- เข้ารหัสรหัสผ่านด้วย bcryptjs
- ไม่เก็บรหัสผ่านแบบ Plain Text
- ใช้ HTTP-only Cookie สำหรับ Session
- ใช้ JWT สำหรับตรวจสอบ Session
- ตรวจสอบข้อมูลด้วย Zod
- ใช้ Prisma ในการเข้าถึงฐานข้อมูล
- ตรวจสอบสิทธิ์ก่อนแก้ไขหรือลบข้อมูล
- ป้องกันการเข้าถึงหน้า Admin สำหรับผู้ใช้ทั่วไป
- ตรวจสอบชนิดและขนาดไฟล์ก่อน Upload
- สร้าง File Key จาก Server
- ไม่เปิดเผย R2 Secret Key ให้ Client
- ไม่ใช้ `NEXT_PUBLIC_` กับ Secret Key
- ป้องกันการใช้ชื่อไฟล์จากผู้ใช้เป็น Path โดยตรง
- ใช้ Toast หรือ Modal แทน `window.alert`

## ปัญหาที่พบและแนวทางแก้ไข

### การอัปโหลดไฟล์ขนาดใหญ่

- บีบอัดรูปภาพก่อน Upload
- ใช้ Direct Upload ไป Cloud Storage
- ใช้ Queue และแสดงสถานะรายไฟล์
- รองรับ Retry และ Resumable Upload
- จำกัดจำนวนไฟล์ที่ Upload พร้อมกัน

### การแสดงแผนที่

- ใช้ `invalidateSize()` เมื่อเปิด Modal
- ตรวจสอบขอบเขตพิกัด
- แสดงหมุดทั้งหมดพร้อมกัน
- ใช้สี Highlight สำหรับหมุดที่ถูกเลือก
- แยกการเลือกหมุดกับการแสดงรายละเอียด
- รองรับการปักหมุดด้วย Double Click ใน Admin

### การทำงานบนมือถือ

- ใช้ Responsive Layout
- ใช้ Lazy Loading
- ลดขนาดภาพก่อนแสดงผล
- ซ่อนหรือปรับตำแหน่ง Audio Player เมื่อเปิด Modal
- ปรับ Bottom Navigation ให้เหมาะกับมือถือ
- ใช้ Skeleton และ Loading State

## การพัฒนาต่อในอนาคต

- เพิ่ม Automated End-to-End Testing
- เพิ่ม Monitoring และ Error Tracking
- เพิ่ม Image CDN และ Automatic Image Transformation
- เพิ่ม Multipart Upload สำหรับไฟล์ขนาดใหญ่มาก
- เพิ่ม Offline Cache
- เพิ่มระบบ Push Notification
- เพิ่มระบบจัดอันดับสถานที่ตามพฤติกรรมผู้ใช้
- เพิ่มการค้นหาด้วยตำแหน่งปัจจุบัน
- เพิ่มระบบแนะนำเสียงตามสถานที่และช่วงเวลา
- เพิ่มระบบจัดการ Profile และ Email แบบยืนยันครบวงจร
- เพิ่มระบบสำรองข้อมูลอัตโนมัติ
- เพิ่มระบบ Audit Log สำหรับผู้ดูแลระบบ

## ผู้พัฒนา

LMSound Project Team

Repository: https://github.com/arnonsrirat/lm_sound

Production: https://lmsound.arnoncore.com
