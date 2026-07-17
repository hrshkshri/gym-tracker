"use client";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";

export function WeightChart({ series }: { series: { date: string; topWeight: number }[] }) {
  if (series.length === 0) return <p className="text-muted">No data for this lift yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8a8a92" }} hide />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#8a8a92" }} />
        <Tooltip contentStyle={{ background: "#1d1d20", border: "1px solid #2a2a2e" }} />
        <Line type="monotone" dataKey="topWeight" stroke="#c6ff3f" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}
