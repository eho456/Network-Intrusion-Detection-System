/*
  PredictForm.jsx
  Lets a user manually enter network flow values and get a live prediction.
  This is the single most impressive interactive feature of the dashboard —
  it shows the model making real predictions on user input, not just
  displaying pre-loaded data.
*/

import { useState } from "react"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const DEFAULTS = {
  dur: 0.5, spkts: 10, dpkts: 5,
  sbytes: 500, dbytes: 200, rate: 20.0,
  sttl: 64, dttl: 128
}

export default function PredictForm() {
  const [form,   setForm]   = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/predict`, form)
      setResult(res.data)
    } catch (e) {
      setResult({ error: e.message })
    }
    setLoading(false)
  }

  const resultColor =
    !result        ? "" :
    result.error   ? "text-gray-400" :
    result.prediction === "Attack" ? "text-red-400" : "text-green-400"

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm text-gray-400 mb-4">
        Live prediction — enter flow values
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {Object.entries(form).map(([key, val]) => (
          <div key={key}>
            <label className="text-xs text-gray-500 block mb-1">{key}</label>
            <input
              type="number"
              value={val}
              onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5
                         text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
                   text-white text-sm px-4 py-2 rounded-lg transition-colors"
      >
        {loading ? "Predicting..." : "Run prediction"}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          {result.error ? (
            <p className="text-red-400 text-sm">{result.error}</p>
          ) : (
            <div className="flex flex-wrap gap-6 text-sm">
              <span>
                Prediction: <span className={`font-medium ${resultColor}`}>
                  {result.prediction}
                </span>
              </span>
              <span>
                Confidence: <span className="text-gray-200">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </span>
              <span>
                Risk: <span className={resultColor}>{result.risk}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}