import type { Metadata } from "next";
import { Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import Script from 'next/script';

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-serif-tc",
});

export const metadata: Metadata = {
  title: "Inner Compass - 你的內在羅盤",
  description: "一個讓你整理思緒、與內在智慧對話的數位空間。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body 
        className={`${notoSerifTC.variable} font-serif-tc antialiased bg-[#fdfcf8] text-stone-900`}
        suppressHydrationWarning // 👈 加上這一行，就能忽略外掛造成的錯誤
      >
        {children}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-3Z3VT21ETE`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3Z3VT21ETE');
            `,
          }}
        />
      </body>
    </html>
  );
}
