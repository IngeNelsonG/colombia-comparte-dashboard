import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { api } from '../services/api'

export default function EstadoSelect({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [estados, setEstados] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEstado, setSelectedEstado] = useState(null)
  const containerRef = useRef(null)

  // Cargar estados
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const { data } = await api.get('/estados')
        setEstados(Array.isArray(data) ? data : [])
        
        // Buscar estado seleccionado
        if (value && data) {
          const found = data.find(e => e.codigo === value)
          setSelectedEstado(found)
        }
      } catch (error) {
        console.error('Error cargando estados:', error)
        setEstados([])
      } finally {
        setLoading(false)
      }
    }

    fetchEstados()
  }, [value])

  // Cerrar dropdown cuando se hace click afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredEstados = estados.filter(estado =>
    estado.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (estado.descripcion && estado.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSelect = (estado) => {
    setSelectedEstado(estado)
    onChange(estado.codigo)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Button/Display */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-left font-medium transition-all focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between hover:border-slate-300"
      >
        <div>
          {loading ? (
            <span className="text-slate-400">Cargando estados...</span>
          ) : selectedEstado ? (
            <div>
              <div className="font-semibold text-slate-900">{selectedEstado.codigo}</div>
              <div className="text-xs text-slate-500">{selectedEstado.nombre}</div>
            </div>
          ) : (
            <span className="text-slate-400">Selecciona un estado</span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-200 sticky top-0 bg-white">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredEstados.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No se encontraron estados
              </div>
            ) : (
              filteredEstados.map((estado) => (
                <button
                  key={estado.codigo}
                  onClick={() => handleSelect(estado)}
                  className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50 ${
                    selectedEstado?.codigo === estado.codigo ? 'bg-brand-50 border-l-4 border-l-brand-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900">{estado.codigo}</div>
                      <div className="text-sm text-slate-600 truncate">{estado.nombre}</div>
                      {estado.descripcion && (
                        <div className="text-xs text-slate-500 truncate mt-1">{estado.descripcion}</div>
                      )}
                    </div>
                    {estado.tipo && (
                      <div className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        {estado.tipo}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
