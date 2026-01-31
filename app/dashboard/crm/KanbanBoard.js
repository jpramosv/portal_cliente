'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateDealStage } from '@/app/actions/crm'
import { MoreHorizontal, Loader2, MessageSquare, Plus } from 'lucide-react'

export default function KanbanBoard({ columns, initialDeals }) {
    const [deals, setDeals] = useState(initialDeals)
    const [loadingId, setLoadingId] = useState(null)
    const router = useRouter()

    const dealsByColumn = columns.reduce((acc, col) => {
        acc[col.id] = deals.filter(d => d.column_id === col.id)
        return acc
    }, {})

    async function handleStatusChange(dealId, newColumnId) {
        setLoadingId(dealId)

        // Optimistic update
        const oldDeals = [...deals]
        setDeals(prev => prev.map(d =>
            d.id === dealId ? { ...d, column_id: newColumnId } : d
        ))

        const { error } = await updateDealStage(dealId, newColumnId)

        if (error) {
            alert('Falha ao atualizar status')
            setDeals(oldDeals) // Revert
        } else {
            router.refresh()
        }
        setLoadingId(null)
    }

    return (
        <div className="flex overflow-x-auto gap-6 h-[calc(100vh-200px)] pb-4 items-start">
            {columns.map(col => (
                <div key={col.id} className="min-w-[320px] bg-gray-50/50 rounded-xl border border-gray-200 flex flex-col h-full max-h-full">
                    {/* Header */}
                    <div className={`p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl`}>
                        <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${col.color ? col.color.split(' ')[0] : 'bg-gray-400'}`}></span>
                            <h3 className="font-semibold text-gray-700">{col.title}</h3>
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                            {dealsByColumn[col.id]?.length || 0}
                        </span>
                    </div>

                    {/* Cards Container */}
                    <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                        {dealsByColumn[col.id]?.map(deal => (
                            <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
                                {loadingId === deal.id && (
                                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-indigo-600" />
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900 line-clamp-1">{deal.title || 'Sem Título'}</h4>
                                </div>

                                {deal.value > 0 && (
                                    <p className="text-sm font-medium text-green-600 mb-2">
                                        R$ {Number(deal.value).toFixed(2)}
                                    </p>
                                )}

                                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                    <div className="text-xs text-gray-400">
                                        {new Date(deal.created_at).toLocaleDateString()}
                                    </div>

                                    {/* Action Menu (Simple Hover implementation) */}
                                    <div className="flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {columns.map(targetCol => (
                                            targetCol.id !== col.id && (
                                                <button
                                                    key={targetCol.id}
                                                    onClick={() => handleStatusChange(deal.id, targetCol.id)}
                                                    title={`Mover para ${targetCol.title}`}
                                                    className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-indigo-600 rounded"
                                                >
                                                    <div className={`w-3 h-3 rounded-full ${targetCol.color ? targetCol.color.split(' ')[0] : 'bg-gray-400'}`}></div>
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {dealsByColumn[col.id]?.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-lg">
                                <span className="text-sm text-gray-400">Vazio</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
