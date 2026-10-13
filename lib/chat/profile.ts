import { readFile } from "node:fs/promises";
import { join } from "node:path";

let cached: Promise<string> | undefined;

async function readProfile() {
  const raw = await readFile(join(process.cwd(), "content/profile.md"), "utf8");
  return raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Reads content/profile.md without HTML comments. Re-read on every request in
// development so edits show up immediately.
export function getProfile() {
  if (process.env.NODE_ENV !== "production") return readProfile();
  cached ??= readProfile();
  return cached;
}
