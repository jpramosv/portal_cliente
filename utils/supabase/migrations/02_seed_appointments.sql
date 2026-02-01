-- Seed appointments based on real Clinicorp dump
-- UPDATED: Attempts to link to existing patients in cache_pacientes by NAME.
-- If patient not found, patient_id will be NULL (but appointment is still created).

INSERT INTO appointments (clinicorp_id, patient_id, start_time, end_time, status, procedure_type, notes, metadata)
VALUES
-- Maria Paula Martins (Clínico) - 2026-02-02 17:00
(
    '5920922672300033', 
    (SELECT id FROM cache_pacientes WHERE nome ILIKE 'Maria Paula Martins%' LIMIT 1), 
    '2026-02-02 17:00:00-03', 
    '2026-02-02 17:30:00-03', 
    'scheduled', 
    'Clínico', 
    '',
    '{"patient_name": "Maria Paula Martins", "patient_phone": "37999584147", "color": "#ff0000"}'::jsonb
),
-- Hiandara Goulart Rodarte (Avaliação) - 2026-02-02 13:30
(
    '4578041999130625', 
    (SELECT id FROM cache_pacientes WHERE nome ILIKE 'Hiandara Goulart Rodarte%' LIMIT 1), 
    '2026-02-02 13:30:00-03', 
    '2026-02-02 14:00:00-03', 
    'scheduled', 
    'Avaliação', 
    '',
    '{"patient_name": "Hiandara Goulart Rodarte", "patient_phone": "37999254416", "color": "#aed581"}'::jsonb
),
-- Rozelia Maria Gomes Santos (Cancelado) - 2026-02-03 15:00
(
    '5715127926587392', 
    (SELECT id FROM cache_pacientes WHERE nome ILIKE 'Rozelia Maria Gomes Santos%' LIMIT 1), 
    '2026-02-03 15:00:00-03', 
    '2026-02-03 16:00:00-03', 
    'cancelled', 
    'Clínico', 
    'Deleted in Source',
    '{"patient_name": "Rozelia Maria Gomes Santos", "patient_phone": "37999515146", "color": "#ff0000"}'::jsonb
),
-- Elaine Cristina Silva (Clínico) - 2026-02-02 10:00
(
    '4804106276896768',
    (SELECT id FROM cache_pacientes WHERE nome ILIKE 'Elaine Cristina Silva%' LIMIT 1),
    '2026-02-02 10:00:00-03',
    '2026-02-02 10:30:00-03',
    'scheduled',
    'Clínico',
    '',
    '{"patient_name": "Elaine Cristina Silva", "patient_phone": "37998760536", "color": "#ff0000"}'::jsonb
),
-- Diogo Gontijo Cunha Alves (Ortodontia Interceptativa) - 2026-02-02 16:00
(
    '4964869168168961',
    (SELECT id FROM cache_pacientes WHERE nome ILIKE 'Diogo Gontijo Cunha Alves%' LIMIT 1),
    '2026-02-02 16:00:00-03',
    '2026-02-02 17:00:00-03',
    'scheduled',
    'Ortodontia Interceptativa',
    '',
    '{"patient_name": "Diogo Gontijo Cunha Alves", "patient_phone": "31993938506", "color": "#ffab91"}'::jsonb
)
ON CONFLICT (clinicorp_id) DO UPDATE SET 
    patient_id = EXCLUDED.patient_id, -- Update patient link if found now
    status = EXCLUDED.status,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time;
