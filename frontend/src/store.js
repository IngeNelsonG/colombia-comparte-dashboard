import { create } from 'zustand'

export const useSimulationStore = create((set) => ({
    numUsuarios: 1000,
    maxPasos: 30,
    estadoInicial: 'S0',
    seed: 2026,
    setNumUsuarios: (n) => set({ numUsuarios: n }),
    setMaxPasos: (m) => set({ maxPasos: m }),
    setEstadoInicial: (e) => set({ estadoInicial: e }),
    setSeed: (s) => set({ seed: s }),
}))

export const useUIStore = create((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
