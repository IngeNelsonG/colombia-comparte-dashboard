import { Menu, X } from 'lucide-react'

export default function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* Left: Menu button + Title */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X size={24} className="text-slate-700" />
            ) : (
              <Menu size={24} className="text-slate-700" />
            )}
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-display font-bold text-slate-900 truncate">
              Colombia Comparte
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Simulación Markov
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
