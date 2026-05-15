import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { apiService } from '../services/api'
import localSimulations from '../services/localSimulations'

export default function Graficos() {
  const [recorridos, setRecorridos] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedList, setSavedList] = useState([])
  const [source, setSource] = useState('live') // 'live' or simulation id

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.getRecorridos()
        const list = Array.isArray(res.data) ? res.data : (res.data?.recorridos || [])
        setRecorridos(list)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const refreshSaved = () => {
      const list = localSimulations.getAll()
      setSavedList(list)
      setSource((currentSource) => {
        if (currentSource === 'live') return currentSource
        return list.some(s => String(s.id) === String(currentSource)) ? currentSource : 'live'
      })
    }

    refreshSaved()
    const unsubscribe = localSimulations.subscribe(() => {
      refreshSaved()
    })

    return unsubscribe
  }, [])

  const RESULT_BY_FINAL_STATE = {
    S34: 'Seguimiento pendiente',
    S35: 'Abandono',
    S36: 'Error',
    S37: 'Éxito',
  }

  const normalizeRow = (row) => {
    if (Array.isArray(row)) {
      const last = row[row.length - 1]
      return {
        resultado: RESULT_BY_FINAL_STATE[last] || 'Desconocido',
        num_pasos: row.length,
      }
    }

    if (row && typeof row === 'object') {
      if (Array.isArray(row.estados)) {
        const last = row.estados[row.estados.length - 1]
        return {
          resultado: row.resultado || RESULT_BY_FINAL_STATE[last] || 'Desconocido',
          num_pasos: row.num_pasos ?? row.estados.length,
        }
      }

      return {
        resultado: row.resultado || 'Desconocido',
        num_pasos: Number(row.num_pasos) || 0,
      }
    }

    return null
  }

  // Choose dataset depending on selected source
  const rawDataset = useMemo(() => (
    source === 'live'
      ? recorridos
      : (localSimulations.get(source)?.resultado?.recorridos || [])
  ), [source, recorridos])

  const dataset = useMemo(
    () => rawDataset.map(normalizeRow).filter(Boolean),
    [rawDataset]
  )

  // Procesar datos para gráficos
  const resultadosCounts = useMemo(() => dataset.reduce((acc, r) => {
    const idx = acc.findIndex(item => item.name === r.resultado)
    if (idx >= 0) acc[idx].value++
    else acc.push({ name: r.resultado, value: 1 })
    return acc
  }, []), [dataset])

  const pasosData = useMemo(() => dataset.reduce((acc, r) => {
    const pasos = r.num_pasos
    const idx = acc.findIndex(item => item.pasos === pasos)
    if (idx >= 0) acc[idx].count++
    else acc.push({ pasos, count: 1 })
    return acc.sort((a, b) => a.pasos - b.pasos)
  }, []), [dataset])

  const COLORS = ['#2A9D8F', '#E76F51', '#F4A261', '#457B9D']

  if (loading) {
    return (
      <div className="card-base p-8 text-center text-slate-600">Cargando gráficos...</div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-slate-900">Gráficos de Análisis</h1>
        <p className="text-slate-600 mt-2">Visualización de datos y patrones de los recorridos</p>
      </motion.div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-slate-600">Fuente de datos:</label>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="input-field w-auto">
          <option value="live">Live (API recorridos)</option>
          {savedList.map(s => (
            <option key={s.id} value={s.id}>Sim {new Date(s.timestamp).toLocaleString()}</option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart - Resultados */}
        <motion.div className="card-premium">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribución de Resultados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={resultadosCounts}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {resultadosCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart - Distribución de Pasos */}
        <motion.div className="card-premium">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribución de Pasos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pasosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pasos" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#457B9D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Estadísticas */}
        <motion.div className="card-premium lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Estadísticas Generales</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Total Recorridos</p>
              <p className="text-2xl font-bold text-slate-900">{dataset.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Promedio Pasos</p>
              <p className="text-2xl font-bold text-slate-900">
                {dataset.length > 0 ? (dataset.reduce((sum, r) => sum + r.num_pasos, 0) / dataset.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Pasos Mínimos</p>
              <p className="text-2xl font-bold text-slate-900">
                {dataset.length > 0 ? Math.min(...dataset.map(r => r.num_pasos)) : 0}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Pasos Máximos</p>
              <p className="text-2xl font-bold text-slate-900">
                {dataset.length > 0 ? Math.max(...dataset.map(r => r.num_pasos)) : 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {dataset.length === 0 && (
        <div className="card-base p-8 text-center text-slate-600">
          No hay datos para la fuente seleccionada.
        </div>
      )}
    </div>
  )
}
