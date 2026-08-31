import type { Metadata } from "next";
import { V2Ratio } from "@/components/bestof/V2Ratio";

export const metadata: Metadata = { title: "Best-of-N — v2 비율이 먼저" };

export default function V2Page() {
  return (
    <main id="main">
      <V2Ratio />
    </main>
  );
}
