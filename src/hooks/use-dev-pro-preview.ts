"use client";

import { useSyncExternalStore } from "react";

import {
  getDevProPreviewSnapshot,
  subscribeDevProPreview,
} from "@/lib/dev-pro-preview-store";

export function useDevProPreview(): boolean {
  return useSyncExternalStore(
    subscribeDevProPreview,
    getDevProPreviewSnapshot,
    () => false
  );
}
