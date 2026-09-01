import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Used Fruit",
  description:
    "Kaufen und verkaufen Sie gebrauchte Apple Geräte im Apple Refurbished Stil. Mit Modellfiltern, Zustand und lokaler Abholung.",
};

export default function Home() {
  return <HomeClient />;
}
