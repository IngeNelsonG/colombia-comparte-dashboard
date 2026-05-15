import { memo } from 'react'
import { X, LayoutDashboard, Globe, Map, Play, AlertCircle, LineChart, Grid, Copy } from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Globe, label: 'Estados', id: 'estados' },
  { icon: Map, label: 'Recorridos Base', id: 'recorridos' },
  { icon: Play, label: 'Simulación', id: 'simulacion' },
  { icon: AlertCircle, label: 'Diagnóstico', id: 'diagnostico' },
  { icon: LineChart, label: 'Gráficos', id: 'graficos' },
  { icon: Grid, label: 'Matriz de Transición', id: 'matriz' },
  { icon: Copy, label: 'Comparar Escenarios', id: 'comparacion' },
]

const Sidebar = memo(({ isOpen, setSidebarOpen, currentPage, setCurrentPage, metadata }) => {
  const handleMenuClick = (pageId) => {
    setCurrentPage(pageId)
    // Cerrar sidebar en mobile después de seleccionar
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <>
      {/* Sidebar: drawer en mobile, columna fija en desktop */}
      <aside
        className={`fixed inset-y-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-300 ease-out overflow-y-auto shadow-xl md:shadow-none md:static md:inset-auto md:translate-x-0 md:z-auto md:flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header del sidebar */}
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-xl font-display font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                  CC
                </h2>
                <p className="text-xs text-slate-500 mt-1">Colombia Comparte</p>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left ${
                  currentPage === item.id
                    ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <IconComponent size={20} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
              )
            })}
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-slate-200 bg-gradient-to-t from-slate-50 to-transparent">
            <div className="text-xs text-slate-500">
              <p className="font-semibold text-slate-700 mb-1">Proyecto Integrador</p>
              <p>Alarcón, Silva y González</p>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              v1.0.0
            </div>
          </div>
        </div>
      </aside>
    </>
  )
})

Sidebar.displayName = 'Sidebar'
export default Sidebar
