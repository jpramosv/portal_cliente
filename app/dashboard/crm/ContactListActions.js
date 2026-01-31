'use client'

import { useState } from 'react'
import { createDeal } from '@/app/actions/crm'
import { PlusCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ContactListActions({ contactId, contactName }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleCreateDeal() {
        const title = window.prompt(`Criar negócio para ${contactName}? \nDigite o título do negócio:`, `Negócio com ${contactName}`)

        if (!title) return

        setLoading(true)
        const { error } = await createDeal({
            title,
            contactId,
        })

        if (error) {
            alert('Erro ao criar negócio: ' + error)
        } else {
            alert('Negócio criado com sucesso! Veja na visualização Kanban.')
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <button
            onClick={handleCreateDeal}
            disabled={loading}
            className="flex items-center text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
            title="Adicionar ao CRM (Kanban)"
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
        </button>
    )
}
