import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "RMLN - ร่ายมนต์ลูกหนัง | THE 90-MINUTE FOOTBALL MAGIC",
  description: "สำนักข่าวและมีเดียฟุตบอลระดับโลก เกาะติดทุกมนต์สะกด 90 นาทีในสนาม ตลาดซื้อขายนักเตะ และบทวิเคราะห์แท็กติกเชิงลึก",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
