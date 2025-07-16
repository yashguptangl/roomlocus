import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Analytics from "../components/Analytics"; 

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Roomlocus - India's Largest Room Collection",
  description:
    "RoomLocus is your one-stop platform to find Verified & Non-verified PGs, Flats, Rooms, and Hourly Rooms rental spaces. Tenants can easily search by city, townSector. Property owners can list their flats or rooms with images, while agents earn by verifying listings and earning commissions.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
