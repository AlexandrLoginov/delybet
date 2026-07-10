"use client";

import { useEffect } from "react";

import {
  ProfileAdminPreviewBar,
  ProfileTariffPreviewGate,
} from "@/components/profile/pro-mode-dev-toggle";

const TOOLBAR_HEIGHT_PX = 56;

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
      className="fixed inset-x-0 bottom-[calc(64px+max(20px,env(safe-area-inset-bottom,0px)))] z-50 border-t border-border/60 bg-background/95 px-4 py-2 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80"
      data-admin-toolbar
      data-telegram-gate-exempt
    >
      <div className="mx-auto flex max-w-2xl justify-end">
        <ProfileAdminPreviewBar />
      </div>
    </div>
  );
}

/** Переключатели админа над нижней навигацией. */
export function AdminModeToolbar() {
  return (
    <ProfileTariffPreviewGate>
      <AdminModeToolbarInner />
    </ProfileTariffPreviewGate>
  );
}
