-- Seed bot_interactions with test data for today
-- This will populate the dashboard with realistic data

INSERT INTO bot_interactions (
    conversation_id,
    phone_number,
    patient_id,
    patient_name,
    operation_type,
    status,
    dentist_id,
    dentist_name,
    appointment_date,
    appointment_time,
    appointment_category,
    raw_data,
    created_at
) VALUES
-- Agendamentos bem-sucedidos (hoje)
(
    'conv_001',
    '37999584147',
    'patient_001',
    'Maria Paula Martins',
    'create_calendar',
    'success',
    'silvana',
    'Dra. Silvana',
    CURRENT_DATE + 1,
    '17:00:00',
    'Clínico',
    '{"procedure": "consulta_clinico", "payment_method": "pix"}'::jsonb,
    NOW() - INTERVAL '2 hours'
),
(
    'conv_002',
    '37999254416',
    'patient_002',
    'Hiandara Goulart Rodarte',
    'create_calendar',
    'success',
    'petrus',
    'Dr. Petrus',
    CURRENT_DATE + 1,
    '13:30:00',
    'Avaliação',
    '{"procedure": "avaliacao", "payment_method": "pix"}'::jsonb,
    NOW() - INTERVAL '1 hour'
),
(
    'conv_003',
    '37998760536',
    'patient_003',
    'Elaine Cristina Silva',
    'create_calendar',
    'success',
    'silvana',
    'Dra. Silvana',
    CURRENT_DATE + 1,
    '10:00:00',
    'Clínico',
    '{"procedure": "consulta_clinico", "payment_method": "credito"}'::jsonb,
    NOW() - INTERVAL '30 minutes'
),
(
    'conv_004',
    '31993938506',
    'patient_004',
    'Diogo Gontijo Cunha Alves',
    'create_calendar',
    'success',
    'elder',
    'Dr. Elder',
    CURRENT_DATE + 1,
    '16:00:00',
    'Ortodontia Interceptativa',
    '{"procedure": "ortodontia", "payment_method": "pix"}'::jsonb,
    NOW() - INTERVAL '3 hours'
),

-- Cancelamento
(
    'conv_005',
    '37999515146',
    'patient_005',
    'Rozelia Maria Gomes Santos',
    'deletar_evento',
    'success',
    NULL,
    NULL,
    CURRENT_DATE + 2,
    '15:00:00',
    'Clínico',
    '{"reason": "conflito_agenda"}'::jsonb,
    NOW() - INTERVAL '4 hours'
),

-- Escalação para humano
(
    'conv_006',
    '37999123456',
    'patient_006',
    'João da Silva',
    'create_calendar',
    'error',
    'elder',
    'Dr. Elder',
    NULL,
    NULL,
    NULL,
    '{"error": "Paciente especial Dr. Elder - requer atenção humana"}'::jsonb,
    NOW() - INTERVAL '5 hours'
),

-- Dados de ontem para comparação
(
    'conv_yesterday_001',
    '37999111111',
    'patient_007',
    'Carlos Oliveira',
    'create_calendar',
    'success',
    'silvana',
    'Dra. Silvana',
    CURRENT_DATE,
    '14:00:00',
    'Clínico',
    '{"procedure": "consulta_clinico", "payment_method": "pix"}'::jsonb,
    NOW() - INTERVAL '1 day'
),
(
    'conv_yesterday_002',
    '37999222222',
    'patient_008',
    'Ana Costa',
    'create_calendar',
    'success',
    'petrus',
    'Dr. Petrus',
    CURRENT_DATE,
    '15:00:00',
    'Avaliação',
    '{"procedure": "avaliacao", "payment_method": "credito"}'::jsonb,
    NOW() - INTERVAL '1 day'
);
