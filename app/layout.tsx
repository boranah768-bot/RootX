import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RootX",
  description:
    "AI-powered assistant for coding, cybersecurity and research",

  icons: {
    icon: [
      {
        url: "/logo.png",
        type: "image/png",
      },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}