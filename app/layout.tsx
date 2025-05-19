import type { Metadata } from "next";
import "./globals.css";

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
      </body>
    </html>
  );
}
