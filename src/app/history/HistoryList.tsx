import Link from "next/link";
import type { Session } from "@/lib/types";

export function HistoryList({ sessions }: { sessions: Session[] }) {
  const ordered = [...sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return (
    <ul className="space-y-2">
      {ordered.map((s) => {
        const setCount = s.exercises.reduce((n, e) => n + e.sets.length, 0);
        return (
          <li key={s.id}>
            <Link
              href={`/session/${s.id}`}
              className="block rounded-2xl bg-surface border border-line p-4"
            >
              <div className="font-semibold">{s.title}</div>
              <div className="text-sm text-muted">{s.date} · {setCount} sets</div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
