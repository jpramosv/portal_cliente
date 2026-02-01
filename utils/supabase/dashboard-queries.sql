-- ============================================================================
-- DASHBOARD DE AGENDAMENTOS - SQL QUERIES
-- ============================================================================
-- Queries para todas as métricas do dashboard baseadas nas tabelas:
-- - crm_appointments
-- - bot_interactions  
-- - bot_metrics_daily
-- - cache_pacientes
-- ============================================================================

-- ============================================================================
-- MÉTRICAS OPERACIONAIS
-- ============================================================================

-- 1. TOTAL DE AGENDAMENTOS (com comparação período anterior)
-- Retorna: total_atual, total_anterior, variacao_percentual
WITH periodo_atual AS (
    SELECT COUNT(*) as total
    FROM crm_appointments
    WHERE created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day'
),
periodo_anterior AS (
    SELECT COUNT(*) as total
    FROM crm_appointments
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
      AND created_at < CURRENT_DATE
)
SELECT 
    pa.total as total_atual,
    pp.total as total_anterior,
    CASE 
        WHEN pp.total > 0 THEN ROUND(((pa.total - pp.total)::numeric / pp.total * 100), 1)
        ELSE 0 
    END as variacao_percentual
FROM periodo_atual pa, periodo_anterior pp;

-- 2. TAXA DE CONFIRMAÇÃO (% de agendamentos confirmados)
WITH hoje AS (
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmados
    FROM crm_appointments
    WHERE created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day'
),
ontem AS (
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmados
    FROM crm_appointments
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
      AND created_at < CURRENT_DATE
)
SELECT 
    CASE WHEN h.total > 0 THEN ROUND((h.confirmados::numeric / h.total * 100), 1) ELSE 0 END as taxa_hoje,
    CASE WHEN o.total > 0 THEN ROUND((o.confirmados::numeric / o.total * 100), 1) ELSE 0 END as taxa_ontem,
    CASE 
        WHEN o.total > 0 AND h.total > 0 THEN 
            ROUND(((h.confirmados::numeric / h.total) - (o.confirmados::numeric / o.total)) * 100, 1)
        ELSE 0 
    END as variacao_pontos_percentuais
FROM hoje h, ontem o;

-- 3. TAXA DE OCUPAÇÃO (horários ocupados vs disponíveis)
-- Assumindo horário comercial: 8h-18h (10h/dia), 5 dias/semana, slots de 30min = 20 slots/dia
WITH slots_ocupados AS (
    SELECT COUNT(*) as ocupados
    FROM crm_appointments
    WHERE start_time >= CURRENT_DATE
      AND start_time < CURRENT_DATE + INTERVAL '1 day'
      AND status NOT IN ('cancelled', 'no-show')
),
slots_totais AS (
    SELECT 20 as total -- 10 horas * 2 slots por hora
)
SELECT 
    so.ocupados,
    st.total,
    ROUND((so.ocupados::numeric / st.total * 100), 1) as taxa_ocupacao
FROM slots_ocupados so, slots_totais st;

-- 4. TAXA DE CANCELAMENTO
WITH hoje AS (
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelados
    FROM crm_appointments
    WHERE created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day'
),
ontem AS (
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelados
    FROM crm_appointments
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
      AND created_at < CURRENT_DATE
)
SELECT 
    CASE WHEN h.total > 0 THEN ROUND((h.cancelados::numeric / h.total * 100), 1) ELSE 0 END as taxa_hoje,
    CASE WHEN o.total > 0 THEN ROUND((o.cancelados::numeric / o.total * 100), 1) ELSE 0 END as taxa_ontem,
    CASE 
        WHEN o.total > 0 AND h.total > 0 THEN 
            ROUND(((h.cancelados::numeric / h.total) - (o.cancelados::numeric / o.total)) * 100, 1)
        ELSE 0 
    END as variacao_pontos_percentuais
FROM hoje h, ontem o;

-- ============================================================================
-- MÉTRICAS DE PACIENTES
-- ============================================================================

-- 5. NOVOS PACIENTES vs RETORNOS (hoje)
-- Assumindo que cache_pacientes tem created_at para identificar quando o paciente foi cadastrado
WITH agendamentos_hoje AS (
    SELECT DISTINCT 
        a.patient_id,
        p.created_at as paciente_created_at
    FROM crm_appointments a
    LEFT JOIN cache_pacientes p ON a.patient_id = p.patient_id
    WHERE a.created_at >= CURRENT_DATE
      AND a.created_at < CURRENT_DATE + INTERVAL '1 day'
)
SELECT 
    COUNT(*) FILTER (
        WHERE paciente_created_at >= CURRENT_DATE
    ) as novos_pacientes,
    COUNT(*) FILTER (
        WHERE paciente_created_at < CURRENT_DATE
    ) as retornos,
    COUNT(*) as total
FROM agendamentos_hoje;

-- 6. PACIENTES ATIVOS (últimos 30 dias)
SELECT COUNT(DISTINCT patient_id) as pacientes_ativos_30d
FROM crm_appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND created_at <= CURRENT_DATE;

-- ============================================================================
-- PERFORMANCE DA IA
-- ============================================================================

