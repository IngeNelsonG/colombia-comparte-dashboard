import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { apiService } from '../services/api'
import { TrendingUp } from 'lucide-react'
import localSimulations from '../services/localSimulations'

export default function ComparisonEscenarios() {
  const [comparacion, setComparacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [savedList, setSavedList] = useState([])
  const [selected, setSelected] = useState([])

  useEffect(() => {
    const pre = JSON.parse(localStorage.getItem('selectedComparisons') || '[]')
    const initialSelected = Array.isArray(pre) ? pre : []
    setSelected(initialSelected)

    const refreshSaved = () => {
      const list = localSimulations.getAll()
      setSavedList(list)

      setSelected((current) => {
        const valid = current.filter((id) => list.some((s) => String(s.id) === String(id))).slice(0, 2)
        localStorage.setItem('selectedComparisons', JSON.stringify(valid))
        return valid
      })
    }

    refreshSaved()
    const unsubscribe = localSimulations.subscribe(() => {
      refreshSaved()
    })

    return unsubscribe
  }, [])

  const handleComparar = async () => {
    setLoading(true)
    try {
      if (selected.length === 2) {
        const s1 = localSimulations.get(selected[0])
        const s2 = localSimulations.get(selected[1])
        const simA = s1?.resultado?.resultados_count || {}
        const simB = s2?.resultado?.resultados_count || {}
        setComparacion({
          simulacion_actual: simA,
          simulacion_mejorada: simB,
        })
      } else {
        const res = await apiService.compararEscenarios({
          estado_critico: 'S10',
          reduccion_abandono: 0.2,
        })
        setComparacion(res.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : (prev.length < 2 ? [...prev, id] : prev)
      localStorage.setItem('selectedComparisons', JSON.stringify(next))
      return next
    })
  }

  const chartData = comparacion ? [
    {
      name: 'Escenario Actual',
      Éxito: comparacion.simulacion_actual?.['Éxito'] ?? 0,
      Abandono: comparacion.simulacion_actual?.['Abandono'] ?? 0,
      Error: comparacion.simulacion_actual?.['Error'] ?? 0,
    },
    {
      name: 'Escenario Mejorado',
      Éxito: comparacion.simulacion_mejorada?.['Éxito'] ?? 0,
      Abandono: comparacion.simulacion_mejorada?.['Abandono'] ?? 0,
      Error: comparacion.simulacion_mejorada?.['Error'] ?? 0,
    }
  ] : []

  const mejoraExitosos = comparacion
    ? (comparacion.simulacion_mejorada?.['Éxito'] ?? 0) - (comparacion.simulacion_actual?.['Éxito'] ?? 0)
    : 0

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-slate-900">Comparación de Escenarios</h1>
        <p className="text-slate-600 mt-2">Analiza el impacto de mejoras propuestas</p>
      </motion.div>

      {/* If there are saved simulations, allow selecting two to compare */}
      {savedList.length > 0 && (
        <div className="card-premium p-4">
          <h3 className="text-sm font-semibold mb-2">Comparar simulaciones guardadas</h3>
          <p className="text-xs text-slate-500 mb-3">Selecciona hasta 2 simulaciones del historial</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedList.map(s => (
              <label key={s.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} />
                  <div>
                    <div className="text-sm font-medium">Sim {new Date(s.timestamp).toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Usuarios: {s.params?.numUsuarios} • Pasos: {s.params?.maxPasos}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">ID: {String(s.id).slice(-6)}</div>
              </label>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComparar}
              disabled={loading || selected.length !== 2}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Comparando...' : `Comparar seleccionadas (${selected.length}/2)`}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSelected([]); localStorage.removeItem('selectedComparisons') }}
              className="btn-outline"
            >
              Limpiar selección
            </motion.button>
          </div>
        </div>
      )}

      {/* Fallback: run server-side comparison */}
      {savedList.length === 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleComparar}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Comparando...' : 'Ejecutar Comparación'}
        </motion.button>
      )}

      {comparacion && (
        <div className="space-y-6">
          {/* Chart */}
          <motion.div className="card-premium">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Resultados Comparativos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Éxito" fill="#2A9D8F" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Abandono" fill="#E76F51" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Error" fill="#F4A261" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Métricas */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div className="card-premium">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Escenario Actual</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">Exitosos</p>
                  <p className="text-2xl font-bold text-green-900">{comparacion.simulacion_actual?.['Éxito'] ?? 0}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">Abandonos</p>
                  <p className="text-2xl font-bold text-red-900">{comparacion.simulacion_actual?.['Abandono'] ?? 0}</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="card-premium">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Escenario Mejorado</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">Exitosos</p>
                  <p className="text-2xl font-bold text-green-900">{comparacion.simulacion_mejorada?.['Éxito'] ?? 0}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">Abandonos</p>
                  <p className="text-2xl font-bold text-red-900">{comparacion.simulacion_mejorada?.['Abandono'] ?? 0}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mejora */}
          {mejoraExitosos > 0 && (
            <motion.div className="card-premium border-2 border-green-200 bg-green-50">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-green-600" size={32} />
                <div>
                  <h3 className="text-lg font-bold text-green-900">Mejora Potencial</h3>
                  <p className="text-green-700">
                    Incremento de {mejoraExitosos.toFixed(2)} puntos porcentuales en éxito
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
