import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konto",
  description: "Name, Standort und Konto von Used Fruit verwalten.",
};

export default function ProfilLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
