import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts"

const API = "http://localhost:8000/api"
const COLORS = ["#f87171","#fb923c","#fbbf24","#34d399","#60a5fa","#a78bfa","#f472b6","#94a3b8"]

// Stat card component — reused for each header metric
function StatCard({ label, value, color }) {
  return (
    <div className="border border-gray-800 rounded-xl p-4">
      <div className="text-xs">{label}</div>
      <div className={`text-3xl ${color}`}>{value}</div>
    </div>
  )
}

export default function App() {
  const [stats, setStats]         = useState(null)
  const [alerts, setAlerts]       = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [timeline, setTimeline]   = useState([])
  const [modelInfo, setModelInfo] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    // Fetch endpoints
    Promise.all([
      axios.get(`${API}/stats`),
      axios.get(`${API}/alerts`),
      axios.get(`${API}/attack_breakdown`),
      axios.get(`${API}/timeline`),
      axios.get(`${API}/model_info`),
    ]).then(([s, a, b, t, m]) => {
      setStats(s.data)
      setAlerts(a.data)
      // Convert to array
      setBreakdown(Object.entries(b.data).map(([name, value]) => ({ name, value })))
      setTimeline(t.data)
      setModelInfo(m.data)
      setLoading(false)
    })
  }, [])

  // Refresh/10 secs 
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${API}/stats`).then(r => setStats(r.data))
      axios.get(`${API}/alerts`).then(r => setAlerts(r.data))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="justify-center">
      Loading...
    </div>
  )

  return (
    <div className="">

      {/* Header */}
      <div className="flex items-center">
        <div className="" />
        <h1 className="">Network Intrusion Detection System</h1>
        <span className="text-xs">
          LIVE
        </span>
      </div>

      <div className="px-8">

        {/* Stats */}
        <div className="grid grid-cols-2">
          <StatCard label="Connections"     value={stats.total_connections.toLocaleString()} color="text-white" />
          <StatCard label="Attacks detected" value={stats.attacks_detected.toLocaleString()}  color="text-red-400" />
          <StatCard label="Normal traffic"  value={stats.normal_traffic.toLocaleString()}     color="text-green-400" />
          <StatCard label="Attack rate"     value={`${stats.attack_rate}%`}                   color="text-yellow-400" />
          <StatCard label="Avg confidence"  value={`${stats.avg_confidence}%`}                color="text-blue-400" />
        </div>

        {/* Charts row */}
        <div className="grid">

          {/* Attack type breakdown — pie chart */}
          <div className="bg-gray-900">
            <h3 className="text-sm">Attack types detected</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" 
                     cx="50%" cy="50%" outerRadius={80} label>
                  {breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11}} />
                <Tooltip contentStyle={{ background: "#000000"}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic timeline */}
          <div className="">
            <h3 className="">Traffic timeline</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeline}>
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 10, fill: "#344b7a" }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151" }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#000000" }} />
                <Bar dataKey="attacks" stackId="a" fill="#ffb0b0" name="Attacks" />
                <Bar dataKey="normal"  stackId="a" fill="#6281ad"  name="Normal" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Alerts */}
        <div className="">
          <h3 className="">
            Alerts with high confidence 
          </h3>
          <div className="">
            <table className="">
              <thead>
                <tr className="">
                  <th className="">Confidence</th>
                  <th className="">Attack category</th>
                  <th className="">Protocol</th>
                  <th className="">Bytes sent</th>
                  <th className="">Bytes recv</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a, i) => (
                  <tr key={i} className="">
                    <td className="">
                      <span className={`
                        ${a.confidence >= 80 ? "" :
                          a.confidence >= 50 ? "" :
                          ""}`}>
                        {a.confidence}%
                      </span>
                    </td>
                    <td className="">{a.attack_cat || "—"}</td>
                    <td className="">{a.proto || "—"}</td>
                    <td className="">
                      {a.sbytes ? Number(a.sbytes).toLocaleString() : "—"}
                    </td>
                    <td className="">
                      {a.dbytes ? Number(a.dbytes).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modelInfo && (
          <div className="flex">
            <span>Model: <span className="">{modelInfo.model}</span></span>
            <span>Recall: <span className="">{modelInfo.recall}%</span></span>
            <span>Precision: <span className="">{modelInfo.precision}%</span></span>
            <span>ROC-AUC: <span className="">{modelInfo.roc_auc}%</span></span>
            <span>Features: <span className="">{modelInfo.features_used}</span></span>
            <span>Dataset: <span className="">{modelInfo.dataset}</span></span>
          </div>
        )}

      </div>
    </div>
  )
}