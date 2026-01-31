import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Invoice App - CV Zen`cool',
  description: 'Free and simple invoice generator. Create, manage, and print professional invoices with ease.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: 'https://res.cloudinary.com/dr5pehdsw/image/upload/v1769835633/Fav-icon_zbpuco.jpg',
        type: 'image/jpeg',
      },
    ],
    apple: 'https://res.cloudinary.com/dr5pehdsw/image/upload/v1769835633/Fav-icon_zbpuco.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
