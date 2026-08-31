import type { Metadata } from "next";
import { V3Field } from "@/components/bestof/V3Field";

export const metadata: Metadata = { title: "Best-of-N — v3 여백의 압력" };

export default function V3Page() {
  return (
    <main id="main">
      <V3Field />
    </main>
  );
}
