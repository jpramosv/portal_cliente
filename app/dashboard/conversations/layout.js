import { createClient } from '@/utils/supabase/server'
import { getAllConversations, getInboxes } from '@/app/actions/chatwoot'
import Sidebar from './Sidebar'

export default async function ConversationsLayout({ children, searchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div className="p-8 text-center text-gray-500">Faça login para acessar o inbox.</div>
    }

    const selectedInboxId = (await searchParams)?.inbox ? parseInt((await searchParams).inbox) : null
    const { conversations } = await getAllConversations(selectedInboxId)
    const { inboxes } = await getInboxes()

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
            <Sidebar initialConversations={conversations} inboxes={inboxes} />

            <main className="flex-1 bg-white relative flex flex-col min-w-0">
                {children}
            </main>
        </div>
    )
}
