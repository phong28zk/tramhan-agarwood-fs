import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Header } from "../components/layout/Header"
import { Footer } from "../components/layout/Footer"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Trầm Hân Agarwood - Tinh hoa phong thủy Việt Nam",
  description:
    "Chuyên cung cấp trầm hương, vòng tay phong thủy, tượng phong thủy chất lượng cao. Mang lại bình an và thịnh vượng cho gia đình bạn.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
          <main>{children}</main>
          <Footer />
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