-- 7. ATENDIMENTOS AUTOMATIZADOS (% de interações que não escalaram)
-- Assumindo que existe um campo indicando escalação ou que operation_type específico indica escalação
WITH hoje AS (
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (
            WHERE status = 'success' 
            AND (error_message IS NULL OR error_message NOT ILIKE '%escalad%')
        ) as automatizados
    FROM bot_interactions
    WHERE created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day'
)
SELECT 
    total,
    automatizados,
    CASE WHEN total > 0 THEN ROUND((automatizados::numeric / total * 100), 1) ELSE 0 END as taxa_automacao
FROM hoje;

-- 8. ESCALAÇÕES HUMANAS (total de casos escalados)
SELECT COUNT(*) as total_escalacoes
FROM bot_interactions
WHERE created_at >= CURRENT_DATE
  AND created_at < CURRENT_DATE + INTERVAL '1 day'
  AND (
      status = 'error' 
      OR error_message ILIKE '%escalad%'
      OR error_message ILIKE '%humano%'
  );

-- 9. TEMPO MÉDIO DE RESPOSTA
-- Se bot_interactions tiver campo response_time_ms, usar isso
-- Caso contrário, estimar baseado em created_at differences
SELECT 
    ROUND(AVG(2300)) as tempo_medio_ms, -- Placeholder: 2.3s
    '2.3s' as tempo_medio_formatado
FROM bot_interactions
WHERE created_at >= CURRENT_DATE
  AND created_at < CURRENT_DATE + INTERVAL '1 day'
  AND status = 'success';

-- 10. DESVIOS DR. ELDER
-- Contar quantos pacientes com preferência pelo Dr. Elder foram atendidos por outro profissional
-- Assumindo que cache_pacientes tem campo preferred_professional_id
SELECT COUNT(*) as desvios_dr_elder
FROM crm_appointments a
LEFT JOIN cache_pacientes p ON a.patient_id = p.patient_id
WHERE a.created_at >= CURRENT_DATE
  AND a.created_at < CURRENT_DATE + INTERVAL '1 day'
  AND p.preferred_professional_id = 'elder' -- ou ID específico
  AND a.professional_id != 'elder';

-- ============================================================================
-- DISTRIBUIÇÃO E ANÁLISES
-- ============================================================================

-- 11. DISTRIBUIÇÃO POR PROFISSIONAL (últimos 7 dias)
-- Assumindo que professional_id pode ser mapeado para nome
SELECT 
    COALESCE(professional_id, 'Não especificado') as profissional,
    COUNT(*) as total_agendamentos
FROM crm_appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  AND created_at <= CURRENT_DATE
GROUP BY professional_id
ORDER BY total_agendamentos DESC;

-- 12. TIPOS DE TRATAMENTO (últimos 7 dias)
SELECT 
    COALESCE(procedure_type, 'Não especificado') as tipo_tratamento,
    COUNT(*) as total
FROM crm_appointments
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  AND created_at <= CURRENT_DATE
GROUP BY procedure_type
ORDER BY total DESC;

-- 13. PRINCIPAIS MOTIVOS DE ESCALAÇÃO
-- Extrair motivo do error_message ou usar campo específico se existir
WITH escalacoes AS (
    SELECT 
        error_message,
        CASE 
            WHEN error_message ILIKE '%complexo%' THEN 'Caso complexo'
            WHEN error_message ILIKE '%elder%' THEN 'Paciente Dr. Elder'
            WHEN error_message ILIKE '%horário%' OR error_message ILIKE '%especial%' THEN 'Horário especial'
            WHEN error_message ILIKE '%emergência%' OR error_message ILIKE '%urgente%' THEN 'Emergência'
            ELSE 'Outros'
        END as motivo
    FROM bot_interactions
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      AND (
          status = 'error' 
          OR error_message ILIKE '%escalad%'
      )
)
SELECT 
    motivo,
    COUNT(*) as total
FROM escalacoes
GROUP BY motivo
ORDER BY total DESC;

-- ============================================================================
-- QUERY CONSOLIDADA PARA DASHBOARD (todas métricas de uma vez)
-- ============================================================================
-- Esta query retorna um JSON com todas as métricas para otimizar chamadas ao DB

SELECT jsonb_build_object(
    'operacionais', jsonb_build_object(
        'total_agendamentos', (
            SELECT COUNT(*) 
            FROM crm_appointments 
            WHERE created_at >= CURRENT_DATE
        ),
        'taxa_confirmacao', (
            SELECT ROUND(
                COUNT(*) FILTER (WHERE status = 'confirmed')::numeric / 
                NULLIF(COUNT(*), 0) * 100, 1
            )
            FROM crm_appointments
            WHERE created_at >= CURRENT_DATE
        ),
        'taxa_cancelamento', (
            SELECT ROUND(
                COUNT(*) FILTER (WHERE status = 'cancelled')::numeric / 
                NULLIF(COUNT(*), 0) * 100, 1
            )
            FROM crm_appointments
            WHERE created_at >= CURRENT_DATE
        )
    ),
    'pacientes', jsonb_build_object(
        'ativos_30d', (
            SELECT COUNT(DISTINCT patient_id)
            FROM crm_appointments
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        )
    ),
    'performance_ia', jsonb_build_object(
        'total_interacoes', (
            SELECT COUNT(*)
            FROM bot_interactions
            WHERE created_at >= CURRENT_DATE
        ),
        'taxa_automacao', (
            SELECT ROUND(
                COUNT(*) FILTER (WHERE status = 'success')::numeric / 
                NULLIF(COUNT(*), 0) * 100, 1
            )
            FROM bot_interactions
            WHERE created_at >= CURRENT_DATE
        )
    )
) as dashboard_metrics;
