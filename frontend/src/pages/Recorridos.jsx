import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { Search, Navigation, Footprints, X } from 'lucide-react'
import localSimulations from '../services/localSimulations'

export default function Recorridos() {
  const [recorridos, setRecorridos] = useState([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecorridos = async () => {
      try {
        const res = await apiService.getRecorridos()
        setRecorridos(res.data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecorridos()
  }, [])

  const recorridosFiltrados = recorridos.filter(r =>
    (r.perfil || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (r.objetivo || '').toLowerCase().includes(filtro.toLowerCase())
  )

  const [estadoNombres, setEstadoNombres] = useState({})
  const [selectedRoute, setSelectedRoute] = useState(null)

  useEffect(() => {
    const loadEstados = async () => {
      try {
        const res = await apiService.getEstados()
        const map = {}
          ; (res.data || []).forEach(e => { map[e.codigo] = e.nombre })
        setEstadoNombres(map)
      } catch (e) {
        console.error('Error loading estados', e)
      }
    }
    loadEstados()
  }, [])

  const parseRouteCodes = (r) => {
    if (!r) return []
    if (Array.isArray(r)) return r
    if (Array.isArray(r.estados)) return r.estados
    if (typeof r.recorrido === 'string') return r.recorrido.split(/\s*(?:→|->)\s*/).map(s => s.trim()).filter(Boolean)
    return []
  }

  const openRouteModal = (r) => {
    const codes = parseRouteCodes(r)
    setSelectedRoute({ raw: r, codes })
  }

  const coloresResultado = {
    'Éxito': { bg: 'from-green-50 to-green-100', badge: 'bg-green-100 text-green-700', text: 'text-green-700' },
    'Abandono': { bg: 'from-red-50 to-red-100', badge: 'bg-red-100 text-red-700', text: 'text-red-700' },
    'Error': { bg: 'from-orange-50 to-orange-100', badge: 'bg-orange-100 text-orange-700', text: 'text-orange-700' },
    'Seguimiento pendiente': { bg: 'from-amber-50 to-amber-100', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-700' },
  }

  const stats = {
    totalRecorridos: recorridos.length,
    promedioPasos: recorridos.length > 0 ? (recorridos.reduce((sum, r) => sum + r.num_pasos, 0) / recorridos.length).toFixed(1) : 0,
    exitosos: recorridos.filter(r => r.resultado === 'Éxito').length,
    abandonos: recorridos.filter(r => r.resultado === 'Abandono').length,
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
          Recorridos Base
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          Análisis de {stats.totalRecorridos} user journeys reales documentados
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Recorridos</p>
          <p className="text-3xl sm:text-4xl font-display font-bold text-blue-900 mt-2">{stats.totalRecorridos}</p>
        </div>
        <div className="card-base p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Promedio Pasos</p>
          <p className="text-3xl sm:text-4xl font-display font-bold text-green-900 mt-2">{stats.promedioPasos}</p>
        </div>
        <div className="card-base p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Exitosos</p>
          <p className="text-3xl sm:text-4xl font-display font-bold text-green-900 mt-2">{stats.exitosos}</p>
        </div>
        <div className="card-base p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Abandonos</p>
          <p className="text-3xl sm:text-4xl font-display font-bold text-red-900 mt-2">{stats.abandonos}</p>
        </div>
      </div>

      {/* Search */}

      <div className="card-base p-4 sm:p-6">
        <div className="relative w-full">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
            aria-hidden="true"
          />

          <input
            type="text"
            placeholder="Buscar por perfil u objetivo..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-field w-full !pl-12 pr-4"
          />
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-slate-600 px-2">
        Mostrando <strong>{recorridosFiltrados.length}</strong> de <strong>{stats.totalRecorridos}</strong> recorridos
      </div>

      {/* Recorridos Grid */}
      <div className="space-y-4">
        {recorridosFiltrados.map((r, idx) => {
          const colors = coloresResultado[r.resultado] || { bg: 'from-slate-50 to-slate-100', badge: 'bg-slate-100 text-slate-700', text: 'text-slate-700' }

          return (
            <div key={r.id} className={`card-base bg-gradient-to-r ${colors.bg} p-4 sm:p-6 hover:shadow-md transition-all border-l-4 border-brand-500`}>
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-mono font-bold text-sm text-slate-900 bg-white px-3 py-1 rounded">
                      #{r.id}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                      {r.resultado}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">
                      {r.perfil}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Objetivo: <span className="font-medium text-slate-900">{r.objetivo}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm sm:text-right flex-shrink-0">
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wide">Pasos</p>
                    <p className="text-2xl font-display font-bold text-slate-900">{r.num_pasos}</p>
                  </div>
                </div>
              </div>

              {/* Estados / Path (clickable to open modal) */}
              {(r.estados && r.estados.length > 0) || r.recorrido ? (
                <div className="pt-4 border-t border-slate-200 border-opacity-50">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Ruta:</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {(r.estados || r.recorrido?.split(/\s*(?:→|->)\s*/)).slice(0, 6).map((estado, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="px-2 py-1 bg-white bg-opacity-60 text-slate-700 rounded text-xs font-mono font-semibold hover:bg-opacity-100 transition-all">
                            {estado}
                          </span>
                          {i < Math.min((r.estados || r.recorrido.split(/\s*(?:→|->)\s*/)).length, 6) - 1 && (
                            <span className="text-slate-400 text-xs">→</span>
                          )}
                        </div>
                      ))}
                      {((r.estados || r.recorrido?.split(/\s*(?:→|->)\s*/))?.length > 6) && (
                        <span className="text-xs text-slate-500 ml-2">... <button onClick={() => openRouteModal(r)} className="underline">Ver</button></span>
                      )}
                    </div>
                    <div>
                      <button onClick={() => openRouteModal(r)} className="text-xs text-slate-600 underline">Ver detalle</button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {recorridosFiltrados.length === 0 && (
        <div className="card-base p-12 text-center">
          <Navigation size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">No se encontraron recorridos</p>
          <p className="text-sm text-slate-500 mt-1">Intenta con otro término de búsqueda</p>
        </div>
      )}

      {selectedRoute && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedRoute(null)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900">Detalle del Recorrido</h3>
                <p className="text-sm text-slate-500">Ruta completa y nombres de estados</p>
              </div>
              <button onClick={() => setSelectedRoute(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
              {selectedRoute.codes.map((code, i) => (
                <div key={`${code}-${i}`} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-mono font-semibold text-brand-700">{code}</span>
                    <span className="text-sm text-slate-400">Paso {i + 1}</span>
                  </div>
                  <p className="text-sm text-slate-800 mt-1">{estadoNombres[code] || 'Nombre no disponible'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
