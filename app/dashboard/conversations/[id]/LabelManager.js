'use client'

import { useState, useEffect, useRef } from 'react'
import { Tag, Plus, X, Loader2 } from 'lucide-react'
import { getAllLabels, getConversationLabels, addConversationLabels, removeConversationLabel } from '@/app/actions/chatwoot'

export default function LabelManager({ conversationId }) {
    const [labels, setLabels] = useState([])
    const [availableLabels, setAvailableLabels] = useState([])
    const [loading, setLoading] = useState(true)
    const [showSelector, setShowSelector] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const selectorRef = useRef(null)

    useEffect(() => {
        loadLabels()
        // Click outside to close selector
        const handleClickOutside = (event) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target)) {
                setShowSelector(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [conversationId])

    async function loadLabels() {
        if (!conversationId) return

        try {
            const [convLabelsRes, allLabelsRes] = await Promise.all([
                getConversationLabels(conversationId),
                getAllLabels()
            ])

            setLabels(convLabelsRes.labels || [])
            setAvailableLabels(allLabelsRes.labels || [])
        } catch (error) {
            console.error('Error loading labels:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAddLabel(labelName) {
        if (isUpdating) return
        setIsUpdating(true)

        try {
            await addConversationLabels(conversationId, [labelName])
            // Optimistic update or reload
            setLabels(prev => [...prev, labelName])
            setShowSelector(false)
        } catch (error) {
            console.error('Error adding label:', error)
            alert('Erro ao adicionar etiqueta')
        } finally {
            setIsUpdating(false)
        }
    }

    async function handleRemoveLabel(labelName) {
        if (isUpdating) return
        if (!confirm(`Remover etiqueta "${labelName}"?`)) return

        setIsUpdating(true)
        try {
            await removeConversationLabel(conversationId, labelName)
            setLabels(prev => prev.filter(l => l !== labelName))
        } catch (error) {
            console.error('Error removing label:', error)
            alert('Erro ao remover etiqueta')
        } finally {
            setIsUpdating(false)
        }
    }

    // Filter available labels to show only unused ones
    const unusedLabels = availableLabels.filter(l => !labels.includes(l.title))

    if (loading) return <div className="h-6 w-20 bg-gray-100 rounded animate-pulse"></div>

    return (
        <div className="flex flex-wrap items-center gap-2">
            {labels.map((label, idx) => (
                <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 group"
                >
                    <Tag size={12} className="mr-1" />
                    {label}
                    <button
                        onClick={() => handleRemoveLabel(label)}
                        className="ml-1 text-indigo-400 hover:text-indigo-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover"
                    >
                        <X size={12} />
                    </button>
                </span>
            ))}

            <div className="relative" ref={selectorRef}>
                <button
                    onClick={() => setShowSelector(!showSelector)}
                    disabled={isUpdating}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-dashed border-gray-300"
                >
                    {isUpdating ? <Loader2 size={12} className="animate-spin mr-1" /> : <Plus size={12} className="mr-1" />}
                    Adicionar
                </button>

                {showSelector && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 max-h-60 overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                            Selecionar Etiqueta
                        </div>
                        {unusedLabels.length > 0 ? (
                            unusedLabels.map((label) => (
                                <button
                                    key={label.id}
                                    onClick={() => handleAddLabel(label.title)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: label.color || '#ccc' }}
                                    ></div>
                                    {label.title}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">
                                Nenhuma etiqueta disponível
                            </div>
                        )}
                        {/* Optional: Add custom label creation if needed */}
                    </div>
                )}
            </div>
        </div>
    )
}
