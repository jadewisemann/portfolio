import fs from "node:fs";

const input = JSON.parse(await new Promise((resolve) => {
  let data = "";
  process.stdin.on("data", (chunk) => { data += chunk; });
  process.stdin.on("end", () => resolve(data));
}));

const statePath = "docs/portfolio/state.json";
if (!fs.existsSync(statePath) || input.stop_hook_active) process.exit(0);

const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
if (state.active && state.status !== "COMPLETE") {
  console.error("Portfolio workflow is still active. Re-read state.json and either continue with nextAction or record a concrete blocker before stopping.");
  process.exit(2);
}
