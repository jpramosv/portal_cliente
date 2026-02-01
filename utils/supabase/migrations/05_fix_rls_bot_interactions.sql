-- Disable RLS temporarily or create proper policies for bot_interactions table

-- Option 1: Disable RLS (apenas para desenvolvimento/dashboard interno)
ALTER TABLE bot_interactions DISABLE ROW LEVEL SECURITY;

-- Option 2: Create policies to allow read access (recomendado)
-- Descomente as linhas abaixo se preferir usar RLS com políticas:

-- ALTER TABLE bot_interactions ENABLE ROW LEVEL SECURITY;
-- 
-- -- Allow authenticated users to read all bot interactions
-- CREATE POLICY "Allow authenticated users to read bot_interactions"
--   ON bot_interactions
--   FOR SELECT
--   TO authenticated
--   USING (true);
-- 
-- -- Allow service role to do everything
-- CREATE POLICY "Service role can do everything on bot_interactions"
--   ON bot_interactions
--   TO service_role
--   USING (true)
--   WITH CHECK (true);
