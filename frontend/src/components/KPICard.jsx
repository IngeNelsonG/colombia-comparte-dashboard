import { ArrowUp, ArrowDown } from 'lucide-react'

export default function KPICard({ title, value, unit = '', icon: Icon, color = 'brand' }) {
  const colorClasses = {
    brand: { bg: 'from-brand-50 to-brand-100', icon: 'bg-brand-200', text: 'text-brand-600', border: 'border-brand-200' },
    accent: { bg: 'from-accent-50 to-accent-100', icon: 'bg-accent-200', text: 'text-accent-600', border: 'border-accent-200' },
    success: { bg: 'from-green-50 to-green-100', icon: 'bg-green-200', text: 'text-green-600', border: 'border-green-200' },
    warning: { bg: 'from-amber-50 to-amber-100', icon: 'bg-amber-200', text: 'text-amber-600', border: 'border-amber-200' },
    danger: { bg: 'from-red-50 to-red-100', icon: 'bg-red-200', text: 'text-red-600', border: 'border-red-200' },
  }

  const colors = colorClasses[color] || colorClasses.brand

  return (
    <div className={`metric-card bg-gradient-to-br ${colors.bg} border-2 ${colors.border} p-4 sm:p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold uppercase tracking-wide">{title}</p>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {unit && <p className="text-slate-600 text-xs sm:text-sm mt-1">{unit}</p>}
          </div>
        </div>
        {Icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${colors.icon} flex-shrink-0`}>
            <Icon className={`${colors.text} w-5 h-5 sm:w-6 sm:h-6`} />
          </div>
        )}
      </div>
    </div>
  )
}
