import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Fingerprint,
  Headphones,
  Medal,
  Megaphone,
  Moon,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DarkThemeSwitch } from "@/components/theme/dark-theme-switch";

export const metadata = {
  title: "Профиль · DelyBet",
};

const USER = {
  name: "Александр Логинов",
  telegramId: "387429012",
  initials: "АЛ",
  joinedISO: "2025-11-12",
};

const TG_CHANNEL_URL = "https://t.me/delybet_news";
const TG_CHANNEL_HANDLE = "@delybet_news";

export default function ProfilePage() {
  const joined = new Date(USER.joinedISO).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-6 pt-5">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Профиль
          </h1>
        </div>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {USER.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-base font-semibold">
                    {USER.name}
                  </span>
                  <Badge variant="muted" className="px-1.5">
                    Free
                  </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Fingerprint className="h-3 w-3 shrink-0" strokeWidth={2} />
                  <span className="truncate tabular-num">
                    ID {USER.telegramId}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  С нами с {joined}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-primary/40">
          <CardContent className="flex items-center gap-3 bg-primary/[0.08] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Medal className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">DelyBet Pro</div>
              <p className="text-xs text-muted-foreground">
                Безлимитный доступ к ИИ-анализам и ключевым факторам
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/subscription">Перейти на Pro</Link>
            </Button>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Настройки
          </h2>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              <SettingRow
                icon={Moon}
                label="Темная тема"
                hint="Когда выключено — светлое оформление"
                action={<DarkThemeSwitch />}
              />
              <SettingRow
                icon={Bell}
                label="Push-уведомления"
                hint="За час до матча и при изменении прогноза"
                action={<ToggleStub />}
              />
              <SettingRowExternal
                icon={Megaphone}
                label="Telegram-канал"
                hint={`${TG_CHANNEL_HANDLE} · разборы и Hot picks`}
                href={TG_CHANNEL_URL}
              />
              <SettingRowLink
                icon={Headphones}
                label="Помощь и поддержка"
                hint="FAQ, связь с командой"
                href="#"
              />
            </CardContent>
          </Card>
        </section>

        <p className="text-center text-[11px] text-muted-foreground">
          DelyBet · v1.0.0
        </p>
      </main>
    </>
  );
}

function SettingRow({
  icon: Icon,
  label,
  hint,
  action,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
      {action}
    </div>
  );
}

function SettingRowLink({
  icon: Icon,
  label,
  hint,
  href,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground"
        strokeWidth={2}
      />
    </Link>
  );
}

function SettingRowExternal({
  icon: Icon,
  label,
  hint,
  href,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#229ED9]/15 text-[#229ED9]">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground"
        strokeWidth={2}
      />
    </a>
  );
}

function ToggleStub() {
  return (
    <span
      className="inline-flex h-6 w-10 items-center rounded-full bg-success p-0.5"
      role="switch"
      aria-checked="true"
    >
      <span className="h-5 w-5 translate-x-4 rounded-full bg-white shadow" />
    </span>
  );
}
