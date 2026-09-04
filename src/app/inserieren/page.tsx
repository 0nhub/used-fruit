"use client";

import { ListingWizard } from "@/components/ListingWizard";
import { Suspense } from "react";

export default function InserierenPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-uf-bg-subtle" />}>
      <ListingWizard />
    </Suspense>
  );
}
