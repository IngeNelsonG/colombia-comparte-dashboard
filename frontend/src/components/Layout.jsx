import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children, currentPage, setCurrentPage, metadata }) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true)
  )

  // Mantener sidebar abierto en desktop y tipo drawer en mobile.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')

    const syncSidebarMode = (event) => {
      if (event.matches) {
        setSidebarOpen(true)
      }
    }

    syncSidebarMode(mq)
    mq.addEventListener('change', syncSidebarMode)
    return () => mq.removeEventListener('change', syncSidebarMode)
  }, [])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Hidden on mobile, drawer on tablet+, visible on desktop */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        metadata={metadata}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          metadata={metadata}
        />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 sm:px-6 sm:py-8 lg:px-8 w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
