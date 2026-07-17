"use client";
import { useEffect, useState } from "react";
import { getSessions } from "@/lib/db/repo";
import type { Session } from "@/lib/types";
import { HistoryList } from "./HistoryList";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  useEffect(() => { getSessions().then(setSessions); }, []);
  return (
    <main className="p-5 space-y-3">
      <h1 className="text-2xl font-bold">History</h1>
      {sessions.length === 0 ? (
        <p className="text-muted">No sessions logged yet.</p>
      ) : (
        <HistoryList sessions={sessions} />
      )}
    </main>
  );
}
