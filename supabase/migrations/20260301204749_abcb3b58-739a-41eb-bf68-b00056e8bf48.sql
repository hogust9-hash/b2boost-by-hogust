
-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- BAKERIES
-- =============================================
CREATE TABLE public.bakeries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bakeries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bakeries" ON public.bakeries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bakeries" ON public.bakeries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bakeries" ON public.bakeries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bakeries" ON public.bakeries FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PROSPECT CATEGORIES (public read, admin insert)
-- =============================================
CREATE TABLE public.prospect_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT
);
ALTER TABLE public.prospect_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON public.prospect_categories FOR SELECT USING (true);

-- Seed categories
INSERT INTO public.prospect_categories (name, icon_name) VALUES
  ('Restauration', 'utensils'),
  ('Hébergement', 'bed-double'),
  ('Éducation', 'graduation-cap'),
  ('Entreprises', 'building-2'),
  ('Collectivités', 'landmark'),
  ('Professions libérales', 'briefcase');

-- =============================================
-- PROSPECTS
-- =============================================
CREATE TABLE public.prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bakery_id UUID NOT NULL REFERENCES public.bakeries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.prospect_categories(id),
  address TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prospects" ON public.prospects FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = prospects.bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Users can insert own prospects" ON public.prospects FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = prospects.bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Users can update own prospects" ON public.prospects FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = prospects.bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Users can delete own prospects" ON public.prospects FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = prospects.bakery_id AND bakeries.user_id = auth.uid()));

-- =============================================
-- OFFERS
-- =============================================
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bakery_id UUID NOT NULL REFERENCES public.bakeries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  price NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own offers" ON public.offers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = offers.bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Users can insert own offers" ON public.offers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = offers.bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Users can update own offers" ON public.offers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = offers.bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Users can delete own offers" ON public.offers FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = offers.bakery_id AND bakeries.user_id = auth.uid()));

-- =============================================
-- CAMPAIGNS
-- =============================================
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bakery_id UUID NOT NULL REFERENCES public.bakeries(id) ON DELETE CASCADE,
  target_category_id UUID REFERENCES public.prospect_categories(id),
  wave_size INTEGER NOT NULL DEFAULT 25,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns" ON public.campaigns FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = campaigns.bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Users can insert own campaigns" ON public.campaigns FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = campaigns.bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Users can update own campaigns" ON public.campaigns FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = campaigns.bakery_id AND bakeries.user_id = auth.uid()));
CREATE POLICY "Users can delete own campaigns" ON public.campaigns FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.bakeries WHERE bakeries.id = campaigns.bakery_id AND bakeries.user_id = auth.uid()));

-- =============================================
-- CAMPAIGN MESSAGES
-- =============================================
CREATE TABLE public.campaign_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  subject TEXT,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign messages" ON public.campaign_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    JOIN public.bakeries b ON b.id = c.bakery_id
    WHERE c.id = campaign_messages.campaign_id AND b.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own campaign messages" ON public.campaign_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns c
    JOIN public.bakeries b ON b.id = c.bakery_id
    WHERE c.id = campaign_messages.campaign_id AND b.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own campaign messages" ON public.campaign_messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    JOIN public.bakeries b ON b.id = c.bakery_id
    WHERE c.id = campaign_messages.campaign_id AND b.user_id = auth.uid()
  ));

-- =============================================
-- CREDIT TRANSACTIONS
-- =============================================
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credits" ON public.credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
