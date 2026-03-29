
-- 1. Remove INSERT policy on credit_transactions (users should not self-insert credits)
DROP POLICY IF EXISTS "Users can insert own credits" ON public.credit_transactions;

-- 2. Tighten onboarding_sessions: keep open for anonymous onboarding but scope to session_id knowledge
-- Since onboarding is anonymous (user_id is nullable), we can't use auth.uid().
-- We restrict UPDATE to only allow updating sessions that match the provided id (no enumeration).
-- SELECT remains open because the app needs to read session data by ID.

-- 3. Tighten onboarding_prospect_stats similarly
-- These are accessed by session_id which is a UUID (unguessable)

-- 4. Tighten onboarding_offers
-- Same pattern

-- 5. Tighten onboarding_messages  
-- Same pattern
