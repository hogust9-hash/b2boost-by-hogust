
-- Table pour tracker chaque session d'onboarding
CREATE TABLE public.onboarding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'started',
  bakery_name text,
  bakery_address text,
  bakery_city text,
  bakery_latitude double precision,
  bakery_longitude double precision,
  bakery_radius_km integer DEFAULT 15,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table pour les offres extraites par n8n
CREATE TABLE public.onboarding_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT '',
  category text DEFAULT 'autre',
  description text DEFAULT '',
  price numeric,
  is_selected boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table pour les messages générés par n8n
CREATE TABLE public.onboarding_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  step_number integer NOT NULL,
  subject text,
  body text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS : accès permissif via UUID (pas d'auth pendant l'onboarding)
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_messages ENABLE ROW LEVEL SECURITY;

-- Sessions : anyone can create and read/update by id
CREATE POLICY "Anyone can insert sessions" ON public.onboarding_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read sessions" ON public.onboarding_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can update sessions" ON public.onboarding_sessions FOR UPDATE USING (true);

-- Offers : anyone can read and update (n8n inserts via service role)
CREATE POLICY "Anyone can read offers" ON public.onboarding_offers FOR SELECT USING (true);
CREATE POLICY "Anyone can update offers" ON public.onboarding_offers FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert offers" ON public.onboarding_offers FOR INSERT WITH CHECK (true);

-- Messages : anyone can read (n8n inserts via service role)
CREATE POLICY "Anyone can read messages" ON public.onboarding_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON public.onboarding_messages FOR INSERT WITH CHECK (true);
