import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "22 Southwest Transit Display",
  description: "Real-time transit information for Mount Vernon West",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

