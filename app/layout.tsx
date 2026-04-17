import type { Metadata } from "next";
import { MedievalSharp, Lora } from "next/font/google";
import "./globals.css";

const medievalSharp = MedievalSharp({
  weight: "400",
  variable: "--font-medieval-sharp",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mythic Sheet",
  description: "Mythic Bastionland character sheet manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${medievalSharp.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
