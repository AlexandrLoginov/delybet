#!/usr/bin/env node
/**
 * Проверка DATABASE_URL и схемы Prisma.
 * Запуск: npm run db:check
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadDatabaseUrl() {
  const envPath = join(process.cwd(), ".env.local");
  let url = process.env.DATABASE_URL?.trim();
  if (url) return url;

  try {
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.startsWith("DATABASE_URL=")) continue;
      let val = t.slice("DATABASE_URL=".length).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      url = val;
      break;
    }
  } catch {
    /* .env.local optional when env is exported */
  }

  return url?.trim() ?? "";
}

function isPlaceholder(url) {
  return (
    !url ||
    url.includes("USER:PASSWORD") ||
    url.includes("@HOST.") ||
    url.includes("user:password@localhost")
  );
}

const databaseUrl = loadDatabaseUrl();

if (isPlaceholder(databaseUrl)) {
  console.error(
    "DATABASE_URL не задан или placeholder в .env.local.\n\n" +
      "1. Создайте проект на https://console.neon.tech\n" +
      "2. Скопируйте Connection string (PostgreSQL)\n" +
      "3. Вставьте в .env.local как DATABASE_URL=...\n" +
      "4. npm run db:push\n" +
      "5. npm run vercel:env && npm run vercel:deploy"
  );
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;

const push = spawnSync("npx", ["prisma", "db", "push", "--skip-generate"], {
  stdio: "inherit",
  env: process.env,
});

if (push.status !== 0) {
  process.exit(push.status ?? 1);
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  const count = await prisma.user.count();
  console.log(
    `OK: подключение к БД работает, пользователей в таблице User: ${count}`
  );
} finally {
  await prisma.$disconnect();
}
