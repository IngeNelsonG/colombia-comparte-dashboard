import { useState, useEffect } from 'react'
import { Zap, TrendingUp, AlertCircle, CheckCircle, Download, Trash2, X } from 'lucide-react'
import { apiService } from '../services/api'
import { useSimulationStore } from '../store'
import EstadoSelect from '../components/EstadoSelect'
import localSimulations from '../services/localSimulations'
import toast from '../services/toast'

export default function Simulacion() {
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const params = useSimulationStore()

  const handleSimular = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiService.simular({
        num_usuarios: params.numUsuarios,
        max_pasos: params.maxPasos,
        estado_inicial: params.estadoInicial,
        seed: params.seed,
      })
      setResultado(res.data)
      // Auto-save result to local cache so it persists without a backend
      try {
        const sim = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          params: {
            numUsuarios: params.numUsuarios,
            maxPasos: params.maxPasos,
            estadoInicial: params.estadoInicial,
            seed: params.seed,
          },
          resultado: res.data,
        }
        localSimulations.save(sim)
        loadSaved() // refresh list
        toast.show('Simulación guardada en caché', 'success')
      } catch (e) {
        console.error('Auto-save failed', e)
        toast.show('No se pudo guardar la simulación localmente', 'error')
      }
    } catch (err) {
      setError('Error al ejecutar la simulación. Verifica los parámetros.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Local saved simulations
  const [savedList, setSavedList] = useState([])
  const [selectedForCompare, setSelectedForCompare] = useState([])
  const [estadoNombres, setEstadoNombres] = useState({})
  const [selectedFrequentRoute, setSelectedFrequentRoute] = useState(null)

  function loadSaved() {
    try {
      const list = localSimulations.getAll()
      setSavedList(list)
    } catch (e) {
      console.error('loadSaved error', e)
    }
  }

  useEffect(() => {
    loadSaved()
    const unsubscribe = localSimulations.subscribe(() => {
      loadSaved()
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
      } catch (e) {
        console.error('No se pudieron cargar los nombres de estados', e)
      }
    }

    loadEstados()
  }, [])

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setSelectedFrequentRoute(null)
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const parseRouteCodes = (routeText) => {
    if (!routeText || typeof routeText !== 'string') return []
    return routeText
      .split(/\s*(?:→|->)\s*/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const openFrequentRouteModal = (item) => {
    const codes = parseRouteCodes(item?.recorrido)
    setSelectedFrequentRoute({
      recorrido: item?.recorrido || '',
      frecuencia: item?.frecuencia || 0,
      codes,
    })
  }

  const handleDownload = (sim) => {
    localSimulations.exportSimulation(sim)
  }

  const handleDelete = (id) => {
    localSimulations.remove(id)
  }

  const toggleSelect = (id) => {
    setSelectedForCompare(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : (prev.length < 2 ? [...prev, id] : prev)
      // persist selection for Comparison page
      localStorage.setItem('selectedComparisons', JSON.stringify(next))
      return next
    })
  }

  const handleClearAll = () => {
    localSimulations.clear()
    setSelectedForCompare([])
    toast.show('Historial de simulaciones borrado', 'success')
  }

  const handleExportAll = (type) => {
    if (type === 'json') localSimulations.exportAllJSON()
    else localSimulations.exportAllCSV()
    toast.show('Exportando historial...', 'info')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
          Simulación Markov
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          Configura parámetros y ejecuta simulaciones de navegación de usuarios
        </p>
      </div>

      {/* Main Layout - Improved alignment */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start animate-fade-in">
        
        {/* LEFT: Parámetros */}
        <div className="md:col-span-1">
          <div className="card-base p-6 md:sticky md:top-32">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={24} className="text-brand-600" />
              <h2 className="text-xl font-display font-bold text-slate-900">Parámetros</h2>
            </div>
            
            <div className="space-y-5">
              {/* Num Usuarios */}
              <div>
                <label className="label-text">Número de Usuarios</label>
                <input
                  type="number"
                  value={params.numUsuarios}
                  onChange={(e) => useSimulationStore.setState({ numUsuarios: Math.max(1, parseInt(e.target.value) || 1) })}
                  disabled={loading}
                  className="input-field"
                  min="1"
                  max="10000"
                />
                <p className="text-xs text-slate-500 mt-1">Entre 1 y 10,000</p>
              </div>

              {/* Max Pasos */}
              <div>
                <label className="label-text">Máximo de Pasos</label>
                <input
                  type="number"
                  value={params.maxPasos}
                  onChange={(e) => useSimulationStore.setState({ maxPasos: Math.max(1, parseInt(e.target.value) || 1) })}
                  disabled={loading}
                  className="input-field"
                  min="1"
                  max="1000"
                />
                <p className="text-xs text-slate-500 mt-1">Máximo: 1,000</p>
              </div>

              {/* Estado Inicial - Combo Box */}
              <div>
                <label className="label-text">Estado Inicial</label>
                <EstadoSelect
                  value={params.estadoInicial}
                  onChange={(codigo) => useSimulationStore.setState({ estadoInicial: codigo })}
                  disabled={loading}
                />
                <p className="text-xs text-slate-500 mt-1">Búscalo por código o nombre</p>
              </div>

              {/* Seed */}
              <div>
                <label className="label-text">Seed (Aleatoriedad)</label>
                <input
                  type="number"
                  value={params.seed}
                  onChange={(e) => useSimulationStore.setState({ seed: parseInt(e.target.value) || 0 })}
                  disabled={loading}
                  className="input-field"
                />
                <p className="text-xs text-slate-500 mt-1">0 = aleatorio</p>
              </div>

              {/* Botón */}
              <button
                onClick={handleSimular}
                disabled={loading || !params.estadoInicial}
                className="w-full btn-primary mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Simulando...
                  </span>
                ) : (
                  '⚡ Ejecutar Simulación'
                )}
              </button>

              {/* Historial local */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Historial de simulaciones</h3>
                {savedList.length === 0 ? (
                  <p className="text-xs text-slate-500">Sin simulaciones guardadas aún</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {savedList.map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={selectedForCompare.includes(s.id)} onChange={() => toggleSelect(s.id)} />
                          <div>
                            <div className="text-sm font-medium text-slate-900">Sim {new Date(s.timestamp).toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Usuarios: {s.params?.numUsuarios} • Pasos: {s.params?.maxPasos}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDownload(s)} className="p-2 hover:bg-slate-100 rounded">
                            <Download size={16} />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        localStorage.setItem('selectedComparisons', JSON.stringify(selectedForCompare))
                        toast.show('Seleccionadas guardadas. Abre "Comparar Escenarios" para ejecutar la comparación.', 'info')
                      }}
                      className="btn-outline flex-1 text-sm"
                      disabled={selectedForCompare.length < 2}
                    >
                      Comparar seleccionadas ({selectedForCompare.length}/2)
                    </button>
                    <button onClick={handleClearAll} className="btn-danger text-sm px-3">Borrar todo</button>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleExportAll('json')} className="btn-outline flex-1 text-sm">Exportar todo (JSON)</button>
                    <button onClick={() => handleExportAll('csv')} className="btn-outline text-sm">Exportar CSV</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Resultados */}
        <div className="md:col-span-2">
          <div className="card-base p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={24} className="text-accent-600" />
              <h2 className="text-xl font-display font-bold text-slate-900">Resultados</h2>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-lg mb-6 flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {resultado ? (
              <div className="space-y-6">
                
                {/* Resumen superior - Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Exitosos</p>
                    <p className="text-3xl font-display font-bold text-green-900 mt-2">
                      {resultado.resultados_count?.['Éxito'] ?? 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {((resultado.resultados_count?.['Éxito'] ?? 0) / (resultado.usuarios ?? 1) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Abandonos</p>
                    <p className="text-3xl font-display font-bold text-red-900 mt-2">
                      {resultado.resultados_count?.['Abandono'] ?? 0}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {((resultado.resultados_count?.['Abandono'] ?? 0) / (resultado.usuarios ?? 1) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Errores</p>
                    <p className="text-3xl font-display font-bold text-amber-900 mt-2">
                      {resultado.resultados_count?.['Error'] ?? 0}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {((resultado.resultados_count?.['Error'] ?? 0) / (resultado.usuarios ?? 1) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-accent-700 uppercase tracking-wide">En Seguimiento</p>
                    <p className="text-3xl font-display font-bold text-accent-900 mt-2">
                      {resultado.resultados_count?.['Seguimiento pendiente'] ?? 0}
                    </p>
                    <p className="text-xs text-accent-600 mt-1">
                      {((resultado.resultados_count?.['Seguimiento pendiente'] ?? 0) / (resultado.usuarios ?? 1) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Detalles */}
                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Usuarios Simulados</p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">{resultado.usuarios ?? 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Recorridos Únicos</p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">{resultado.recorridos?.length ?? 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Promedio Pasos</p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">{(resultado.promedio_pasos ?? 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Recorridos Frecuentes */}
                {(resultado.recorridos_frecuentes || []).length > 0 && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle size={18} className="text-brand-600" />
                      Recorridos Más Frecuentes
                    </h3>
                    <div className="space-y-2">
                      {(resultado.recorridos_frecuentes || []).slice(0, 10).map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openFrequentRouteModal(item)}
                          className="w-full text-left flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Ver detalle del recorrido"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-slate-900 truncate">{item.recorrido}</p>
                          </div>
                          <div className="ml-4 flex items-center gap-3 flex-shrink-0">
                            <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full transition-all"
                                style={{ width: `${(item.frecuencia / (resultado.usuarios ?? 1)) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                              {item.frecuencia}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : !error ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Zap size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">No hay resultados todavía</p>
                <p className="text-sm">Configura los parámetros y ejecuta una simulación</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {selectedFrequentRoute && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedFrequentRoute(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900">Detalle del Recorrido</h3>
                <p className="text-sm text-slate-500">Frecuencia: {selectedFrequentRoute.frecuencia}</p>
              </div>
              <button
                onClick={() => setSelectedFrequentRoute(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
                title="Cerrar"
              >
                <X size={18} className="text-slate-700" />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Recorrido</p>
              <p className="text-sm font-mono text-slate-900 break-all">{selectedFrequentRoute.recorrido}</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-3">
              {selectedFrequentRoute.codes.map((code, index) => (
                <div key={`${code}-${index}`} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-mono font-semibold text-brand-700">{code}</span>
                    <span className="text-sm text-slate-400">Paso {index + 1}</span>
                  </div>
                  <p className="text-sm text-slate-800 mt-1">
                    {estadoNombres[code] || 'Nombre de estado no disponible'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
