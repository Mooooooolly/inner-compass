import type { Metadata } from "next";
import { Noto_Serif_TC } from "next/font/google";
import "./globals.css";

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-serif-tc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inner Compass",
  description: "你的內在智慧羅盤",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSerifTC.variable} font-serif-tc antialiased bg-[#fdfcf8] text-stone-900`}>
        {children}
      </body>
    </html>
  );
}