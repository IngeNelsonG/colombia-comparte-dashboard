import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { apiService } from '../services/api'
import localSimulations from '../services/localSimulations'

export default function MatrizTransicion() {
  const [matrizConteos, setMatrizConteos] = useState(null)
  const [matrizProb, setMatrizProb] = useState(null)
  const [tipo, setTipo] = useState('conteos')
  const [source, setSource] = useState('live')
  const [savedList, setSavedList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatrices = async () => {
      try {
        const [res1, res2] = await Promise.all([
          apiService.getMatrizConteos(),
          apiService.getMatrizProbabilidades(),
        ])
        setMatrizConteos(res1.data)
        setMatrizProb(res2.data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMatrices()
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

  if (loading) return <div>Cargando...</div>

  const toPath = (recorrido) => {
    if (Array.isArray(recorrido)) return recorrido
    if (Array.isArray(recorrido?.estados)) return recorrido.estados
    if (typeof recorrido?.recorrido === 'string') {
      return recorrido.recorrido
        .split(/\s*(?:→|->)\s*/)
        .map((s) => s.trim())
        .filter(Boolean)
    }
    return []
  }

  // If user selects a saved simulation as source, compute matrix from its recorridos
  let matrizActual = tipo === 'conteos' ? matrizConteos : matrizProb
  let data = matrizActual?.matriz || []
  let estados = matrizActual?.estados || []

  if (source !== 'live') {
    const sim = localSimulations.get(source)
    const recorridos = sim?.resultado?.recorridos || []
    // gather unique states in order of appearance
    const stateSet = []
    recorridos.forEach(r => {
      toPath(r).forEach(s => {
        if (s && !stateSet.includes(s)) stateSet.push(s)
      })
    })
    estados = stateSet
    // build counts matrix
    const n = estados.length
    data = Array.from({ length: n }, () => Array.from({ length: n }, () => 0))
    recorridos.forEach(r => {
      const path = toPath(r)
      for (let i = 0; i < path.length - 1; i++) {
        const a = estados.indexOf(path[i])
        const b = estados.indexOf(path[i+1])
        if (a >= 0 && b >= 0) data[a][b] = (data[a][b] || 0) + 1
      }
    })
    if (tipo === 'probabilidades') {
      // normalize rows
      data = data.map(row => {
        const s = row.reduce((sum, v) => sum + v, 0) || 1
        return row.map(v => v / s)
      })
    }
  }

  // Encontrar max value para normalizar colores
  const maxValue = Math.max(...(data.flat().length > 0 ? data.flat() : [1]))

  const getColor = (value) => {
    if (value === 0) return 'bg-slate-50'
    const intensity = value / maxValue
    if (intensity > 0.7) return 'bg-red-600'
    if (intensity > 0.5) return 'bg-orange-500'
    if (intensity > 0.3) return 'bg-yellow-400'
    return 'bg-blue-300'
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-slate-900">Matriz de Transición</h1>
        <p className="text-slate-600 mt-2">Probabilidades y conteos de transición entre estados</p>
      </motion.div>
      <div className="flex items-center gap-4">
        <label className="text-sm text-slate-600">Fuente de datos:</label>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="input-field w-auto">
          <option value="live">Live (API)</option>
          {savedList.map(s => (
            <option key={s.id} value={s.id}>Sim {new Date(s.timestamp).toLocaleString()}</option>
          ))}
        </select>
      </div>

      <div className="card-premium">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTipo('conteos')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              tipo === 'conteos'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Matriz de Conteos
          </button>
          <button
            onClick={() => setTipo('probabilidades')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              tipo === 'probabilidades'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Matriz de Probabilidades
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-2 py-1 text-left font-semibold text-slate-700">De / A</th>
                {estados.map(e => (
                  <th key={e} className="px-2 py-1 text-center font-semibold text-slate-700 bg-slate-100">
                    {e}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estados.map((from, i) => (
                <tr key={from}>
                  <td className="px-2 py-1 font-mono font-semibold bg-slate-100 text-slate-900">{from}</td>
                  {data[i]?.map((value, j) => (
                    <td
                      key={`${i}-${j}`}
                      className={`px-2 py-1 text-center font-mono text-xs border border-slate-200 ${getColor(value)}`}
                    >
                      {typeof value === 'number' ? value.toFixed(tipo === 'probabilidades' ? 3 : 0) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>Información:</strong> {tipo === 'conteos' 
              ? 'Muestra el número de transiciones entre estados en los 60 recorridos base.'
              : 'Muestra la probabilidad normalizada de transición entre cada par de estados.'}
          </p>
        </div>
      </div>
    </div>
  )
}
