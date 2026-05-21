import { useState, useEffect, useMemo } from 'react'
import { apiService } from '../services/api'
import { Search, MapPin, Filter, CheckCircle2, Circle } from 'lucide-react'

export default function Estados() {
  const [estados, setEstados] = useState([])
  const [filtro, setFiltro] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await apiService.getEstados()
        setEstados(res.data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEstados()
  }, [])

  const estadosFiltrados = useMemo(() => estados.filter(e => {
    const matchesBusqueda = (e.codigo || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (e.nombre || '').toLowerCase().includes(filtro.toLowerCase())
    const matchesTipo = !tipoFiltro || e.tipo === tipoFiltro
    return matchesBusqueda && matchesTipo
  }), [estados, filtro, tipoFiltro])

  const tiposUnicos = useMemo(
    () => [...new Set(estados.map(e => e.tipo))].sort(),
    [estados]
  )

  const conteoPorTipo = useMemo(() => {
    const map = {}
    estados.forEach((e) => {
      map[e.tipo] = (map[e.tipo] || 0) + 1
    })
    return map
  }, [estados])

  const finalesPorTipo = useMemo(() => {
    const map = {}
    estados.forEach((e) => {
      if (e.es_final) {
        map[e.tipo] = (map[e.tipo] || 0) + 1
      }
    })
    return map
  }, [estados])

  const colorByType = {
    'Inicial': { bg: 'from-green-50 to-green-100', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
    'Exploración': { bg: 'from-blue-50 to-blue-100', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    'Formulario': { bg: 'from-purple-50 to-purple-100', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
    'Pago': { bg: 'from-amber-50 to-amber-100', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    'Final': { bg: 'from-red-50 to-red-100', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  }

  const getCategoriaEvaluativa = (estado) => {
    const codigo = estado.codigo
    const tipo = estado.tipo || ''
    const nombre = `${estado.nombre || ''} ${estado.descripcion || ''}`.toLowerCase()

    if (tipo === 'Inicial') return 'Inicial'

    if (codigo === 'S37' || nombre.includes('éxito') || nombre.includes('exito')) {
      return 'Final exitoso'
    }

    if (codigo === 'S35' || nombre.includes('abandono')) {
      return 'Final negativo'
    }

    if (codigo === 'S36' || nombre.includes('error')) {
      return 'Error'
    }

    if (
      codigo === 'S34' ||
      nombre.includes('seguimiento') ||
      nombre.includes('pendiente')
    ) {
      return 'Seguimiento'
    }

    return 'Intermedio'
  }

  const getColorCategoriaEvaluativa = (categoria) => {
    const colores = {
      Inicial: 'bg-green-100 text-green-700',
      Intermedio: 'bg-slate-100 text-slate-700',
      'Final exitoso': 'bg-emerald-100 text-emerald-700',
      'Final negativo': 'bg-red-100 text-red-700',
      Error: 'bg-amber-100 text-amber-700',
      Seguimiento: 'bg-blue-100 text-blue-700',
    }

    return colores[categoria] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
          Estados de Navegación
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          {estados.length} estados que representan los pasos en el user journey
        </p>
      </div>

      {/* Search & Filter */}
      <div className="card-base p-4 sm:p-6 space-y-4">
        <div className="relative w-full">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
            aria-hidden="true"
          />

          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="input-field w-full pl-12 pr-4"
          />
        </div>

        {/* Tipo Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTipoFiltro('')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${!tipoFiltro ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            <Filter size={16} className="inline mr-2" />
            Todos
          </button>
          {tiposUnicos.map(tipo => (
            <button
              key={tipo}
              onClick={() => setTipoFiltro(tipoFiltro === tipo ? '' : tipo)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${tipoFiltro === tipo
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {tipo} ({conteoPorTipo[tipo] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-slate-600 px-2">
        Mostrando <strong>{estadosFiltrados.length}</strong> de <strong>{estados.length}</strong> estados
      </div>

      {/* Estados Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {estadosFiltrados.map(estado => {
          const colors = colorByType[estado.tipo] || { bg: 'from-slate-50 to-slate-100', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700' }

          return (
            <div
              key={estado.codigo}
              className={`card-base p-4 sm:p-6 bg-gradient-to-br ${colors.bg} border-l-4 border-brand-500 hover:shadow-md transition-all`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-bold text-lg sm:text-xl text-slate-900 truncate">
                    {estado.codigo}
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 mt-1 line-clamp-2">
                    {estado.nombre}
                  </p>
                </div>
                {estado.es_final ? (
                  <CheckCircle2 size={24} className="text-red-600 flex-shrink-0 mt-1" />
                ) : (
                  <Circle size={24} className="text-slate-300 flex-shrink-0 mt-1" />
                )}
              </div>

              {/* Badges */}

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                  Tipo interno: {estado.tipo}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getColorCategoriaEvaluativa(getCategoriaEvaluativa(estado))}`}
                >
                  Categoría evaluativa: {getCategoriaEvaluativa(estado)}
                </span>

                {estado.es_final && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    Estado Final
                  </span>
                )}
              </div>

              {/* Description */}
              {estado.descripcion && (
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3">
                  {estado.descripcion}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {estadosFiltrados.length === 0 && (
        <div className="card-base p-12 text-center">
          <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">No se encontraron estados</p>
          <p className="text-sm text-slate-500 mt-1">Intenta con otro término de búsqueda o filtro</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {tiposUnicos.map(tipo => (
          <div key={tipo} className="card-base p-4 sm:p-6 bg-gradient-to-br from-white to-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{tipo}</p>
            <p className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-3">
              {conteoPorTipo[tipo] || 0}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {finalesPorTipo[tipo] || 0} finales
            </p>
          </div>
        ))}
        <div className="card-base p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Estados Finales</p>
          <p className="text-2xl sm:text-3xl font-display font-bold text-red-900 mt-3">
            {estados.filter(e => e.es_final).length}
          </p>
          <p className="text-xs text-red-600 mt-2">terminales</p>
        </div>
      </div>
    </div>
  )
}
