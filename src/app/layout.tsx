import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { RouteLayoutProps } from "@/types/routes";
import "@styles/tailwind.css";
import styles from "@styles/app/globals.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barber Booking",
  description: "จองคิวร้านตัดผมออนไลน์",
};

export default function RootLayout({ children }: RouteLayoutProps) {
  return (
    <html lang="th" className={`${styles.root} ${geistSans.variable} ${geistMono.variable}`}>
      <body className={styles.body}>{children}</body>
    </html>
  );
}
