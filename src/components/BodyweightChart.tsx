"use client";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";
import { rollingAverage7 } from "@/lib/logic/rollingAverage";
import type { BodyweightEntry } from "@/lib/types";

export function BodyweightChart({ data }: { data: BodyweightEntry[] }) {
  const series = rollingAverage7(data);
  if (series.length === 0) return <p className="text-muted">No weigh-ins yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8a8a92" }} hide />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#8a8a92" }} />
        <Tooltip contentStyle={{ background: "#1d1d20", border: "1px solid #2a2a2e" }} />
        <ReferenceLine y={70} stroke="#8a8a92" strokeDasharray="4 4" label={{ value: "goal 70", fill: "#8a8a92", fontSize: 10 }} />
        <Line type="monotone" dataKey="weight" stroke="#3a3a40" dot={false} />
        <Line type="monotone" dataKey="avg" stroke="#c6ff3f" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
