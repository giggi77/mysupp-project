-- Vytvoření tabulky pro historii váhy
CREATE TABLE public.weight_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nastavení RLS politik pro tabulku weight_history
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weight history"
  ON public.weight_history FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own weight history"
  ON public.weight_history FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Přidání sloupce questionnaire_data do tabulky users
ALTER TABLE public.usersALTER TABLE public.users
ADD COLUMN questionnaire_data JSONB;

-- Vytvoření indexu pro rychlejší vyhledávání v questionnaire_data
CREATE INDEX idx_users_questionnaire_data ON public.users USING GIN (questionnaire_data);

-- Aktualizace RLS politik pro tabulku users
CREATE POLICY "Users can update their own questionnaire data"
  ON public.users FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

-- Přidání triggeru pro automatickou aktualizaci sloupce updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_modtime
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

