import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Estados from './pages/Estados'
import Recorridos from './pages/Recorridos'
import MatrizTransicion from './pages/MatrizTransicion'
import Simulacion from './pages/Simulacion'
import Graficos from './pages/Graficos'
import Diagnostico from './pages/Diagnostico'
import ComparisonEscenarios from './pages/ComparisonEscenarios'
import { apiService } from './services/api'
import { useUIStore } from './store'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await apiService.getMetadata()
        setMetadata(res.data)
      } catch (error) {
        console.error('Error fetching metadata:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMetadata()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} metadata={metadata}>
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
        {currentPage === 'estados' && <Estados />}
        {currentPage === 'recorridos' && <Recorridos />}
        {currentPage === 'matriz' && <MatrizTransicion />}
        {currentPage === 'simulacion' && <Simulacion />}
        {currentPage === 'graficos' && <Graficos />}
        {currentPage === 'diagnostico' && <Diagnostico />}
        {currentPage === 'comparacion' && <ComparisonEscenarios />}
      </motion.div>
    </Layout>
  )
}
