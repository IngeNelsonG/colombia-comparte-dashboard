import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
})

export const apiService = {
  // Estados
  getEstados: () => api.get('/estados'),

  // Recorridos
  getRecorridos: () => api.get('/recorridos'),

  // Matrices
  getMatrizConteos: () => api.get('/matriz/conteos'),
  getMatrizProbabilidades: () => api.get('/matriz/probabilidades'),

  // Simulación
  simular: (params) => api.post('/simular', params),

  // Diagnóstico
  getDiagnostico: (params) => api.post('/diagnostico', params),

  // Comparación
  compararEscenarios: (params) => api.post('/comparar-escenarios', params),

  // Metadata
  getMetadata: () => api.get('/metadata'),

  // Health check
  healthCheck: () => api.get('/health'),
}
