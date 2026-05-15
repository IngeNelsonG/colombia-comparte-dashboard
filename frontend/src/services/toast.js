const CONTAINER_ID = 'cc-toasts-container'

function ensureContainer() {
    let c = document.getElementById(CONTAINER_ID)
    if (!c) {
        c = document.createElement('div')
        c.id = CONTAINER_ID
        c.style.position = 'fixed'
        c.style.right = '16px'
        c.style.top = '16px'
        c.style.zIndex = '9999'
        c.style.display = 'flex'
        c.style.flexDirection = 'column'
        c.style.gap = '8px'
        document.body.appendChild(c)
    }
    return c
}

function show(message, type = 'info', timeout = 3500) {
    try {
        const c = ensureContainer()
        const el = document.createElement('div')
        el.className = 'px-4 py-2 rounded shadow-md text-sm'
        el.style.minWidth = '180px'
        el.style.maxWidth = '320px'
        el.style.boxShadow = '0 6px 18px rgba(15,23,42,0.12)'
        el.style.opacity = '0'
        el.style.transition = 'opacity 220ms ease, transform 220ms ease'

        if (type === 'success') {
            el.style.background = '#ECFDF5'
            el.style.color = '#065F46'
        } else if (type === 'error') {
            el.style.background = '#FEF2F2'
            el.style.color = '#7F1D1D'
        } else {
            el.style.background = '#F8FAFC'
            el.style.color = '#0F172A'
        }

        el.textContent = message
        c.appendChild(el)
        // force reflow
        requestAnimationFrame(() => {
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
        })

        const id = setTimeout(() => {
            el.style.opacity = '0'
            setTimeout(() => el.remove(), 220)
        }, timeout)

        return () => {
            clearTimeout(id)
            el.remove()
        }
    } catch (e) {
        console.error('toast show error', e)
    }
}

export default { show }
