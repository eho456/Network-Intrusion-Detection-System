/*
  Table with 25 highest-confidence attack detections
  /api/alerts endpoint.
*/

// color based on confidence 
function ConfidenceBadge({ value }) {
  const pct = parseFloat(value)
  const color =
    pct >= 80 ? "bg-red-900/40 text-red-400 border border-red-900" :
    pct >= 50 ? "bg-yellow-900/40 text-yellow-400 border border-yellow-900" :
               "bg-gray-800 text-gray-400 border border-gray-700"

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {pct}%
    </span>
  )
}

export default function AlertsTable({ alerts }) {
  if (!alerts || alerts.length === 0) return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-600 text-sm">No alerts to display</p>
    </div>
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm text-gray-400 mb-4">
        Top alerts —
        <span className="text-gray-500"> highest confidence detections</span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider 
                           border-b border-gray-800">
              <th className="pb-3 text-left font-normal">Confidence</th>
              <th className="pb-3 text-left font-normal">Attack category</th>
              <th className="pb-3 text-left font-normal">Protocol</th>
              <th className="pb-3 text-left font-normal">Bytes sent</th>
              <th className="pb-3 text-left font-normal">Bytes recv</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, i) => (
              <tr
                key={i}
                className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors"
              >
                <td className="py-2.5 pr-4">
                  <ConfidenceBadge value={alert.confidence} />
                </td>
                <td className="py-2.5 pr-4 text-gray-300">
                  {alert.attack_cat || "—"}
                </td>
                <td className="py-2.5 pr-4 text-gray-400">
                  {alert.proto || "—"}
                </td>
                <td className="py-2.5 pr-4 text-gray-400">
                  {alert.sbytes && alert.sbytes !== "unknown"
                    ? Number(alert.sbytes).toLocaleString()
                    : "—"}
                </td>
                <td className="py-2.5 text-gray-400">
                  {alert.dbytes && alert.dbytes !== "unknown"
                    ? Number(alert.dbytes).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}