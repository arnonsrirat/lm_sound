/**
 * ใช้ภาพ thumbnail สำหรับการแสดงผลในรายการ/การ์ด โดยไม่เปลี่ยน URL ต้นฉบับ
 * ที่ถูกบันทึกไว้ในฐานข้อมูลหรือใช้สำหรับเปิดดูภาพเต็ม
 */
export function getOptimizedImageUrl(url: string | null | undefined): string {
  if (!url || !url.startsWith("/api/admin/media/")) return url || "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}variant=thumb`;
}
