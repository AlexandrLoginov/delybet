import Link from "next/link";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  Bell,
  CaretRight,
  Headphones,
  Medal,
  Megaphone,
  Moon,
  Sparkle,
} from "@phosphor-icons/react/ssr";

import { Card, CardContent } from "@/components/ui/card";
import { DarkThemeSwitch } from "@/components/theme/dark-theme-switch";
import { ProfileAdminSettingRow } from "@/components/profile/profile-admin-setting-row";
import { ProfileTelegramIdentity } from "@/components/profile/profile-telegram-identity";
import { ProfileProPromoBanner } from "@/components/profile/profile-pro-promo-banner";
import {
  ProfileTariffPreviewControl,
  ProfileTariffPreviewGate,
} from "@/components/profile/pro-mode-dev-toggle";

export const metadata = {
  title: "Профиль · DelyBet",
};

const TG_CHANNEL_URL = "https://t.me/delybet_news";
const TG_CHANNEL_HANDLE = "@delybet_news";

export default function ProfilePage() {
  return (
    <>
      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-6 pt-5">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Профиль
          </h1>
        </div>
        <ProfileTelegramIdentity />

        <ProfileProPromoBanner />

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
              <ProfileAdminSettingRow />
              <SettingRowLink
                icon={Medal}
                label="Подписка"
                hint="Текущий план и переход на DelyBet Pro"
                href="/subscription"
              />
              <SettingRowExternal
                icon={Megaphone}
                label="Telegram-канал"
                hint={`${TG_CHANNEL_HANDLE} · разборы матчей`}
                href={TG_CHANNEL_URL}
              />
              <SettingRowLink
                icon={Headphones}
                label="Помощь и поддержка"
                hint="Связь с техническим специалистом"
                href="#"
              />
            </CardContent>
          </Card>
        </section>

        <ProfileTariffPreviewGate>
          <section className="space-y-3">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Предпросмотр
            </h2>
            <Card>
              <CardContent className="p-0">
                <SettingRow
                  icon={Sparkle}
                  label="Тариф в приложении"
                  hint="Переключение между интерфейсом Free и Pro (предпросмотр)"
                  action={<ProfileTariffPreviewControl />}
                />
              </CardContent>
            </Card>
          </section>
        </ProfileTariffPreviewGate>

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
  icon: PhosphorIcon;
  label: string;
  hint: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
        <Icon className="h-4 w-4" weight="fill" />
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
  icon: PhosphorIcon;
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
        <Icon className="h-4 w-4" weight="fill" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <CaretRight
        className="h-4 w-4 shrink-0 text-muted-foreground"
        weight="fill"
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
  icon: PhosphorIcon;
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
        <Icon className="h-4 w-4" weight="fill" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <CaretRight
        className="h-4 w-4 shrink-0 text-muted-foreground"
        weight="fill"
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
