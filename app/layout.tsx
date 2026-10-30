import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C-Yatra — Complete Travel Booking Portal Launcher",
  description: "Private internal booking portal launcher for C-Yatra travel business.",
  icons: {
    icon: "/images/c-yatra-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
