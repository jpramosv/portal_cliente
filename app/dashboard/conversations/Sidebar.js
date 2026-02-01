'use client'

import { getAllConversations } from '@/app/actions/chatwoot'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, Bell, MoreVertical, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

const getAISummary = (conv) => {
    const statusMap = {
        'open': 'Aguardando resposta',
        'snoozed': 'Em espera',
        'resolved': 'Resolvido'
    };

    // Simulate AI analysis
    if (conv.labels?.includes('agendamento')) return "Interesse em agendar";
    if (conv.labels?.includes('financeiro')) return "Dúvida pagamento";
    if (conv.labels?.includes('urgente')) return "Dor pós-proc.";

    return statusMap[conv.status] || "Sem resumo";
}

const ConversationItem = ({ conv, isActive, searchString }) => {
    return (
        <Link
            href={`/dashboard/conversations/${conv.id}${searchString}`} // Maintain inbox param
            className={`group flex items-start gap-3 px-4 py-3 transition-all border-l-4 ${isActive
                ? 'bg-gray-50 border-l-teal-600'
                : 'border-l-transparent hover:bg-gray-50/50'
                }`}
        >
            <div className="relative flex-shrink-0">
                {conv.contact.thumbnail ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                            src={conv.contact.thumbnail}
                            alt={conv.contact.name || 'Contact'}
                            fill
                            className="object-cover"
                            sizes="48px"
                        />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold bg-teal-600 text-white">
                        {conv.contact.name?.[0]?.toUpperCase() || 'CX'}
                    </div>
                )}
                {conv.status === 'open' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {conv.contact.name || 'Sem nome'}
                    </h3>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                        {new Date(conv.last_activity_at * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <p className="text-xs text-gray-500 truncate">
                    {conv.last_message || 'Sem mensagens'}
                </p>
            </div>
        </Link>
    )
}

export default function Sidebar({ initialConversations, inboxes, currentUser }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [conversations, setConversations] = useState(initialConversations || [])
    const [isLoading, setIsLoading] = useState(false)

    // Get user details
    const userName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Usuário'
    const userInitials = userName.substring(0, 2).toUpperCase()
    const userEmail = currentUser?.email || ''

    const currentInboxId = searchParams.get('inbox')

    // Fetch conversations when inbox changes (Client Side)
    useEffect(() => {
        async function fetchConversations() {
            setIsLoading(true)
            const inboxId = currentInboxId ? parseInt(currentInboxId) : null
            try {
                // If checking same inbox as initial, maybe skip? But safer to re-fetch to ensure consistency on nav
                const result = await getAllConversations(inboxId)
                if (result.conversations) {
                    setConversations(result.conversations)
                }
            } catch (error) {
                console.error("Error fetching conversations:", error)
            } finally {
                setIsLoading(false)
            }
        }

        // Only fetch if we are navigating client-side (initialConversations might be stale if simple nav)
        fetchConversations()
    }, [currentInboxId])

    // Filter logic
    const filteredConversations = conversations?.filter(c =>
        c.contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().includes(searchTerm)
    )

    const currentInbox = inboxes?.find(i => i.id.toString() === currentInboxId)

    const handleInboxSelect = (inboxId) => {
        const params = new URLSearchParams(searchParams)
        if (inboxId) {
            params.set('inbox', inboxId)
        } else {
            params.delete('inbox')
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <aside className="w-[350px] border-r border-gray-200 bg-white flex flex-col h-full">
            {/* Header with User Info */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                        {userInitials}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]" title={userName}>
                                {userName}
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-500 truncate max-w-[140px]">{userEmail}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                        <Bell size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Inbox Selector & Title */}
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-700">Conversas</h2>
                    <span className="text-xs text-gray-400">
                        {filteredConversations?.length || 0}
                    </span>
                </div>

                <div className="relative group">
                    <button className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-teal-600 bg-white border border-gray-200 hover:border-teal-200 px-2.5 py-1.5 rounded-full transition-all shadow-sm">
                        <span className="max-w-[100px] truncate">
                            {currentInbox ? currentInbox.name : 'Todas as Caixas'}
                        </span>
                        <ChevronDown size={12} />
                    </button>

                    {/* Native select for simplicity and reliability on mobile/desktop */}
                    <select
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleInboxSelect(e.target.value)}
                        value={currentInboxId || ''}
                    >
                        <option value="">Todas as Caixas</option>
                        {inboxes?.map(inbox => (
                            <option key={inbox.id} value={inbox.id}>
                                {inbox.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 py-2 border-b border-gray-100 flex gap-4">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-all ${activeTab === 'all'
                        ? 'text-teal-600 border-teal-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setActiveTab('unread')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-all ${activeTab === 'unread'
                        ? 'text-teal-600 border-teal-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                >
                    Não Lidas
                </button>
                <button
                    onClick={() => setActiveTab('archived')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-all ${activeTab === 'archived'
                        ? 'text-teal-600 border-teal-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                >
                    Arquivadas
                </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Buscar conversas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className={`flex-1 overflow-y-auto relative ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                )}

                {filteredConversations?.map(conv => (
                    <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={pathname === `/dashboard/conversations/${conv.id}`}
                        searchString={searchParams.toString() ? `?${searchParams.toString()}` : ''}
                    />
                ))}

                {filteredConversations?.length === 0 && !isLoading && (
                    <div className="text-center py-10 px-4">
                        <p className="text-sm text-gray-400">Nenhuma conversa encontrada</p>
                    </div>
                )}
            </div>
        </aside>
    )
}
