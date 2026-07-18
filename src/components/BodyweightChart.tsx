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
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0A0A6" }} hide />
        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#A0A0A6" }} />
        <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #ECECE9", borderRadius: 12, color: "#1B1B1E" }} />
        <ReferenceLine y={70} stroke="#A0A0A6" strokeDasharray="4 4" label={{ value: "goal 70", fill: "#A0A0A6", fontSize: 10 }} />
        <Line type="monotone" dataKey="weight" stroke="#D8D8D4" dot={false} />
        <Line type="monotone" dataKey="avg" stroke="#3E9B72" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
