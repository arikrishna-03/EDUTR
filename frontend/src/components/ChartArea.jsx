import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const sampleData = [
  { name: "Mon", problems: 2 },
  { name: "Tue", problems: 4 },
  { name: "Wed", problems: 5 },
  { name: "Thu", problems: 6 },
  { name: "Fri", problems: 3 },
  { name: "Sat", problems: 7 },
  { name: "Sun", problems: 1 }
];

export default function ChartArea({ data = sampleData, dataKey = "problems", title = "Weekly Activity" }) {
  return (
    <div className="chart-card">
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#9aa3b2" />
          <YAxis stroke="#9aa3b2" />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke="#00ccff" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
