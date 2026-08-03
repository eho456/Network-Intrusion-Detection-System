/*
  Fetch data from API endpoints and passes to components
  Polls every 10 seconds
*/

import { useState, useEffect } from "react"
import axios from "axios"
import StatsGrid    from "./components/StatsGrid"
import AlertsTable  from "./components/AlertsTable"
import Charts       from "./components/Charts"

// Base URL for the FastAPI backend
// When running locally: http://localhost:8000
// When running in Docker: http://backend:8000 
const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function App() {
  const [stats,     setStats]     = useState(null)
  const [alerts,    setAlerts]    = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [timeline,  setTimeline]  = useState([])
  const [modelInfo, setModelInfo] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // Fetch all data 
  useEffect(() => {
    async function fetchAll() {
      try {
        const [s, a, b, t, m] = await Promise.all([
          axios.get(`${API}/api/stats`),
          axios.get(`${API}/api/alerts`),
          axios.get(`${API}/api/attack_breakdown`),
          axios.get(`${API}/api/timeline`),
          axios.get(`${API}/api/model_info`),
        ])

        setStats(s.data)
        setAlerts(a.data)

        setBreakdown(
          Object.entries(b.data).map(([name, value]) => ({ name, value }))
        )
        setTimeline(t.data)
        setModelInfo(m.data)
        setLoading(false)
      } catch (err) {
        setError("Cannot connect to API")
        setLoading(false)
      }
    }

    fetchAll()
  }, []) 

  // Poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [s, a] = await Promise.all([
          axios.get(`${API}/api/stats`),
          axios.get(`${API}/api/alerts`),
        ])
        setStats(s.data)
        setAlerts(a.data)
      } catch {
        // Poll fails
      }
    }, 10000)

    // Cleanup
    return () => clearInterval(interval)
  }, [])

  // Loading state
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading dashboard...</div>
    </div>
  )

  // Error state
  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
      <div className="bg-red-900/20 border border-red-900 rounded-xl p-6 max-w-md text-center">
        <div className="text-red-400 font-medium mb-2">Connection Error</div>
        <div className="text-gray-400 text-sm">{error}</div>
        <div className="text-gray-600 text-xs mt-3">
          Run: uvicorn main:app --reload --port 8000
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-4 flex items-center gap-3">
        {/* Pulsing green dot */}
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <h1 className="text-lg font-medium">Network Intrusion Detection System</h1>
        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 
                         rounded-full border border-green-900/50">
          LIVE
        </span>
        {modelInfo && (
          <span className="ml-auto text-xs text-gray-600">
            {modelInfo.model} · {modelInfo.features_used} features
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="px-8 py-6 space-y-5">

        {/* Row 1: stat cards */}
        <StatsGrid stats={stats} />

        {/* Row 2: charts */}
        <Charts breakdown={breakdown} timeline={timeline} />

        {/* Row 3: alerts table */}
        <AlertsTable alerts={alerts} />

        {/* Row 4: model info footer */}
        {modelInfo && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 
                          flex flex-wrap gap-x-8 gap-y-2 text-xs text-gray-500">
            <span>
              Model: <span className="text-gray-300">{modelInfo.model}</span>
            </span>
            <span>
              Recall: <span className="text-green-400">{modelInfo.recall}%</span>
            </span>
            <span>
              Precision: <span className="text-gray-300">{modelInfo.precision}%</span>
            </span>
            <span>
              F1: <span className="text-gray-300">{modelInfo.f1}%</span>
            </span>
            <span>
              ROC-AUC: <span className="text-gray-300">{modelInfo.roc_auc}%</span>
            </span>
            <span>
              Dataset: <span className="text-gray-300">{modelInfo.dataset}</span>
            </span>
            <span>
              Trained on: <span className="text-gray-300">{modelInfo.trained_on}</span>
            </span>
          </div>
        )}

      </div>
    </div>
  )
}