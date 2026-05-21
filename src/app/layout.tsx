import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Маруссия | Учет заявок",
  description: "CRM для учета заявок Клуба Путешествий Маруссия",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '15px', 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)', 
          zIndex: 100, 
          pointerEvents: 'none', 
          opacity: 0.7 
        }}>
          создано 521технолОджи
        </div>
      </body>
    </html>
  );
}
