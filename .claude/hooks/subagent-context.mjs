import fs from "node:fs";

const input = JSON.parse(await new Promise((resolve) => {
  let data = "";
  process.stdin.on("data", (chunk) => { data += chunk; });
  process.stdin.on("end", () => resolve(data));
}));

const statePath = "docs/portfolio/state.json";
const state = fs.existsSync(statePath)
  ? fs.readFileSync(statePath, "utf8")
  : "{}";

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "SubagentStart",
    additionalContext: `Current portfolio workflow state:\n\n${state}\n\nYour assigned role is ${input.agent_type}. Do not contradict locked design decisions without explicitly reporting the conflict.`
  }
}));
