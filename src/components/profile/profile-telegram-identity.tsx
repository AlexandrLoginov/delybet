"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfilePlanBadge } from "@/components/profile/profile-plan-badge";
import { TelegramBrowserLoginExplanation } from "@/components/telegram/telegram-browser-login-explanation";
import { TelegramOpenInTelegramButton } from "@/components/telegram/telegram-open-in-telegram-button";
import {
  displayNameFromTelegramUser,
  initialsFromTelegramUser,
} from "@/lib/telegram/telegram-user-display";
import { useTelegramSession } from "@/lib/telegram/use-telegram-session";

export function ProfileTelegramIdentity() {
  const state = useTelegramSession();

  if (state.status === "loading") {
    return (
      <Card className="shadow-none">
        <CardContent className="px-5 py-4">
          <div className="flex min-h-[96px] items-start gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" aria-hidden />
            <div className="flex min-h-[72px] min-w-0 flex-1 flex-col justify-center gap-2">
              <div className="flex flex-col gap-0.5">
                <Skeleton className="h-5 w-[min(220px,75%)] rounded-lg" aria-hidden />
                <Skeleton className="h-3.5 w-[min(200px,85%)] rounded-md" aria-hidden />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-10 rounded-md" aria-hidden />
                <Skeleton className="h-5 w-14 rounded-full" aria-hidden />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "browser") {
    return (
      <Card className="shadow-none" data-telegram-gate-exempt>
        <CardContent className="space-y-4 p-5">
          <TelegramBrowserLoginExplanation />
          <TelegramOpenInTelegramButton />
        </CardContent>
      </Card>
    );
  }

  const { user } = state;
  const name = displayNameFromTelegramUser(user);
  const initials = initialsFromTelegramUser(user);

  return (
    <Card className="shadow-none">
      <CardContent className="px-5 py-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {user.photo_url ? (
              <AvatarImage src={user.photo_url} alt="" className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="space-y-0.5">
              <div className="truncate text-base font-semibold leading-tight text-foreground">
                {name}
              </div>
              {user.username ? (
                <div className="truncate text-xs leading-tight text-muted-foreground">
                  @{user.username}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Тариф</span>
              <ProfilePlanBadge />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
