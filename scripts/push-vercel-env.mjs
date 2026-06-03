#!/usr/bin/env node
/**
 * Синхронизация ключей из .env.local → Vercel (production + preview + development).
 * Запуск: node scripts/push-vercel-env.mjs
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PROJECT_ID = "prj_cQp6G4UVUtRAqzqsDcxTzuO7LJuc";
const TEAM_ID = "team_0jFvxzdKjH8a5xp4azWIWsCl";
const TARGETS = ["production", "preview", "development"];

const KEYS = [
  "API_SPORTS_KEY",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL",
  "API_FOOTBALL_SEASON",
  "SESSION_SECRET",
  "TELEGRAM_BOT_TOKEN",
];

function loadToken() {
  const authPath = join(
    homedir(),
    "Library/Application Support/com.vercel.cli/auth.json"
  );
  const auth = JSON.parse(readFileSync(authPath, "utf8"));
  if (!auth.token) throw new Error("Vercel token not found. Run: vercel login");
  return auth.token;
}

function parseEnvLocal(path) {
  const text = readFileSync(path, "utf8");
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

async function api(token, method, path, body) {
  const url = `https://api.vercel.com${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || res.statusText;
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  return data;
}

async function listEnv(token) {
  const data = await api(
    token,
    "GET",
    `/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`
  );
  return data.envs ?? [];
}

async function removeEnv(token, id) {
  await api(token, "DELETE", `/v9/projects/${PROJECT_ID}/env/${id}?teamId=${TEAM_ID}`);
}

async function upsertEnv(token, key, value) {
  const existing = (await listEnv(token)).filter((e) => e.key === key);
  for (const e of existing) {
    await removeEnv(token, e.id);
  }
  await api(token, "POST", `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, {
    key,
    value,
    type: "encrypted",
    target: TARGETS,
  });
}

async function main() {
  const token = loadToken();
  const envPath = join(process.cwd(), ".env.local");
  const local = parseEnvLocal(envPath);

  local.NEXT_PUBLIC_APP_URL = "https://delybet.vercel.app";

  for (const key of KEYS) {
    const value = local[key];
    if (!value) {
      console.warn(`skip ${key}: empty in .env.local`);
      continue;
    }
    process.stdout.write(`set ${key}… `);
    await upsertEnv(token, key, value);
    console.log("ok");
  }

  await upsertEnv(token, "NEXT_PUBLIC_APP_URL", local.NEXT_PUBLIC_APP_URL);
  console.log("set NEXT_PUBLIC_APP_URL… ok");

  console.log("\nDone. Redeploy: npx vercel --prod");
}

main().catch((err) => {
  if (err.message.includes("403") || err.message.includes("Not authorized")) {
    console.error(
      "Токен Vercel недействителен. Выполните: npx vercel login\n" +
        "Затем снова: node scripts/push-vercel-env.mjs\n\n" +
        "Или вручную: https://vercel.com → delybet → Settings → Environment Variables"
    );
  } else {
    console.error(err.message);
  }
  process.exit(1);
});
