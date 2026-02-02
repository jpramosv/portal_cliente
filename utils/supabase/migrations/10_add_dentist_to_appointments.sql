-- Add dentist_id column to appointments table
ALTER TABLE appointments ADD COLUMN dentist_id bigint;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_dentist_id ON appointments USING btree (dentist_id);
