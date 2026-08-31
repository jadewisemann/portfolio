import type { Metadata } from "next";
import { V2Ratio } from "@/components/bestof/V2Ratio";

export const metadata: Metadata = { title: "Best-of-N B2 — 비율" };

export default function B2Page() {
  return (
    <main id="main">
      <V2Ratio />
    </main>
  );
}
