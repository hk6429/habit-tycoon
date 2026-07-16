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
  title: "習慣養成工廠 · 七個習慣國中生養成遊戲",
  description: "用一學年 40 週，依柯維七個習慣養成一個八年級孩子的成功品格",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://visitor-badge.laobi.icu/badge?page_id=hk6429.habit-tycoon"
          alt="訪客人數"
          loading="lazy"
          style={{
            position: "fixed",
            right: 14,
            bottom: 14,
            zIndex: 2147483000,
            borderRadius: 999,
            boxShadow: "0 2px 10px rgba(0,0,0,.35)",
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.goatcounter={path:function(p){return location.host+p}}",
          }}
        />
        <script
          data-goatcounter="https://hk6429.goatcounter.com/count"
          async
          src="https://gc.zgo.at/count.js"
        />
      </body>
    </html>
  );
}
