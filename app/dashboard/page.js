import { createClient } from '@/utils/supabase/server'
import { getDashboardMetrics } from '@/app/actions/chatwoot'
import { Users, MessageSquare, Clock, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch metrics
    const metrics = await getDashboardMetrics()

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Olá, {user?.email}</h1>
                    <p className="text-gray-500 mt-1">Bem-vindo ao painel da sua clínica.</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="font-medium">Sistema Online</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Total de Contatos"
                    value={metrics.totalContacts}
                    icon={<Users className="text-indigo-600" size={24} />}
                    color="bg-indigo-50"
                />
                <MetricCard
                    title="Conversas Totais"
                    value={metrics.totalConversations}
                    icon={<MessageSquare className="text-blue-600" size={24} />}
                    color="bg-blue-50"
                />
                <MetricCard
                    title="Em Aberto"
                    value={metrics.openConversations}
                    icon={<Clock className="text-orange-600" size={24} />}
                    color="bg-orange-50"
                />
                <MetricCard
                    title="Finalizados"
                    value={metrics.closedConversations}
                    icon={<CheckCircle className="text-green-600" size={24} />}
                    color="bg-green-50"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
                </div>
                {metrics.recentConversations?.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {metrics.recentConversations.map((conv) => (
                            <div key={conv.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        {conv.contact.thumbnail ? (
                                            <img src={conv.contact.thumbnail} alt="" className="h-10 w-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                <Users size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{conv.contact.name || 'Desconhecido'}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{conv.last_message}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(conv.last_activity_at * 1000).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        Nenhuma atividade recente.
                    </div>
                )}
            </div>
        </div>
    )
}

function MetricCard({ title, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
        </div>
    )
}
