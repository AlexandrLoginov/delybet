"use client";

import { useSyncExternalStore } from "react";

import type { AdminDataSourceMode } from "@/lib/admin-data-source";
import {
  getAdminDataSourceSnapshot,
  subscribeAdminDataSource,
} from "@/lib/admin-data-source-store";

export function useAdminDataSource(): AdminDataSourceMode {
  return useSyncExternalStore(
    subscribeAdminDataSource,
    getAdminDataSourceSnapshot,
    () => "api"
  );
}
