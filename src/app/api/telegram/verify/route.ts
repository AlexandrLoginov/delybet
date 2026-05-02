import { NextRequest, NextResponse } from "next/server";

import {
  isInitDataAuthFresh,
  parseAuthDateFromInitData,
  parseUserFromInitData,
  verifyTelegramWebAppInitData,
} from "@/lib/telegram/validate-init-data";

const ERR_NO_TOKEN = "TELEGRAM_BOT_TOKEN is not set";
const ERR_INVALID = "Invalid or expired initData";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { initData?: string };
    const initData = body.initData?.trim();
    if (!initData) {
      return NextResponse.json(
        { error: "initData required" },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!botToken) {
      return NextResponse.json({ error: ERR_NO_TOKEN }, { status: 503 });
    }

    if (!isInitDataAuthFresh(initData)) {
      return NextResponse.json({ error: ERR_INVALID }, { status: 401 });
    }

    if (!verifyTelegramWebAppInitData(initData, botToken)) {
      return NextResponse.json({ error: ERR_INVALID }, { status: 401 });
    }

    const user = parseUserFromInitData(initData);
    if (!user) {
      return NextResponse.json({ error: "user missing in initData" }, { status: 400 });
    }

    const authDate = parseAuthDateFromInitData(initData);

    return NextResponse.json({
      user,
      authDate: authDate ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
