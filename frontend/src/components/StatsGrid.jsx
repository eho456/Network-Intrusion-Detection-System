/*
  Header metric cards
  /api/stats endpoint.

*/

// Label, value, and color class
function StatCard({ label, value, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      {/* Label */}
      <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
        {label}
      </div>
      {/* Value */}
      <div className={`text-3xl font-medium ${color}`}>
        {value}
      </div>
    </div>
  )
}

export default function StatsGrid({ stats }) {
  // If stats hasn't loaded yet, show placeholder dashes
  if (!stats) return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-20 animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard
        label="Connections analyzed"
        value={stats.total_connections.toLocaleString()}
        color="text-white"
      />
      <StatCard
        label="Attacks detected"
        value={stats.attacks_detected.toLocaleString()}
        color="text-red-400"   // red = bad/danger
      />
      <StatCard
        label="Normal traffic"
        value={stats.normal_traffic.toLocaleString()}
        color="text-green-400" // green = safe
      />
      <StatCard
        label="Attack rate"
        value={`${stats.attack_rate}%`}
        color="text-yellow-400" // yellow = warning
      />
      <StatCard
        label="Avg confidence"
        value={`${stats.avg_confidence}%`}
        color="text-blue-400"
      />
    </div>
  )
}