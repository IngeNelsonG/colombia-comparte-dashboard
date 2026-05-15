import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiService } from '../services/api'
import { AlertTriangle } from 'lucide-react'
import localSimulations from '../services/localSimulations'

export default function Diagnostico() {
  const [diagnostico, setDiagnostico] = useState(null)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('live')
  const [savedList, setSavedList] = useState([])
  const [estadoNombres, setEstadoNombres] = useState({})

  const FINAL_STATES = ['S34', 'S35', 'S36', 'S37']

  const refreshSaved = () => {
    const list = localSimulations.getAll()
    setSavedList(list)
    setSource((currentSource) => {
      if (currentSource === 'live') return currentSource
      return list.some((s) => String(s.id) === String(currentSource)) ? currentSource : 'live'
    })
  }

  useEffect(() => {
    refreshSaved()
    const unsubscribe = localSimulations.subscribe(() => {
      refreshSaved()
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const loadEstados = async () => {
      try {
        const res = await apiService.getEstados()
        const map = {}
        ;(res.data || []).forEach((estado) => {
          map[estado.codigo] = estado.nombre
        })
        setEstadoNombres(map)
      } catch (error) {
        console.error('No se pudieron cargar nombres de estados', error)
      }
    }

    loadEstados()
  }, [])

  const generarCausa = (nombreEstado = '') => {
    const txt = nombreEstado.toLowerCase()
    if (txt.includes('formulario')) return 'Posible fricción en diligenciamiento: campos extensos, validaciones poco claras o falta de guía.'
    if (txt.includes('pago')) return 'Posible fricción en el flujo de pago: desconfianza, pasos extra o errores técnicos.'
    if (txt.includes('contacto') || txt.includes('sesión') || txt.includes('login')) return 'Posible fricción en autenticación o contacto: barreras para continuar el proceso.'
    return 'Se observa fricción de navegación en este punto del recorrido, afectando la continuidad del usuario.'
  }

  const generarMejora = (nombreEstado = '') => {
    const txt = nombreEstado.toLowerCase()
    if (txt.includes('formulario')) return 'Simplificar el formulario, dividir en pasos y agregar ayudas contextuales por campo.'
    if (txt.includes('pago')) return 'Reducir pasos de pago, reforzar señales de confianza y ofrecer alternativas de pago.'
    if (txt.includes('contacto') || txt.includes('sesión') || txt.includes('login')) return 'Reducir fricción de acceso, habilitar rutas rápidas y mejorar mensajes de apoyo.'
    return 'Rediseñar este punto con un CTA más claro, mejor jerarquía visual y reducción de pasos innecesarios.'
  }

  const normalizarRecorrido = (row) => {
    if (Array.isArray(row)) return row
    if (Array.isArray(row?.estados)) return row.estados
    if (typeof row?.recorrido === 'string') {
      return row.recorrido
        .split(/\s*(?:→|->)\s*/)
        .map((s) => s.trim())
        .filter(Boolean)
    }
    return []
  }

  const calcularDiagnosticoLocal = (recorridosRaw) => {
    const recorridos = (recorridosRaw || []).map(normalizarRecorrido).filter((r) => r.length > 1)
    if (recorridos.length === 0) return null

    const prevAbandono = {}
    let abandonosTotales = 0

    recorridos.forEach((r) => {
      const last = r[r.length - 1]
      if (last === 'S35' && r.length >= 2) {
        abandonosTotales += 1
        const prev = r[r.length - 2]
        prevAbandono[prev] = (prevAbandono[prev] || 0) + 1
      }
    })

    let estadoCritico = null
    let maxCount = -1
    Object.entries(prevAbandono).forEach(([estado, count]) => {
      if (count > maxCount) {
        estadoCritico = estado
        maxCount = count
      }
    })

    if (!estadoCritico) {
      const visitCount = {}
      recorridos.forEach((r) => {
        r.forEach((estado) => {
          if (!FINAL_STATES.includes(estado)) {
            visitCount[estado] = (visitCount[estado] || 0) + 1
          }
        })
      })
      Object.entries(visitCount).forEach(([estado, count]) => {
        if (count > maxCount) {
          estadoCritico = estado
          maxCount = count
        }
      })
    }

    if (!estadoCritico) return null

    let transicionesDesdeEstado = 0
    let transicionesAbandono = 0

    recorridos.forEach((r) => {
      for (let i = 0; i < r.length - 1; i++) {
        if (r[i] === estadoCritico) {
          transicionesDesdeEstado += 1
          if (r[i + 1] === 'S35') {
            transicionesAbandono += 1
          }
        }
      }
    })

    const nombreEstado = estadoNombres[estadoCritico] || estadoCritico
    const prob = transicionesDesdeEstado > 0 ? transicionesAbandono / transicionesDesdeEstado : 0
    const cantidadAbandonos = prevAbandono[estadoCritico] || 0
    const porcentajeAbandono = abandonosTotales > 0 ? (cantidadAbandonos / abandonosTotales) * 100 : 0

    return {
      estado_critico: estadoCritico,
      nombre_estado: nombreEstado,
      probabilidad_abandono: prob,
      cantidad_abandonos: cantidadAbandonos,
      porcentaje_abandono: porcentajeAbandono,
      causa: generarCausa(nombreEstado),
      mejora: generarMejora(nombreEstado),
      indicador: `Base local: ${recorridos.length} recorridos analizados`,
    }
  }

  const handleAnalizar = async () => {
    setLoading(true)
    try {
      if (source === 'live') {
        const res = await apiService.getDiagnostico({
          num_usuarios: 1000,
          max_pasos: 30,
        })
        setDiagnostico(res.data)
      } else {
        const sim = localSimulations.get(source)
        const local = calcularDiagnosticoLocal(sim?.resultado?.recorridos || [])
        setDiagnostico(local)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-slate-900">Diagnóstico</h1>
        <p className="text-slate-600 mt-2">Identifica estados críticos y oportunidades de mejora</p>
      </motion.div>

      <div className="card-base p-4 sm:p-6">
        <label className="label-text">Fuente de datos</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="input-field"
        >
          <option value="live">Live (simulación API)</option>
          {savedList.map((s) => (
            <option key={s.id} value={s.id}>
              Sim {new Date(s.timestamp).toLocaleString()} - {s.params?.numUsuarios || 0} usuarios
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-2">
          Selecciona una simulación guardada para un diagnóstico personalizado por dataset.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAnalizar}
        disabled={loading}
        className="btn-primary disabled:opacity-50"
      >
        {loading ? 'Analizando...' : 'Ejecutar Diagnóstico'}
      </motion.button>

      {!loading && diagnostico === null && source !== 'live' && (
        <div className="card-base p-4 text-sm text-slate-600">
          No se pudo generar diagnóstico con la fuente seleccionada. Verifica que la simulación tenga recorridos.
        </div>
      )}

      {diagnostico && (
        <div className="space-y-6">
          {/* Estado Crítico */}
          <motion.div className="card-premium border-2 border-red-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={32} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">Estado Crítico</h3>
                <p className="text-3xl font-bold text-red-700 mb-2">{diagnostico.estado_critico}</p>
                <p className="text-red-600 mb-4">{diagnostico.nombre_estado}</p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">Tasa de Abandono</p>
                    <p className="text-2xl font-bold text-red-900">{(diagnostico.probabilidad_abandono * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700">Usuarios Afectados</p>
                    <p className="text-2xl font-bold text-orange-900">{diagnostico.cantidad_abandonos}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">Impacto Potencial</p>
                    <p className="text-2xl font-bold text-yellow-900">{(diagnostico.porcentaje_abandono || 0).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Análisis */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div className="card-premium">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Causa Raíz</h3>
              <p className="text-slate-700">{diagnostico.causa}</p>
            </motion.div>

            <motion.div className="card-premium">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Recomendación</h3>
              <p className="text-slate-700">{diagnostico.mejora}</p>
            </motion.div>
          </div>

          {/* Indicadores */}
          <motion.div className="card-premium">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Indicadores de Desempeño</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Indicador 1</span>
                <span className="text-slate-900 font-semibold">{diagnostico.indicador}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
