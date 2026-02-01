import { createClient } from '@/utils/supabase/server'
import {
    getOperationalMetrics,
    getPatientMetrics,
    getAIPerformanceMetrics,
    getDistributionMetrics
} from '@/app/actions/dashboard'
import MetricCardWithTrend from './components/MetricCardWithTrend'
import HorizontalBarChart from './components/HorizontalBarChart'
import {
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    Users,
    RotateCcw,
    Activity,
    Bot,
    AlertTriangle,
    Zap,
    UserX
} from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch all metrics in parallel
    const [operationalMetrics, patientMetrics, aiMetrics, distributionMetrics] = await Promise.all([
        getOperationalMetrics(),
        getPatientMetrics(),
        getAIPerformanceMetrics(),
        getDistributionMetrics()
    ])

    return (
        <div className="space-y-10 max-w-7xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center space-x-3">
                        <div className="text-blue-600">
                            <Calendar size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Agendamentos</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Métricas e análises em tempo real do sistema de gestão</p>
                </div>

                {/* Time Filters */}
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                        Hoje
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Esta Semana
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Este Mês
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Trimestre
                    </button>
                </div>
            </div>

            {/* Métricas Operacionais */}
            <section className="py-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Métricas Operacionais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCardWithTrend
                        title="TOTAL DE AGENDAMENTOS"
                        value={operationalMetrics.total_agendamentos.value}
                        variation={operationalMetrics.total_agendamentos.variation}
                        subtitle="vs. período anterior"
                        icon={<Calendar className="text-blue-600" size={20} />}
                    />
                    <MetricCardWithTrend
                        title="TAXA DE CONFIRMAÇÃO"
                        value={operationalMetrics.taxa_confirmacao.value}
                        variation={operationalMetrics.taxa_confirmacao.variation}
                        subtitle="consultas confirmadas"
                        icon={<CheckCircle className="text-green-600" size={20} />}
                        format="percentage"
                    />
                    <MetricCardWithTrend
                        title="TAXA DE OCUPAÇÃO"
                        value={operationalMetrics.taxa_ocupacao.value}
                        variation={operationalMetrics.taxa_ocupacao.variation}
                        subtitle="horários preenchidos"
                        icon={<Activity className="text-purple-600" size={20} />}
                        format="percentage"
                    />
                    <MetricCardWithTrend
                        title="TAXA DE CANCELAMENTO"
                        value={operationalMetrics.taxa_cancelamento.value}
                        variation={operationalMetrics.taxa_cancelamento.variation}
                        subtitle="consultas canceladas"
                        icon={<XCircle className="text-red-600" size={20} />}
                        format="percentage"
                    />
                </div>
            </section>

            {/* Métricas de Pacientes */}
            <section className="py-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Métricas de Pacientes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCardWithTrend
                        title="NOVOS PACIENTES"
                        value={patientMetrics.novos_pacientes.value}
                        variation={patientMetrics.novos_pacientes.variation}
                        subtitle="primeiras consultas"
                        icon={<Users className="text-blue-600" size={20} />}
                    />
                    <MetricCardWithTrend
                        title="RETORNOS"
                        value={patientMetrics.retornos.value}
                        variation={patientMetrics.retornos.variation}
                        subtitle="pacientes recorrentes"
                        icon={<RotateCcw className="text-indigo-600" size={20} />}
                    />
                    <MetricCardWithTrend
                        title="PACIENTES ATIVOS"
                        value={patientMetrics.pacientes_ativos.value}
                        subtitle={patientMetrics.pacientes_ativos.subtitle}
                        icon={<Activity className="text-green-600" size={20} />}
                    />
                </div>
            </section>

            {/* Performance da IA */}
            <section className="py-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance da IA</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCardWithTrend
                        title="ATENDIMENTOS AUTOMATIZADOS"
                        value={aiMetrics.atendimentos_automatizados.value}
                        variation={aiMetrics.atendimentos_automatizados.variation}
                        subtitle="sem escalação humana"
                        icon={<Bot className="text-blue-600" size={20} />}
                        format="percentage"
                    />
                    <MetricCardWithTrend
                        title="ESCALAÇÕES HUMANAS"
                        value={aiMetrics.escalacoes_humanas.value}
                        variation={aiMetrics.escalacoes_humanas.variation}
                        subtitle="casos complexos"
                        icon={<AlertTriangle className="text-orange-600" size={20} />}
                    />
                    <MetricCardWithTrend
                        title="TEMPO MÉDIO DE RESPOSTA"
                        value={`${aiMetrics.tempo_medio_resposta.value}${aiMetrics.tempo_medio_resposta.unit}`}
                        subtitle="resposta da IA"
                        icon={<Zap className="text-yellow-600" size={20} />}
                    />
                    <MetricCardWithTrend
                        title="DESVIOS DR. ELDER"
                        value={aiMetrics.desvios_dr_elder.value}
                        subtitle="redirecionamentos"
                        icon={<UserX className="text-red-600" size={20} />}
                    />
                </div>
            </section>

            {/* Distribuição e Análises */}
            <section className="py-2">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Distribuição e Análises</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Distribuição por Profissional */}
                    <HorizontalBarChart
                        title="Distribuição por Profissional"
                        subtitle="Agendamentos por médico"
                        data={distributionMetrics.por_profissional.map(p => ({
                            label: p.nome,
                            value: p.total
                        }))}
                        colorScheme="blue"
                    />

                    {/* Tipos de Tratamento */}
                    <HorizontalBarChart
                        title="Tipos de Tratamento"
                        subtitle="Procedimentos mais solicitados"
                        data={distributionMetrics.por_tratamento.map(t => ({
                            label: t.tipo,
                            value: t.total
                        }))}
                        colorScheme="green"
                    />
                </div>

                {/* Principais Motivos de Escalação */}
                <div className="mt-8">
                    <HorizontalBarChart
                        title="Principais Motivos de Escalação"
                        subtitle="Por que a IA escalou para humano"
                        data={distributionMetrics.motivos_escalacao.map(m => ({
                            label: m.motivo,
                            value: m.total
                        }))}
                        colorScheme="orange"
                    />
                </div>
            </section>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 pt-8 pb-4">
                Dashboard de Gestão de Agendamentos © 2026
                <br />
                Atualizado em: {new Date().toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        </div>
    )
}
