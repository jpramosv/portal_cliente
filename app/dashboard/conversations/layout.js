import { createClient } from '@/utils/supabase/server'
import { getAllConversations, getInboxes } from '@/app/actions/chatwoot'
import Sidebar from './Sidebar'

export default async function ConversationsLayout({ children, searchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If no user is authenticated, redirect to login or show auth message
    /* AUTH DISABLED FOR TESTING
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center max-w-md px-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Autenticação necessária</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Faça login para acessar as conversas do inbox.
                    </p>
                    <a
                        href="/login"
                        className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                    >
                        Fazer Login
                    </a>
                </div>
            </div>
        )
    }
    */

    // Mock user if not authenticated
    const displayUser = user || {
        email: 'dev@teste.com',
        user_metadata: {
            full_name: 'Desenvolvedor',
            name: 'Dev'
        }
    }

    // Fetch conversations and inboxes with error handling
    const selectedInboxId = (await searchParams)?.inbox ? parseInt((await searchParams).inbox) : null
    let conversations = []
    let inboxes = []

    try {
        const conversationsResult = await getAllConversations(selectedInboxId)
        const inboxesResult = await getInboxes()
        conversations = conversationsResult?.conversations || []
        inboxes = inboxesResult?.inboxes || []
    } catch (error) {
        console.error('Error loading conversations:', error)
        // Continue rendering with empty lists
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar initialConversations={conversations} inboxes={inboxes} currentUser={displayUser} />

            <main className="flex-1 bg-white relative flex flex-col min-w-0">
                {children}
            </main>
        </div>
    )
}
