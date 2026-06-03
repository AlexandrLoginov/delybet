"use client";

import { useSyncExternalStore } from "react";

import {
  getAdminUserPreviewSnapshot,
  subscribeAdminUserPreview,
} from "@/lib/admin-user-preview-store";

export function useAdminUserPreview(): boolean {
  return useSyncExternalStore(
    subscribeAdminUserPreview,
    getAdminUserPreviewSnapshot,
    () => true
  );
}
