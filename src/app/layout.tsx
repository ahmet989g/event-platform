import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { UserProvider } from "@/contexts/UserContext";
import { ToastProvider } from "@/components/providers/ToastProvider";
import ReduxProvider from "@/store/ReduxProvider";

const roboto = Roboto({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventPlatform - Etkinlik Biletleme Platformu (Test Amaçlıdır!)",
  description: "Türkiye'nin en kapsamlı etkinlik biletleme platformu (Test Amaçlıdır!).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        <UserProvider>
          <ThemeProvider>
            <ReduxProvider>
              <ToastProvider />
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </ReduxProvider>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}
