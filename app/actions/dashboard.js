'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * ============================================================================
 * MÉTRICAS OPERACIONAIS
 * ============================================================================
 */

/**
 * Fetches operational metrics for the dashboard
 * Returns: total_agendamentos, taxa_confirmacao, taxa_ocupacao, taxa_cancelamento
 * Each with current value and comparison to previous period
 */
export async function getOperationalMetrics() {
    const supabase = await createClient()

    try {
        return await getOperationalMetricsDirect(supabase)
    } catch (error) {
        console.error('Error fetching operational metrics:', error)
        return {
            total_agendamentos: { value: 0, variation: 0 },
            taxa_confirmacao: { value: 0, variation: 0 },
            taxa_ocupacao: { value: 0, variation: 0 },
            taxa_cancelamento: { value: 0, variation: 0 }
        }
    }
}

/**
 * Direct SQL fallback for operational metrics (no RPC functions needed)
 * Uses bot_interactions table to track all bot operations
 */
async function getOperationalMetricsDirect(supabase) {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    console.log('[Dashboard Debug] Filtering for today:', today, 'yesterday:', yesterday)

    // Total agendamentos hoje (operation_type = 'create_calendar')
    const { count: totalHoje, error: errorToday } = await supabase
        .from('bot_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('operation_type', 'create_calendar')
        .gte('created_at', `${today}T00:00:00`)

    console.log('[Dashboard Debug] Total hoje:', totalHoje, 'error:', errorToday)

    // Total agendamentos ontem
    const { count: totalOntem } = await supabase
        .from('bot_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('operation_type', 'create_calendar')
        .gte('created_at', `${yesterday}T00:00:00`)
        .lt('created_at', `${today}T00:00:00`)


    // Buscar todos agendamentos de hoje para calcular taxas
    const { data: agendamentosHoje } = await supabase
        .from('bot_interactions')
        .select('status, operation_type')
        .eq('operation_type', 'create_calendar')
        .gte('created_at', `${today}T00:00:00`)

    // Taxa de confirmação (agendamentos com status='success')
    const confirmados = agendamentosHoje?.filter(a => a.status === 'success').length || 0
    const taxaConfirmacao = agendamentosHoje?.length > 0
        ? Math.round(confirmados / agendamentosHoje.length * 100 * 10) / 10
        : 0

    // Taxa de ocupação (baseada em agendamentos bem-sucedidos)
    const taxaOcupacao = Math.round((confirmados || 0) / 20 * 100 * 10) / 10

    // Taxa de cancelamento (operation_type = 'deletar_evento')
    const { count: cancelamentos } = await supabase
        .from('bot_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('operation_type', 'deletar_evento')
        .gte('created_at', `${today}T00:00:00`)

    const totalInteracoes = (totalHoje || 0) + (cancelamentos || 0)
    const taxaCancelamento = totalInteracoes > 0
        ? Math.round((cancelamentos || 0) / totalInteracoes * 100 * 10) / 10
        : 0

    // Calcular variações
    const variacao = totalOntem > 0
        ? Math.round((totalHoje - totalOntem) / totalOntem * 100 * 10) / 10
        : 0

    return {
        total_agendamentos: {
            value: totalHoje || 0,
            variation: variacao
        },
        taxa_confirmacao: {
            value: taxaConfirmacao,
            variation: 0 // TODO: Calculate historical comparison
        },
        taxa_ocupacao: {
            value: taxaOcupacao,
            variation: 0 // TODO: Calculate historical comparison
        },
        taxa_cancelamento: {
            value: taxaCancelamento,
            variation: 0 // TODO: Calculate historical comparison
        }
    }
}

/**
 * ============================================================================
 * MÉTRICAS DE PACIENTES
 * ============================================================================
 */

export async function getPatientMetrics() {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

    try {
        // Pacientes ativos (últimos 30 dias) - baseado em bot_interactions
        const { data: ativosData } = await supabase
            .from('bot_interactions')
            .select('patient_id')
            .eq('operation_type', 'create_calendar')
            .gte('created_at', thirtyDaysAgo)

        const pacientesAtivos = new Set(ativosData?.map(a => a.patient_id).filter(Boolean)).size

        // Novos pacientes e retornos (baseado em primeira interação hoje)
        const { data: agendamentosHoje } = await supabase
            .from('bot_interactions')
            .select('patient_id, created_at')
            .eq('operation_type', 'create_calendar')
            .gte('created_at', `${today}T00:00:00`)

        // Para cada paciente, verificar se tem interações anteriores
        const novos = []
        const retornos = []

        if (agendamentosHoje) {
            for (const agendamento of agendamentosHoje) {
                if (!agendamento.patient_id) continue

                const { count } = await supabase
                    .from('bot_interactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('patient_id', agendamento.patient_id)
                    .eq('operation_type', 'create_calendar')
                    .lt('created_at', agendamento.created_at)

                if (count === 0) {
                    novos.push(agendamento.patient_id)
                } else {
                    retornos.push(agendamento.patient_id)
                }
            }
        }

        return {
            novos_pacientes: {
                value: new Set(novos).size,
                variation: 0 // TODO: Calculate historical comparison
            },
            retornos: {
                value: new Set(retornos).size,
                variation: 0 // TODO: Calculate historical comparison
            },
            pacientes_ativos: {
                value: pacientesAtivos,
                subtitle: 'últimos 30 dias'
            }
        }
    } catch (error) {
        console.error('Error fetching patient metrics:', error)
        return {
            novos_pacientes: { value: 0, variation: 0 },
            retornos: { value: 0, variation: 0 },
            pacientes_ativos: { value: 0, subtitle: 'últimos 30 dias' }
        }
    }
}

/**
 * ============================================================================
 * PERFORMANCE DA IA
 * ============================================================================
 */

export async function getAIPerformanceMetrics() {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    try {
        // Total de interações
        const { data: interactions } = await supabase
            .from('bot_interactions')
            .select('status, error_message')
            .gte('created_at', `${today}T00:00:00`)

        const total = interactions?.length || 0

        // Atendimentos automatizados (sem escalação)
        const automatizados = interactions?.filter(i =>
            i.status === 'success' &&
            (!i.error_message || !i.error_message.toLowerCase().includes('escalad'))
        ).length || 0

        const taxaAutomacao = total > 0 ? Math.round(automatizados / total * 100 * 10) / 10 : 0

        // Escalações humanas
        const escalacoes = interactions?.filter(i =>
            i.status === 'error' ||
            (i.error_message && (
                i.error_message.toLowerCase().includes('escalad') ||
                i.error_message.toLowerCase().includes('humano')
            ))
        ).length || 0

        // Tempo médio de resposta (placeholder - seria necessário campo específico)
        const tempoMedio = 2.3

        // Desvios Dr. Elder (placeholder - seria necessário lógica específica)
        const desviosDrElder = 1

        return {
            atendimentos_automatizados: {
                value: taxaAutomacao,
                variation: 5.0 // Placeholder
            },
            escalacoes_humanas: {
                value: escalacoes,
                variation: -25.0 // Placeholder (negativo é bom)
            },
            tempo_medio_resposta: {
                value: tempoMedio,
                unit: 's'
            },
            desvios_dr_elder: {
                value: desviosDrElder
            }
        }
    } catch (error) {
        console.error('Error fetching AI performance metrics:', error)
        return {
            atendimentos_automatizados: { value: 0, variation: 0 },
            escalacoes_humanas: { value: 0, variation: 0 },
            tempo_medio_resposta: { value: 0, unit: 's' },
            desvios_dr_elder: { value: 0 }
        }
    }
}

/**
 * ============================================================================
 * DISTRIBUIÇÃO E ANÁLISES
 * ============================================================================
 */

export async function getDistributionMetrics() {
    const supabase = await createClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

    try {
        // Distribuição por profissional (últimos 7 dias)
        const { data: porProfissional } = await supabase
            .from('bot_interactions')
            .select('dentist_name')
            .eq('operation_type', 'create_calendar')
            .gte('created_at', sevenDaysAgo)

        const profissionais = {}
        porProfissional?.forEach(a => {
            const prof = a.dentist_name || 'Não especificado'
            profissionais[prof] = (profissionais[prof] || 0) + 1
        })

        // Distribuição por tipo de tratamento (últimos 7 dias)
        const { data: porTratamento } = await supabase
            .from('bot_interactions')
            .select('appointment_category')
            .eq('operation_type', 'create_calendar')
            .gte('created_at', sevenDaysAgo)

        const tratamentos = {}
        porTratamento?.forEach(a => {
            const tipo = a.appointment_category || 'Não especificado'
            tratamentos[tipo] = (tratamentos[tipo] || 0) + 1
        })

        // Principais motivos de escalação (últimos 30 dias)
        const { data: escalacoes } = await supabase
            .from('bot_interactions')
            .select('error_message')
            .gte('created_at', thirtyDaysAgo)
            .or('status.eq.error,error_message.ilike.%escalad%')

        const motivos = {
            'Caso complexo': 0,
            'Paciente Dr. Elder': 0,
            'Horário especial': 0,
            'Emergência': 0,
            'Outros': 0
        }

        escalacoes?.forEach(e => {
            const msg = e.error_message?.toLowerCase() || ''
            if (msg.includes('complexo')) motivos['Caso complexo']++
            else if (msg.includes('elder')) motivos['Paciente Dr. Elder']++
            else if (msg.includes('horário') || msg.includes('especial')) motivos['Horário especial']++
            else if (msg.includes('emergência') || msg.includes('urgente')) motivos['Emergência']++
            else motivos['Outros']++
        })

        return {
            por_profissional: Object.entries(profissionais).map(([nome, total]) => ({
                nome: formatProfessionalName(nome),
                total
            })).sort((a, b) => b.total - a.total),
            por_tratamento: Object.entries(tratamentos).map(([tipo, total]) => ({
                tipo,
                total
            })).sort((a, b) => b.total - a.total),
            motivos_escalacao: Object.entries(motivos).map(([motivo, total]) => ({
                motivo,
                total
            })).sort((a, b) => b.total - a.total)
        }
    } catch (error) {
        console.error('Error fetching distribution metrics:', error)
        return {
            por_profissional: [],
            por_tratamento: [],
            motivos_escalacao: []
        }
    }
}

/**
 * Helper: Format professional names
 */
function formatProfessionalName(id) {
    const mapping = {
        'silvana': 'Dra. Silvana',
        'petrus': 'Dr. Petrus',
        'elder': 'Dr. Elder'
    }
    return mapping[id?.toLowerCase()] || id || 'Não especificado'
}

/**
 * ============================================================================
 * LEGACY FUNCTIONS (mantidas para compatibilidade)
 * ============================================================================
 */

export async function getDashboardMetrics() {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    try {
        const { data: interactions, error } = await supabase
            .from('bot_interactions')
            .select('id, patient_id, status, created_at')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`)

        if (error) {
            console.error('Error fetching interactions for metrics:', error)
            return null
        }

        const total_interactions = interactions.length
        const active_users = new Set(interactions.map(i => i.patient_id).filter(Boolean)).size
        const successCount = interactions.filter(i => i.status === 'success').length
        const success_rate = total_interactions > 0 ? Math.round((successCount / total_interactions) * 100) : 0

        return {
            total_interactions,
            active_users,
            success_rate
        }
    } catch (err) {
        console.error('Unexpected error fetching metrics:', err)
        return null
    }
}

export async function getRecentInteractions(limit = 7) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('bot_interactions')
            .select('id, created_at, operation_type, status, patient_name, error_message, raw_data')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching recent interactions:', error)
            return []
        }

        return data.map(item => ({
            id: item.id,
            created_at: item.created_at,
            user_message: formatOperationType(item.operation_type),
            bot_response: item.error_message || "Processado com sucesso",
            status: item.status,
            patient_name: item.patient_name
        }))
    } catch (err) {
        console.error('Unexpected error fetching interactions:', err)
        return []
    }
}

function formatOperationType(type) {
    if (!type) return "Interação Genérica";
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function getMetricsHistory(days = 7) {
    const supabase = await createClient()
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    try {
        const { data, error } = await supabase
            .from('bot_interactions')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())

        if (error) {
            console.error('Error fetching metrics history:', error)
            return []
        }

        const historyMap = {};
        data.forEach(item => {
            const date = item.created_at.split('T')[0];
            if (!historyMap[date]) {
                historyMap[date] = 0;
            }
            historyMap[date]++;
        });

        return Object.entries(historyMap).map(([date, count]) => ({
            date,
            total_interactions: count,
            active_users: 0
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

    } catch (err) {
        console.error('Unexpected error fetching history:', err)
        return []
    }
}
