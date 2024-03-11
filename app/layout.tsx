import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import Toaster from "./toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"; // Import SpeedInsights

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Prompt GPTs",
  description: "문서기반 GPTS",
  metadataBase: 'https://ai-creator.store'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <SpeedInsights /> {/* Add SpeedInsights */}
      </body>
      <Analytics />
    </html>
  );
}