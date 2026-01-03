import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "File Sharing",
  description: "Seamless File Sharing",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <head><link rel="icon" href="/favicon.png" sizes="any"/></head>
      <body className="bg-background w-[100vw] h-[100vh]">
        {children}
        <Toaster position="top-center"/>
      </body>
    </html>
  );
}
