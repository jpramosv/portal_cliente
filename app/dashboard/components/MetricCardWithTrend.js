/**
 * MetricCardWithTrend - Card de métrica com indicador de variação
 * Similar ao design da imagem do dashboard
 */
export default function MetricCardWithTrend({
    title,
    value,
    variation,
    subtitle,
    icon,
    format = 'number' // 'number', 'percentage'
}) {
    const isPositive = variation > 0
    const isNegative = variation < 0

    // Formatar o valor baseado no tipo
    const displayValue = format === 'percentage' ? `${value}%` : value

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    {icon && <div className="text-gray-500">{icon}</div>}
                    <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>

                {typeof variation === 'number' && (
                    <div className={`flex items-center space-x-1 text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
                        }`}>
                        {isPositive && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        )}
                        {isNegative && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                        <span>{Math.abs(variation).toFixed(1)}%</span>
                    </div>
                )}
            </div>
        </div>
    )
}
