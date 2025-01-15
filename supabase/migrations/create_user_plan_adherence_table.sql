-- Vytvoření tabulky user_plan_adherence
CREATE TABLE public.user_plan_adherence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_supplements INT NOT NULL DEFAULT 0,
  taken_supplements INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Vytvoření indexu pro rychlejší vyhledávání
CREATE INDEX idx_user_plan_adherence_user_id ON public.user_plan_adherence(user_id);

-- Nastavení RLS politik
ALTER TABLE public.user_plan_adherence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan adherence"
  ON public.user_plan_adherence
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan adherence"
  ON public.user_plan_adherence
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger pro automatickou aktualizaci last_updated
CREATE OR REPLACE FUNCTION update_user_plan_adherence_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_plan_adherence_last_updated
BEFORE UPDATE ON public.user_plan_adherence
FOR EACH ROW
EXECUTE FUNCTION update_user_plan_adherence_last_updated();

-- Vytvoření funkce pro inicializaci záznamu uživatele
CREATE OR REPLACE FUNCTION initialize_user_plan_adherence()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_plan_adherence (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vytvoření triggeru pro automatickou inicializaci záznamu při vytvoření nového uživatele
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION initialize_user_plan_adherence();

