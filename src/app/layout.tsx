import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BenefitBridge | Life-event recovery agent",
  description: "Turn a sudden income crisis into a personalized, persistent recovery plan."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
