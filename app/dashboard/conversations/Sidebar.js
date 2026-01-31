'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, Sparkles, MoreHorizontal, Clock, CheckCircle, AlertCircle, PlayCircle, User } from 'lucide-react'
import { useState } from 'react'

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

const ConversationItem = ({ conv, isActive }) => {
    return (
        <Link
            href={`/dashboard/conversations/${conv.id}`}
            className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 border ${isActive
                ? 'bg-white shadow-md border-indigo-100/50 ring-1 ring-indigo-500/10 relative z-10'
                : 'border-transparent hover:bg-white/60 hover:shadow-sm'
                }`}
        >
            <div className="relative flex-shrink-0 mt-1">
                {conv.contact.thumbnail ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                        <Image
                            src={conv.contact.thumbnail}
                            alt={conv.contact.name || 'Contact'}
                            fill
                            className="object-cover"
                            sizes="40px"
                        />
                    </div>
                ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white shadow-sm ${isActive ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                        {conv.contact.name?.[0] || 'U'}
                    </div>
                )}
                {conv.status === 'open' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm z-10"></span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                        {conv.contact.name || 'Sem nome'}
                    </h3>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {new Date(conv.last_activity_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <p className={`text-xs truncate mb-1.5 flex items-center gap-1.5 ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                    {isActive && <Sparkles size={10} />}
                    {getAISummary(conv)}
                </p>

                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${conv.status === 'open' ? 'bg-green-50 text-green-700 border-green-100' :
                        conv.labels?.includes('urgente') ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                        {conv.status === 'open' ? 'Aberto' : conv.status}
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default function Sidebar({ initialConversations, inboxes }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')

    // Filter logic
    const filteredConversations = initialConversations?.filter(c =>
        c.contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().includes(searchTerm)
    )

    return (
        <aside className="w-80 border-r border-gray-200 bg-[#F9FAFB] flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200/50 bg-[#F9FAFB]/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Inbox</h2>
                    <div className="flex gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {filteredConversations?.map(conv => (
                    <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={pathname === `/dashboard/conversations/${conv.id}`}
                    />
                ))}

                {filteredConversations?.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-xs text-gray-400">Nenhuma conversa encontrada</p>
                    </div>
                )}
            </div>
        </aside>
    )
}
