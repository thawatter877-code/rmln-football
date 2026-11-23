import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "RMLN • ร่ายมนต์ลูกหนัง | The 90-Minute Football Magic",
  description: "วารสารและรายงานข่าวฟุตบอลระดับโลก บทวิเคราะห์แท็กติก ตลาดซื้อขายนักเตะ และคอมมูนิตี้",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-white text-[#2f3437] flex flex-col antialiased">
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
