
CREATE TABLE public.onboarding_prospect_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE,
  total_cibles text,
  total_cibles_adressables text,
  categories jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_prospect_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stats" ON public.onboarding_prospect_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can insert stats" ON public.onboarding_prospect_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update stats" ON public.onboarding_prospect_stats FOR UPDATE USING (true);
