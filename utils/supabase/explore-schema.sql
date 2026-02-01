-- Exploration queries to understand table structures
-- Run these in Supabase SQL Editor to see what data is available

-- 1. Check bot_interactions structure and sample data
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'bot_interactions'
ORDER BY ordinal_position;

-- Sample data from bot_interactions (last 5 records)
SELECT * FROM bot_interactions 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check bot_metrics_daily structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'bot_metrics_daily'
ORDER BY ordinal_position;

-- Sample data from bot_metrics_daily
SELECT * FROM bot_metrics_daily 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check cache_pacientes structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cache_pacientes'
ORDER BY ordinal_position;

-- Sample data from cache_pacientes
SELECT * FROM cache_pacientes 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check crm_appointments structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'crm_appointments'
ORDER BY ordinal_position;

-- Sample data from crm_appointments
SELECT * FROM crm_appointments 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Count records in each table
SELECT 
    'bot_interactions' as table_name,
    COUNT(*) as total_records
FROM bot_interactions
UNION ALL
SELECT 
    'bot_metrics_daily',
    COUNT(*)
FROM bot_metrics_daily
UNION ALL
SELECT 
    'cache_pacientes',
    COUNT(*)
FROM cache_pacientes
UNION ALL
SELECT 
    'crm_appointments',
    COUNT(*)
FROM crm_appointments;
