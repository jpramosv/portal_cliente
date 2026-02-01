import { createClient } from '@/utils/supabase/server'
import { MessageSquare } from 'lucide-react'

export default async function ConversationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    /* AUTH DISABLED FOR TESTING
    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-gray-500">Faça login para acessar as conversas.</p>
                </div>
            </div>
        )
    }
    */

    return (
        <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center max-w-md px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione uma conversa</h3>
                <p className="text-sm text-gray-500">
                    Escolha uma conversa da lista ao lado para começar a visualizar as mensagens e responder aos seus clientes.
                </p>
            </div>
        </div>
    )
}
