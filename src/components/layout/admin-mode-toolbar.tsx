"use client";

import { useEffect } from "react";

import {
  ProfileAdminPreviewBar,
  ProfileTariffPreviewGate,
} from "@/components/profile/pro-mode-dev-toggle";

const TOOLBAR_HEIGHT_PX = 44;

function AdminModeToolbarInner() {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--admin-toolbar-h",
      `${TOOLBAR_HEIGHT_PX}px`
    );
    return () => {
      document.documentElement.style.setProperty("--admin-toolbar-h", "0px");
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      data-admin-toolbar
      data-telegram-gate-exempt
    >
      <div className="mx-auto flex max-w-2xl justify-end">
        <ProfileAdminPreviewBar />
      </div>
    </div>
  );
}

/** Free/Pro и Mock/Api на всех экранах для админов из PROFILE_ADMIN_USERNAMES. */
export function AdminModeToolbar() {
  return (
    <ProfileTariffPreviewGate>
      <AdminModeToolbarInner />
    </ProfileTariffPreviewGate>
  );
}
