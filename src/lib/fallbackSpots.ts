export interface SpotItem {
  id: string;
  title: string;
  description: string;
  location: string;
  noiseLevel: string;
  imageUrl: string;
  audioUrl: string;
  authorId: string;
  author?: {
    id: string;
    username: string;
  } | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const FALLBACK_SPOTS: SpotItem[] = [
  {
    id: "spot-lib-4",
    title: "หอสมุดกลาง ชั้น 4 โซน Silent Study",
    description: "มุมกระจกหลังสุดของชั้น 4 บรรยากาศเงียบสงัด มีแสงแดดธรรมชาติส่องถึง มีปลั๊กไฟทุกโต๊ะ เหมาะสำหรับอ่านเตรียมสอบที่ต้องใช้สมาธิขั้นสูงสุด",
    location: "อาคารหอสมุดกลาง ชั้น 4 โซน C",
    noiseLevel: "quiet",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    authorId: "demo-user-1",
    author: { id: "demo-user-1", username: "arnon_sound" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "spot-forest-garden",
    title: "สวนป่าใต้ร่มจามจุรี ข้างตึกศิลป์",
    description: "โต๊ะหินอ่อนใต้ร่มไม้ใหญ่ ลมพัดเย็นสบายตลอดบ่าย มีเสียงนกร้องเบาๆ เหมาะสำหรับการอ่านชีทสรุปหรือคิดงานสร้างสรรค์",
    location: "ลานกิจกรรมข้างคณะสถาปัตย์และศิลปกรรม",
    noiseLevel: "quiet",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/forest_wind.ogg",
    authorId: "demo-user-1",
    author: { id: "demo-user-1", username: "arnon_sound" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "spot-coworking-7",
    title: "Co-Working Space หอพักนักศึกษา อาคาร 7",
    description: "พื้นที่อ่านหนังสือ 24 ชม. ติดแอร์เย็นฉ่ำ มีเสียงพิมพ์คีย์บอร์ดและเสียงคนคุยกันเบาๆ สร้างบรรยากาศกระตุ้นความตื่นตัวได้ดี",
    location: "หอพักในกำกับ อาคาร 7 ชั้น 1",
    noiseLevel: "moderate",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/office_room.ogg",
    authorId: "demo-user-2",
    author: { id: "demo-user-2", username: "ninja_audio" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "spot-rooftop-5",
    title: "ดาดฟ้าอาคารเรียนรวม 5 มุมชมวิวแม่น้ำ",
    description: "มุมลับบนบันไดหนีไฟเชื่อมขึ้นดาดฟ้า ลมโกรกตลอดวัน เห็นวิวพระอาทิตย์ตกสวยมากช่วง 5 โมงเย็น สงบและผ่อนคลาย",
    location: "อาคารเรียนรวม 5 ชั้นดาดฟ้า (ข้างห้องลิฟต์)",
    noiseLevel: "quiet",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/weather/wind_breeze.ogg",
    authorId: "demo-user-1",
    author: { id: "demo-user-1", username: "arnon_sound" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "spot-cafe-greenhouse",
    title: "คาเฟ่เรือนกระจก ใต้ถุนอาคารวิศวะ",
    description: "จุดนั่งสำหรับคนที่ชอบเสียง White Noise หรือบรรยากาศคึกคัก มีกลิ่นกาแฟหอมฟุ้งและเสียงเครื่องชงกาแฟเป็นแบ็คกราวด์",
    location: "อาคารวิศวกรรม 100 ปี ชั้นล่าง",
    noiseLevel: "lively",
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    authorId: "demo-user-2",
    author: { id: "demo-user-2", username: "ninja_audio" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function filterFallbackSpots(search?: string, noiseLevel?: string): SpotItem[] {
  let result = [...FALLBACK_SPOTS];
  if (noiseLevel && noiseLevel !== "all") {
    result = result.filter((s) => s.noiseLevel === noiseLevel);
  }
  if (search && search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
    );
  }
  return result;
}
