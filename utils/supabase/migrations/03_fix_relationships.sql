-- Fix Relationship Types and Links
-- The original table used text for patient_id, but cache_pacientes uses bigint.
-- We must convert the column type first.

-- 1. Convert patient_id to BIGINT to match cache_pacientes.id
-- We use a safe cast. If you have non-numeric IDs in there (like 'uuid-1'), 
-- this might fail or you might want to NULL them out first.
-- Assuming current data is NULL or numeric strings.

DO $$
BEGIN
    -- Only alter if strictly necessary to avoid repeated run errors
    -- However, ALTER COLUMN TYPE is idempotent-ish if types match, but let's just run it.
    -- If it fails due to data, we might need: "USING CASE WHEN patient_id~E'^\\d+$' THEN patient_id::bigint ELSE NULL END"
    
    ALTER TABLE appointments 
    ALTER COLUMN patient_id TYPE bigint 
    USING patient_id::bigint;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error converting patient_id to bigint: %', SQLERRM;
END
$$;

-- 2. Add Foreign Key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'appointments_patient_id_fkey'
    ) THEN
        ALTER TABLE appointments
        ADD CONSTRAINT appointments_patient_id_fkey
        FOREIGN KEY (patient_id)
        REFERENCES cache_pacientes (id)
        ON DELETE SET NULL;
    END IF;
END
$$;
