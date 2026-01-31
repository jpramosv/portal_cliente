import { createClient } from '@/utils/supabase/server'
import { getAllConversations, getInboxes } from '@/app/actions/chatwoot'
import Link from 'next/link'
import Image from 'next/image'
import { MessageSquare, Clock, Search, Filter, Sparkles, MoreHorizontal, Calendar, CheckCircle, AlertCircle, PlayCircle, User } from 'lucide-react'

// Mock AI summary generator (since backend might not have it yet)
const getAISummary = (conv) => {
    const statusMap = {
        'open': 'Paciente aguardando resposta',
        'snoozed': 'Aguardando retorno do paciente',
        'resolved': 'Atendimento finalizado'
    };

    // Simulate AI analysis based on available data
    if (conv.labels?.includes('agendamento')) return "Interesse em agendar avaliação para próxima semana.";
    if (conv.labels?.includes('financeiro')) return "Dúvida sobre formas de pagamento e parcelamento.";
    if (conv.labels?.includes('urgente')) return "Relato de dor após procedimento recente.";

    return statusMap[conv.status] || "Resumo da conversa não disponível.";
}

const StatusChip = ({ status, labels }) => {
    let colorClass = "bg-blue-50 text-blue-700 border-blue-100";
    let icon = <PlayCircle size={12} className="mr-1" />;
    let text = "Ativo";

    if (labels?.includes('urgente') || status === 'pending') {
        colorClass = "bg-red-50 text-red-700 border-red-100";
        icon = <AlertCircle size={12} className="mr-1" />;
        text = "Ação Necessária";
    } else if (labels?.includes('agendamento')) {
        colorClass = "bg-green-50 text-green-700 border-green-100";
        icon = <CheckCircle size={12} className="mr-1" />;
        text = "Agendamento";
    } else if (status === 'snoozed') {
        colorClass = "bg-yellow-50 text-yellow-700 border-yellow-100";
        icon = <Clock size={12} className="mr-1" />;
        text = "Aguardando";
    } else if (status === 'resolved') {
        colorClass = "bg-gray-50 text-gray-600 border-gray-100";
        icon = <CheckCircle size={12} className="mr-1" />;
        text = "Resolvido";
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
            {icon}
            {text}
        </span>
    );
}

export default async function ConversationsPage({ searchParams }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const selectedInboxId = (await searchParams)?.inbox ? parseInt((await searchParams).inbox) : null

    // Skeleton Loader Component
    const SkeletonCard = () => (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-100"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-50 rounded w-1/4"></div>
                </div>
                <div className="h-6 w-16 bg-gray-50 rounded-full"></div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-50 rounded w-full"></div>
                <div className="h-3 bg-gray-50 rounded w-5/6"></div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <div className="h-3 bg-gray-100 rounded w-20"></div>
                <div className="h-3 bg-gray-100 rounded w-4"></div>
            </div>
        </div>
    );

    if (!user) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="h-8 bg-gray-100 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        )
    }

    const { inboxes } = await getInboxes()
    const { conversations, error } = await getAllConversations(selectedInboxId)

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Conversas</h1>
                    <p className="text-sm text-gray-500 mt-1">Central de Relacionamento</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64 shadow-sm group-hover:border-gray-300"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button className="px-3.5 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium shadow-sm hover:bg-gray-800 transition-colors whitespace-nowrap">
                    Todas
                </button>
                <button className="px-3.5 py-1.5 bg-white border border-dashed border-gray-300 text-gray-600 rounded-full text-xs font-medium hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    Ação Necessária
                </button>
                <button className="px-3.5 py-1.5 bg-white border border-dashed border-gray-300 text-gray-600 rounded-full text-xs font-medium hover:border-yellow-300 hover:text-yellow-600 hover:bg-yellow-50 transition-colors whitespace-nowrap flex items-center gap-1.5">
                    <Clock size={12} />
                    Aguardando Paciente
                </button>
                <button className="px-3.5 py-1.5 bg-white border border-dashed border-gray-300 text-gray-600 rounded-full text-xs font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-1.5">
                    <PlayCircle size={12} />
                    Ativos
                </button>
                <button className="px-3.5 py-1.5 bg-white border border-dashed border-gray-300 text-gray-600 rounded-full text-xs font-medium hover:border-green-300 hover:text-green-600 hover:bg-green-50 transition-colors whitespace-nowrap flex items-center gap-1.5">
                    <CheckCircle size={12} />
                    Finalizados
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                        <p className="font-medium text-sm">Não foi possível carregar as conversas.</p>
                        <p className="text-xs mt-0.5 text-red-600/80">Erro técnico: {error}</p>
                    </div>
                </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {!error && (!conversations || conversations.length === 0) ? (
                    // Default / Empty State
                    <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">Nenhuma conversa encontrada</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                            As conversas iniciarão aqui assim que os pacientes entrarem em contato.
                        </p>
                    </div>
                ) : (
                    conversations?.map((conv) => (
                        <Link
                            key={conv.id}
                            href={`/dashboard/conversations/${conv.id}`}
                            className="group relative bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 card-hoverable flex flex-col h-full"
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    {conv.contact.thumbnail ? (
                                        <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                                            <Image
                                                src={conv.contact.thumbnail}
                                                alt={conv.contact.name}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-sm ring-2 ring-white shadow-sm">
                                            {conv.contact.name?.[0] || <User size={16} />}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                            {conv.contact.name || 'Paciente Visitante'}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center">
                                            Nº {conv.id}
                                        </p>
                                    </div>
                                </div>
                                <StatusChip status={conv.status} labels={conv.labels} />
                            </div>

                            {/* AI Summary Section */}
                            <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-100 group-hover:border-indigo-50 group-hover:bg-indigo-50/30 transition-colors">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Sparkles size={10} className="text-indigo-500" />
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Resumo IA</span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                    {getAISummary(conv)}
                                </p>
                            </div>

                            {/* Footer / Metadata */}
                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center hover:text-gray-600 transition-colors">
                                        <Calendar size={12} className="mr-1.5" />
                                        {new Date(conv.last_activity_at * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </span>
                                    <span className="flex items-center hover:text-gray-600 transition-colors">
                                        <Clock size={12} className="mr-1.5" />
                                        {new Date(conv.last_activity_at * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="bg-indigo-50 text-indigo-600 p-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
