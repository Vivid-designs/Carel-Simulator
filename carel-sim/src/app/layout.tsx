import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carel Sim",
  description: "A bill splitting app for personal use",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}