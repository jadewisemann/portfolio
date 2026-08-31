import type { Metadata } from "next";
import { V1Spine } from "@/components/bestof/V1Spine";

export const metadata: Metadata = { title: "Best-of-N — v1 척추" };

export default function V1Page() {
  return (
    <main id="main">
      <V1Spine />
    </main>
  );
}
