import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ProgressBar from "./components/ProgressBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlgoFlow",
  description: "Turn algorithms and processes into beautiful, downloadable flowcharts with the power of AI.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
