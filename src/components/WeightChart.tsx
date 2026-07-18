"use client";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";

export function WeightChart({ series }: { series: { date: string; topWeight: number }[] }) {
  if (series.length === 0) return <p className="text-muted">No data for this lift yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A6" }} hide />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#A0A0A6" }} />
        <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #ECECE9", borderRadius: 12, color: "#1B1B1E" }} />
        <Line type="monotone" dataKey="topWeight" stroke="#3E9B72" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}
