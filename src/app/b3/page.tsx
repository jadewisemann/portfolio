import type { Metadata } from "next";
import { V3Field } from "@/components/bestof/V3Field";

export const metadata: Metadata = { title: "Best-of-N B3 — 필드" };

export default function B3Page() {
  return (
    <main id="main">
      <V3Field />
    </main>
  );
}
