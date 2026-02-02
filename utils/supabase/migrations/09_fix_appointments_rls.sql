-- Enable RLS on the new tables
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_pacientes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to READ all appointments
CREATE POLICY "Authenticated users can select appointments"
ON appointments FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow authenticated users to INSERT/UPDATE/DELETE appointments
CREATE POLICY "Authenticated users can modify appointments"
ON appointments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 3: Allow authenticated users to READ all patients
CREATE POLICY "Authenticated users can select cache_pacientes"
ON cache_pacientes FOR SELECT
TO authenticated
USING (true);

-- Policy 4: Allow authenticated users to modify patients
CREATE POLICY "Authenticated users can modify cache_pacientes"
ON cache_pacientes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 5: Service Role Bypass (Just in case)
CREATE POLICY "Service role full access appointments"
ON appointments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access cache_pacientes"
ON cache_pacientes FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
