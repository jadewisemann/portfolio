import { describe, it } from "vitest";
import fs from "node:fs";
import { heroItemsDesktop } from "./layout";
const LOG: string[] = [];
const console = { log: (...a: unknown[]) => LOG.push(a.join(" ")) };
import { PROJECTS } from "../shots";
import {
  corridorCameraZ, corridorItems, corridorTotalDepth, corridorIndexForZ,
  corridorDominantProjectIndex, corridorPlanesInView, corridorProjectTargetZ,
  corridorProgressForZ, easeSpine, CORRIDOR_FOV, projectToScreen,
} from "./layout";

const ASPECTS: Record<string, number> = { "1440": 1440 / 900, "1920": 1920 / 1080, "320": 320 / 640 };

function coverage(cameraZ: number, aspect: number) {
  let sum = 0;
  for (const it of corridorItems(PROJECTS)) {
    const rect = projectToScreen(it, { x: 0, y: 0, z: cameraZ, fovDeg: CORRIDOR_FOV, aspect });
    if (!rect) continue;
    const l = Math.max(0, rect.leftPct - rect.widthPct / 2);
    const r = Math.min(100, rect.leftPct + rect.widthPct / 2);
    const t = Math.max(0, rect.topPct - rect.heightPct / 2);
    const b = Math.min(100, rect.topPct + rect.heightPct / 2);
    sum += Math.max(0, r - l) * Math.max(0, b - t);
  }
  return sum / 100;
}

describe("scratch", () => {
  it("density sweep", () => {
    const depth = corridorTotalDepth(PROJECTS);
    for (const [label, aspect] of Object.entries(ASPECTS)) {
      const rows: string[] = [];
      for (let p = 0; p <= 100; p += 4) {
        const z = corridorCameraZ(p / 100, depth);
        rows.push(`${String(p).padStart(3)}% z=${z.toFixed(2)} n=${String(corridorPlanesInView(p/100, 6, PROJECTS, aspect)).padStart(2)} cov=${coverage(z, aspect).toFixed(1).padStart(5)}% cap=${corridorIndexForZ(z, PROJECTS.length)} dom=${corridorDominantProjectIndex(z, aspect)}`);
      }
      console.log(`\n=== ${label} (aspect ${aspect.toFixed(2)}) ===\n` + rows.join("\n"));
    }
    // jump geometry
    console.log("\n=== jump targets ===");
    for (let i = 0; i < PROJECTS.length; i++) {
      const tz = corridorProjectTargetZ(i);
      console.log(`p${i} targetZ=${tz.toFixed(3)} progress=${(corridorProgressForZ(tz, depth) * 100).toFixed(1)}%`);
    }
    console.log("\n=== easeSpine trajectory (620ms) ===");
    for (const ms of [0, 40, 80, 120, 160, 200, 260, 310, 400, 500, 560, 620]) {
      console.log(`${String(ms).padStart(3)}ms t=${(ms/620).toFixed(3)} eased=${easeSpine(ms/620).toFixed(4)}`);
    }
    // co-occurrence of duplicate shots
    console.log("\n=== duplicate co-occurrence (1440) ===");
    const a = ASPECTS["1440"];
    const items = corridorItems(PROJECTS);
    let coFrames = 0, total = 0;
    const detail: string[] = [];
    for (let p = 0; p <= 100; p += 2) {
      const z = corridorCameraZ(p / 100, depth);
      total++;
      const onscreen = items.filter((it) => {
        const rect = projectToScreen(it, { x: 0, y: 0, z, fovDeg: CORRIDOR_FOV, aspect: a });
        if (!rect) return false;
        const l = rect.leftPct - rect.widthPct / 2, r = rect.leftPct + rect.widthPct / 2;
        const t = rect.topPct - rect.heightPct / 2, b = rect.topPct + rect.heightPct / 2;
        return Math.min(r,100) - Math.max(l,0) > 0.5 && Math.min(b,100) - Math.max(t,0) > 0.5;
      });
      const byShot = new Map<string, number[]>();
      for (const it of onscreen) {
        const base = it.key.replace(/-\d+$/, "");
        byShot.set(base, [...(byShot.get(base) ?? []), Number(it.key.split("-").pop())]);
      }
      const dupes = [...byShot.entries()].filter(([, v]) => v.length > 1);
      if (dupes.length) { coFrames++; detail.push(`${p}%: ${dupes.map(([k, v]) => `${k}x${v.length}`).join(", ")} (of ${onscreen.length} onscreen)`); }
    }
    console.log(`frames with a duplicated shot on screen: ${coFrames}/${total}`);
    console.log(detail.join("\n"));
    fs.writeFileSync("/tmp/claude-0/-home-user-portfolio/977016d2-463e-5261-a287-ee45f17d98d2/scratchpad/density.txt", LOG.join("\n"));
    fs.writeFileSync("/tmp/claude-0/-home-user-portfolio/977016d2-463e-5261-a287-ee45f17d98d2/scratchpad/items.json", JSON.stringify({ corridor: corridorItems(PROJECTS).map((i) => ({ key: i.key, x: i.x, y: i.y, z: i.z })), hero: heroItemsDesktop().map((i) => ({ key: i.key, x: i.x, y: i.y, z: i.z })) }, null, 1));
  });
});
