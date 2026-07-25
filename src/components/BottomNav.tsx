"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Today" },
  { href: "/plan", label: "Plan" },
  { href: "/history", label: "History" },
  { href: "/progress", label: "Progress" },
  { href: "/diet", label: "Diet" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-line bg-surface/95 backdrop-blur grid grid-cols-5">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`py-3 text-center text-xs font-medium ${
              active ? "text-accent" : "text-muted"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
