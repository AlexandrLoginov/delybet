#!/usr/bin/env node
/** Генерирует .env.vercel.import из .env.local для импорта в Vercel UI. */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, ".env.local");
const OUT = join(ROOT, ".env.vercel.import");

const REQUIRED = [
  "API_SPORTS_KEY",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL",
  "API_FOOTBALL_SEASON",
  "SESSION_SECRET",
  "TELEGRAM_BOT_TOKEN",
  "NEXT_PUBLIC_APP_URL",
];

const OPTIONAL = ["DATABASE_URL", "NEWS_API_KEY", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];

function parse(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function isPlaceholderDb(url) {
  return !url || url.includes("USER:PASSWORD") || url.includes("@HOST.");
}

const local = parse(readFileSync(SRC, "utf8"));
local.NEXT_PUBLIC_APP_URL = "https://delybet.app";
local.NEXT_PUBLIC_USE_MOCKS = "false";

const lines = [
  "# Импорт в Vercel: Project delybet → Settings → Environment Variables → Import .env",
  "# Targets: Production, Preview, Development",
  "",
];

const missing = [];
for (const key of REQUIRED) {
  if (!local[key]) missing.push(key);
  else lines.push(`${key}=${local[key]}`);
}
lines.push(`NEXT_PUBLIC_USE_MOCKS=${local.NEXT_PUBLIC_USE_MOCKS}`);

for (const key of OPTIONAL) {
  const val = local[key];
  if (!val) continue;
  if (key === "DATABASE_URL" && isPlaceholderDb(val)) {
    lines.push("# DATABASE_URL= — укажите Neon URL в Vercel вручную (сессия Telegram)");
    continue;
  }
  lines.push(`${key}=${val}`);
}

lines.push("");
writeFileSync(OUT, lines.join("\n"), "utf8");

console.log(`Wrote ${OUT}`);
if (missing.length) {
  console.error("Missing in .env.local:", missing.join(", "));
  process.exit(1);
}
console.log("Import this file in Vercel, then Redeploy production.");
