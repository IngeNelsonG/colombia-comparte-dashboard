import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import localSimulations from '../services/localSimulations'
import KPICard from '../components/KPICard'
import { BarChart3, Database, TrendingUp, Users, Zap, Target } from 'lucide-react'

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [estadosRes, recorridosRes] = await Promise.all([
          apiService.getEstados(),
          apiService.getRecorridos(),
        ])
        const estados = estadosRes.data || []
        const recorridos = recorridosRes.data || []
        const exitosos = recorridos.filter((r) => r.resultado === 'Éxito').length
        const tasaExito = recorridos.length > 0 ? (exitosos / recorridos.length) * 100 : 0
        
        setStats({
          totalEstados: estados.length,
          totalRecorridos: recorridos.length,
          estadosFinales: estados.filter((e) => e.es_final).length,
          tasaExito,
        })
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const quickLinks = [
    { id: 'estados', title: 'Estados', subtitle: 'Ver todos los estados', color: 'brand' },
    { id: 'recorridos', title: 'Recorridos', subtitle: 'Explorar base de datos', color: 'accent' },
    { id: 'simulacion', title: 'Simular', subtitle: 'Ejecutar simulaciones', color: 'success' },
    { id: 'diagnostico', title: 'Diagnóstico', subtitle: 'Análisis de problemas', color: 'warning' },
  ]

  // Data source selection (live or saved simulation)
  const [source, setSource] = useState('live')
  const [savedList, setSavedList] = useState([])
  const [dataset, setDataset] = useState([])
  const [profileFilter, setProfileFilter] = useState('')
  const [resultFilter, setResultFilter] = useState('')

  useEffect(() => {
    const refreshSaved = () => {
      const list = localSimulations.getAll()
      setSavedList(list)
      setSource((cur) => (cur === 'live' ? cur : (list.some(s => String(s.id) === String(cur)) ? cur : 'live')))
    }
    refreshSaved()
    const unsub = localSimulations.subscribe(() => refreshSaved())
    return unsub
  }, [])

  useEffect(() => {
    const load = async () => {
      if (source === 'live') {
        try {
          const res = await apiService.getRecorridos()
          setDataset(res.data || [])
        } catch (e) {
          console.error(e)
          setDataset([])
        }
      } else {
        const sim = localSimulations.get(source)
        const recs = (sim?.resultado?.recorridos || []).map(r => {
          // normalize to object shape if array
          if (Array.isArray(r)) return { id: '', perfil: 'N/A', objetivo: '', estados: r, resultado: (r[r.length-1] === 'S37' ? 'Éxito' : r[r.length-1] === 'S35' ? 'Abandono' : 'Desconocido'), num_pasos: r.length }
          return r
        })
        setDataset(recs)
      }
    }
    load()
  }, [source])

  const profiles = Array.from(new Set(dataset.map(d => d.perfil).filter(Boolean)))
  const results = Array.from(new Set(dataset.map(d => d.resultado).filter(Boolean)))

  const filteredDataset = dataset.filter(d => {
    if (profileFilter && d.perfil !== profileFilter) return false
    if (resultFilter && d.resultado !== resultFilter) return false
    return true
  })

  const sourceInfo = (() => {
    if (source === 'live') return 'Live API'
    const selected = savedList.find((s) => String(s.id) === String(source))
    if (!selected?.timestamp) return 'fuente seleccionada'
    return `simulación ${new Date(selected.timestamp).toLocaleString()}`
  })()

  const sourceStats = (() => {
    const total = dataset.length
    const exitosos = filteredDataset.filter((r) => r.resultado === 'Éxito').length
    const tasaExito = total > 0 ? (exitosos / total) * 100 : 0

    return { total, exitosos, tasaExito }
  })()

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card-base p-8 sm:p-10">
          <div className="h-8 w-56 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="h-4 w-80 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="card-base p-6 border border-slate-200">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 rounded-2xl p-8 sm:p-12 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-2">
              Simulación Markov
            </h1>
            <p className="text-brand-50 text-sm sm:text-base lg:text-lg">
              Análisis en tiempo real del comportamiento de usuarios en Colombia Comparte
            </p>
          </div>
          <div className="flex-shrink-0 hidden sm:block">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="text-brand-50 text-xs font-semibold uppercase tracking-wide">
            {stats?.totalEstados || 0} Estados
          </div>
          <div className="text-brand-50 text-xs font-semibold uppercase tracking-wide">
            {sourceStats.total} Recorridos
          </div>
          <div className="text-brand-50 text-xs font-semibold uppercase tracking-wide">
            {sourceStats.tasaExito.toFixed(1)}% Tasa Éxito
          </div>
        </div>
      </div>

      {/* Resumen Operativo */}
      <div className="card-base p-6 sm:p-8 border border-slate-200">
        <h2 className="text-lg font-display font-bold text-slate-900 mb-4">Resumen Operativo</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Abandono Base</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-2">{(100 - sourceStats.tasaExito).toFixed(1)}%</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cobertura de Estados Finales</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-2">{sourceStats.exitosos} / {sourceStats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data Set Base</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-2">{sourceStats.total} recorridos</p>
          </div>
        </div>

          {/* Filters and dataset controls */}
          <div className="card-base p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600 mr-2">Fuente:</label>
                <select value={source} onChange={(e) => setSource(e.target.value)} className="input-field w-48">
                  <option value="live">Live API</option>
                  {savedList.map(s => (
                    <option key={s.id} value={s.id}>Sim {new Date(s.timestamp).toLocaleString()}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">Perfil:</label>
                <select value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)} className="input-field w-48">
                  <option value="">Todos</option>
                  {profiles.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <label className="text-sm text-slate-600">Resultado:</label>
                <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className="input-field w-48">
                  <option value="">Todos</option>
                  {results.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600 min-h-[28px]">
              {dataset.length > 0 && (
                <div>
                  Mostrando <strong>{filteredDataset.length}</strong> de <strong>{dataset.length}</strong> recorridos de <strong>{sourceInfo}</strong> tras aplicar filtros
                </div>
              )}
            </div>
          </div>
        
          {/* Recent simulations */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Simulaciones recientes</h3>
            {savedList.length === 0 ? (
              <p className="text-xs text-slate-500">No hay simulaciones guardadas</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedList.slice(0,6).map(s => (
                  <div key={s.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900">Sim {new Date(s.timestamp).toLocaleString()}</div>
                      <div className="text-xs text-slate-500">Usuarios: {s.params?.numUsuarios} • Pasos: {s.params?.maxPasos}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSource(s.id)} className="text-xs text-slate-600 hover:underline">Usar</button>
                      <button onClick={() => onNavigate?.('recorridos') } className="text-xs text-slate-600 hover:underline">Ver</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Total de Estados"
          value={stats?.totalEstados || 0}
          unit="en simulación"
          icon={Database}
          color="brand"
        />
        <KPICard
          title="Recorridos Base"
          value={stats?.totalRecorridos || 0}
          unit="journeys"
          icon={TrendingUp}
          color="accent"
        />
        <KPICard
          title="Estados Finales"
          value={stats?.estadosFinales || 0}
          unit="terminales"
          icon={Target}
          color="success"
        />
        <KPICard
          title="Tasa de Éxito"
          value={`${sourceStats.tasaExito.toFixed(1)}%`}
          unit="usuarios"
          icon={Users}
          color="warning"
        />
      </div>

      {/* Info Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        
        {/* Qué es esta plataforma */}
        <div className="card-base p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center">
              <BarChart3 className="text-brand-600" size={24} />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">
              Sobre el Proyecto
            </h2>
          </div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Dashboard interactivo para simular y analizar el recorrido de usuarios en la plataforma 
            <strong> Colombia Comparte</strong> utilizando cadenas de Márkov. Visualiza patrones de navegación, 
            identifica estados críticos y optimiza rutas de usuario.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-brand-600 font-bold mt-1">•</span>
              <span><strong>38 Estados</strong> que representan cada paso del user journey</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-600 font-bold mt-1">•</span>
              <span><strong>60 Recorridos</strong> únicos basados en perfiles y objetivos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-600 font-bold mt-1">•</span>
              <span><strong>Simulaciones</strong> para validar comportamientos</span>
            </li>
          </ul>
        </div>

        {/* Funcionalidades clave */}
        <div className="card-base p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
              <Zap className="text-accent-600" size={24} />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">
              Funcionalidades
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Simulación Avanzada</h3>
              <p className="text-xs text-slate-600">Parametriza usuarios, pasos máximos y estado inicial con búsqueda de estados</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Diagnóstico Inteligente</h3>
              <p className="text-xs text-slate-600">Identifica cuellos de botella y estados con alto abandono</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Análisis Visual</h3>
              <p className="text-xs text-slate-600">Gráficos interactivos de resultados, matrices de transición y recorridos</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Comparación de escenarios</h3>
              <p className="text-xs text-slate-600">Compara impacto de mejoras en reducción de abandonos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card-base p-6 sm:p-8">
        <h2 className="text-lg font-display font-bold text-slate-900 mb-6">Acceso Rápido</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate?.(link.id)}
              className={`p-4 rounded-lg border-2 border-slate-200 transition-all text-left hover:shadow-sm ${
                link.color === 'brand'
                  ? 'hover:border-brand-500 hover:bg-brand-50'
                  : link.color === 'accent'
                    ? 'hover:border-accent-500 hover:bg-accent-50'
                    : link.color === 'success'
                      ? 'hover:border-green-500 hover:bg-green-50'
                      : 'hover:border-amber-500 hover:bg-amber-50'
              }`}
            >
              <p className="font-semibold text-slate-900 mb-1">{link.title}</p>
              <p className="text-xs text-slate-600">{link.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-slate-500 py-4 border-t border-slate-200">
        <p>Proyecto Integrador • Alarcón, Silva y González • v1.0.0</p>
      </div>
    </div>
  )
}
