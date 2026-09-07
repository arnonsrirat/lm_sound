import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "หลบมุม Sound (LhobMoom Sound) - จุดอ่านหนังสือลับ & เสียงบรรยากาศจริง",
  description: "ค้นหาจุดอ่านหนังสือลับๆ ในมหาวิทยาลัย พร้อมฟังเสียงบรรยากาศจริงก่อนไปนั่งจริง",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
