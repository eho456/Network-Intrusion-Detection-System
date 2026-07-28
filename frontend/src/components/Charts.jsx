/*
  Left:  PieChart w/ breakdown of attack categories
  Right: BarChart w/ attacks vs normal traffic over time
*/

import {
  PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts"

// Pie chart colors
const COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#fbbf24", // yellow
  "#34d399", // green
  "#60a5fa", // blue
  "#a78bfa", // purple
  "#f472b6", // pink
  "#94a3b8", // gray
]

const tooltipStyle = {
  contentStyle: {
    background: "#111827",
    border: "1px solid #374151",
    borderRadius: "8px",
    color: "#e5e7eb"
  }
}

export default function Charts({ breakdown, timeline }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Attack type breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm text-gray-400 mb-4">Attack types detected</h3>

        {breakdown.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-gray-600">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {/* color slice */}
                {breakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
              />
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm text-gray-400 mb-4">
          Traffic timeline
          <span className="ml-2 text-xs text-gray-600">
            (12 equal time windows)
          </span>
        </h3>

        {timeline.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-gray-600">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timeline} barSize={14}>
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              {/* stackId="a" stacked bar */}
              <Bar dataKey="attacks" stackId="a" fill="#f87171" name="Attacks" />
              <Bar dataKey="normal"  stackId="a" fill="#1e3a2f"  name="Normal"  radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}