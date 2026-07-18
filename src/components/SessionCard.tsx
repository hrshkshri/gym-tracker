import type { DayTemplate } from "@/lib/types";

export function SessionCard({
  template,
  onOpen,
}: {
  template: DayTemplate;
  onOpen: () => void;
}) {
  const count = template.exercises.length;
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-3xl bg-surface p-5 shadow-sm active:scale-[0.99] transition"
    >
      <div className="text-xs uppercase tracking-widest text-muted">Today</div>
      <div className="mt-1 text-2xl font-semibold">{template.title}</div>
      <div className="mt-2 text-sm text-muted">
        {count > 0 ? `${count} exercises` : "No lifting today"}
        {template.cardio ? " · cardio" : ""}
      </div>
    </button>
  );
}
