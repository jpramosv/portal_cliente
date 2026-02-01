-- CLEAN SLATE MIGRATION (V2 - No External ID Column)
-- Drop existing table
DROP TABLE IF EXISTS appointments CASCADE;

-- Recreate table
CREATE TABLE appointments (
  -- Internal ID
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Patient Link (The detailed connection)
  patient_id bigint REFERENCES cache_pacientes(id) ON DELETE SET NULL,
  
  -- Schedulling Info
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'scheduled', 
  procedure_type text, 
  notes text,
  
  -- Extra Data (Clinicorp ID will be stored here if needed for debug)
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_dates ON appointments(start_time, end_time);

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for authenticated users" ON appointments FOR UPDATE TO authenticated USING (true);

-- SEED DATA
-- Note: Without a unique external_id column, we cannot easily use ON CONFLICT to prevent duplicates based on source ID.
-- We will just Insert. If running multiple times, this will create duplicates unless we clear table first (which existing DROP does).

INSERT INTO appointments (patient_id, start_time, end_time, status, procedure_type, metadata)
VALUES
-- Maria Paula Martins
(
    (SELECT id FROM cache_pacientes WHERE nome ILIKE 'Maria Paula Martins%' LIMIT 1), 
    '2026-02-02 17:00:00-03', 
    '2026-02-02 17:30:00-03', 
    'scheduled', 
    'Clínico', 
    '{"source_id": "5920922672300033", "patient_name": "Maria Paula Martins", "color": "#ff0000"}'::jsonb
),
-- Hiandara Goulart Rodarte
(
    (SELECT id FROM cache_pacientes WHERE nome ILIKE 'Hiandara Goulart Rodarte%' LIMIT 1), 
    '2026-02-02 13:30:00-03', 
    '2026-02-02 14:00:00-03', 
    'scheduled', 
    'Avaliação', 
    '{"source_id": "4578041999130625", "patient_name": "Hiandara Goulart Rodarte", "color": "#aed581"}'::jsonb
),
-- Rozelia Maria Gomes Santos (Cancelado)
(
    (SELECT id FROM cache_pacientes WHERE nome ILIKE 'Rozelia Maria Gomes Santos%' LIMIT 1), 
    '2026-02-03 15:00:00-03', 
    '2026-02-03 16:00:00-03', 
    'cancelled', 
    'Clínico', 
    '{"source_id": "5715127926587392", "patient_name": "Rozelia Maria Gomes Santos", "color": "#ff0000"}'::jsonb
);
