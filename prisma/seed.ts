import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 เริ่มต้นการ Seed ข้อมูล หลบมุม Sound...");

  // 1. สร้างผู้ใช้ตัวอย่าง (เพื่อทดสอบ Relation และ Authorization Guard)
  const user1 = await prisma.user.upsert({
    where: { email: "arnon@lmsound.ac.th" },
    update: {},
    create: {
      email: "arnon@lmsound.ac.th",
      username: "arnon_sound",
      // default demo password
      password: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890dummyhash",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "ninja@lmsound.ac.th" },
    update: {},
    create: {
      email: "ninja@lmsound.ac.th",
      username: "ninja_audio",
      password: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890dummyhash",
    },
  });

  // 2. ข้อมูลจุดอ่านหนังสือจำลองในมหาวิทยาลัย
  const sampleSpots = [
    {
      title: "หอสมุดกลาง ชั้น 4 โซน Silent Study",
      description: "มุมกระจกหลังสุดของชั้น 4 บรรยากาศเงียบสงัด มีแสงแดดธรรมชาติส่องถึง มีปลั๊กไฟทุกโต๊ะ เหมาะสำหรับอ่านเตรียมสอบที่ต้องใช้สมาธิขั้นสูงสุด",
      location: "อาคารหอสมุดกลาง ชั้น 4 โซน C",
      noiseLevel: "quiet",
      imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
      audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
      authorId: user1.id,
    },
    {
      title: "สวนป่าใต้ร่มจามจุรี ข้างตึกศิลป์",
      description: "โต๊ะหินอ่อนใต้ร่มไม้ใหญ่ ลมพัดเย็นสบายตลอดบ่าย มีเสียงนกร้องเบาๆ เหมาะสำหรับการอ่านชีทสรุปหรือคิดงานสร้างสรรค์",
      location: "ลานกิจกรรมข้างคณะสถาปัตย์และศิลปกรรม",
      noiseLevel: "quiet",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      audioUrl: "https://actions.google.com/sounds/v1/ambiences/forest_wind.ogg",
      authorId: user1.id,
    },
    {
      title: "Co-Working Space หอพักนักศึกษา อาคาร 7",
      description: "พื้นที่อ่านหนังสือ 24 ชม. ติดแอร์เย็นฉ่ำ มีเสียงพิมพ์คีย์บอร์ดและเสียงคนคุยกันเบาๆ สร้างบรรยากาศกระตุ้นความตื่นตัวได้ดี",
      location: "หอพักในกำกับ อาคาร 7 ชั้น 1",
      noiseLevel: "moderate",
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      audioUrl: "https://actions.google.com/sounds/v1/ambiences/office_room.ogg",
      authorId: user2.id,
    },
    {
      title: "ดาดฟ้าอาคารเรียนรวม 5 มุมชมวิวแม่น้ำ",
      description: "มุมลับบนบันไดหนีไฟเชื่อมขึ้นดาดฟ้า ลมโกรกตลอดวัน เห็นวิวพระอาทิตย์ตกสวยมากช่วง 5 โมงเย็น สงบและผ่อนคลาย",
      location: "อาคารเรียนรวม 5 ชั้นดาดฟ้า (ข้างห้องลิฟต์)",
      noiseLevel: "quiet",
      imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
      audioUrl: "https://actions.google.com/sounds/v1/weather/wind_breeze.ogg",
      authorId: user1.id,
    },
    {
      title: "คาเฟ่เรือนกระจก ใต้ถุนอาคารวิศวะ",
      description: "จุดนั่งสำหรับคนที่ชอบเสียง White Noise หรือบรรยากาศคึกคัก มีกลิ่นกาแฟหอมฟุ้งและเสียงเครื่องชงกาแฟเป็นแบ็คกราวด์",
      location: "อาคารวิศวกรรม 100 ปี ชั้นล่าง",
      noiseLevel: "lively",
      imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
      audioUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
      authorId: user2.id,
    },
  ];

  for (const spot of sampleSpots) {
    await prisma.spot.create({
      data: spot,
    });
  }

  console.log(`✅ Seed สำเร็จ: สร้าง ${sampleSpots.length} จุดอ่านหนังสือเรียบร้อย!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
