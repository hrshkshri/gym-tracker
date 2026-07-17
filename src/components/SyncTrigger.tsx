"use client";
import { useEffect } from "react";
import { sync } from "@/lib/db/sync";

export function SyncTrigger() {
  useEffect(() => {
    sync().catch(() => {});
    const handler = () => sync().catch(() => {});
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, []);
  return null;
}
