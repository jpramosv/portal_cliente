/**
 * HorizontalBarChart - Gráfico de barras horizontais
 * Para exibir distribuições (por profissional, tipos de tratamento, motivos de escalação)
 */
export default function HorizontalBarChart({ title, subtitle, data, colorScheme = 'blue' }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 mb-4">{subtitle}</p>}
                <p className="text-sm text-gray-400 text-center py-8">Sem dados disponíveis</p>
            </div>
        )
    }

    const maxValue = Math.max(...data.map(d => d.value))

    const colorSchemes = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        pink: 'bg-pink-500',
        cyan: 'bg-cyan-500',
        orange: 'bg-orange-500',
        gray: 'bg-gray-500'
    }

    const colors = [
        colorSchemes.blue,
        colorSchemes.gray,
        colorSchemes.pink,
        colorSchemes.orange,
        colorSchemes.cyan
    ]

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-1">
                <div className="text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            </div>
            {subtitle && <p className="text-xs text-gray-500 mb-4">{subtitle}</p>}

            <div className="space-y-3 mt-4">
                {data.map((item, index) => {
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                    const color = colors[index % colors.length]

                    return (
                        <div key={index}>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span className="font-medium">{item.label}</span>
                                <span className="font-bold text-gray-900">{item.value}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${color} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
