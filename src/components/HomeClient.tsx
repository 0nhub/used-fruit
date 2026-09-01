"use client";

import dynamic from "next/dynamic";

const CatalogPage = dynamic(
  () => import("@/components/CatalogPage").then((mod) => mod.CatalogPage),
  {
    ssr: false,
    loading: () => <div className="min-h-dvh bg-white" />,
  },
);

export function HomeClient() {
  return <CatalogPage />;
}
