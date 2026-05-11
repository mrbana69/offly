import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Shell from "@/components/Shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Offly — Offline Club",
  description: "Offly è l’app del nostro Offline Club: scopri gli incontri, prenota il tuo posto e ritroviamoci dal vivo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Shell>
            {children}
          </Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
