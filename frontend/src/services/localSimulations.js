const KEY = 'cc_simulations_v1'
const CHANGE_EVENT = 'simulations:changed'

function _emitChange(action, payload) {
    try {
        window.dispatchEvent(new CustomEvent(CHANGE_EVENT, {
            detail: { action, payload }
        }))
    } catch (e) {
        console.error('localSimulations: emit error', e)
    }
}

function _load() {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) return []
        return JSON.parse(raw)
    } catch (e) {
        console.error('localSimulations: parse error', e)
        return []
    }
}

function _saveAll(list) {
    try {
        localStorage.setItem(KEY, JSON.stringify(list))
    } catch (e) {
        console.error('localSimulations: save error', e)
    }
}

export default {
    getAll() {
        return _load()
    },

    get(id) {
        const sid = String(id)
        return _load().find(s => String(s.id) === sid)
    },

    save(sim) {
        const list = _load()
        // avoid duplicates by id
        const filtered = list.filter(s => s.id !== sim.id)
        filtered.unshift(sim)
        _saveAll(filtered)
        _emitChange('save', { id: sim?.id })
        return sim
    },

    remove(id) {
        const sid = String(id)
        const list = _load().filter(s => String(s.id) !== sid)
        _saveAll(list)
        _emitChange('remove', { id: sid })
    },

    clear() {
        localStorage.removeItem(KEY)
        _emitChange('clear')
    },

    exportSimulation(sim) {
        try {
            const blob = new Blob([JSON.stringify(sim, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `cc_simulation_${sim.id}.json`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch (e) {
            console.error('exportSimulation error', e)
        }
    }
    ,
    exportAllJSON() {
        try {
            const all = _load()
            const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `cc_simulations_all_${Date.now()}.json`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch (e) {
            console.error('exportAllJSON error', e)
        }
    },

    exportAllCSV() {
        try {
            const all = _load()
            // Flatten to CSV with key columns
            const rows = all.map(s => ({
                id: s.id,
                timestamp: s.timestamp,
                numUsuarios: s.params?.numUsuarios,
                maxPasos: s.params?.maxPasos,
                usuarios: s.resultado?.usuarios ?? '',
                promedio_pasos: s.resultado?.promedio_pasos ?? '',
                resultados_count: JSON.stringify(s.resultado?.resultados_count ?? {})
            }))
            const header = Object.keys(rows[0] || {}).join(',')
            const csv = [header].concat(rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))).join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `cc_simulations_all_${Date.now()}.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        } catch (e) {
            console.error('exportAllCSV error', e)
        }
    },

    subscribe(onChange) {
        if (typeof onChange !== 'function') return () => { }
        const handler = (event) => onChange(event?.detail)
        window.addEventListener(CHANGE_EVENT, handler)
        return () => window.removeEventListener(CHANGE_EVENT, handler)
    }
}
