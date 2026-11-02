import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "smolvm exec truncation on image machines: unofficial demo",
  description:
    "Past 11 MiB, machine exec on an image machine returns partial output with no error, sometimes with exit 0. A small agent patch returns the error other paths already give.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
