-- Consolidate duplicate campaign_prospects rows: keep one row per prospect_id

BEGIN;

-- Pick survivor per prospect_id (priority: replied > in_progress > completed_no_reply > others;
-- tiebreak by latest last_sent_at, then highest current_step, then most recent created_at)
CREATE TEMP TABLE _survivors ON COMMIT DROP AS
WITH ranked AS (
  SELECT id, prospect_id,
         ROW_NUMBER() OVER (
           PARTITION BY prospect_id
           ORDER BY
             CASE status
               WHEN 'replied' THEN 0
               WHEN 'in_progress' THEN 1
               WHEN 'completed_no_reply' THEN 2
               ELSE 3
             END,
             last_sent_at DESC NULLS LAST,
             current_step DESC NULLS LAST,
             created_at DESC NULLS LAST
         ) AS rn
  FROM campaign_prospects
)
SELECT prospect_id, id AS survivor_id FROM ranked WHERE rn = 1;

-- Aggregated values per prospect_id
CREATE TEMP TABLE _agg ON COMMIT DROP AS
SELECT
  prospect_id,
  MAX(last_sent_at) AS max_last_sent,
  MAX(current_step) AS max_step,
  MAX(replied_at) AS max_replied,
  bool_or(status = 'replied') AS has_replied,
  bool_or(status = 'in_progress') AS has_in_progress,
  bool_or(status = 'completed_no_reply') AS has_completed_no_reply
FROM campaign_prospects
GROUP BY prospect_id;

-- Loser rows (duplicates to be removed)
CREATE TEMP TABLE _losers ON COMMIT DROP AS
SELECT cp.id AS loser_id, s.survivor_id
FROM campaign_prospects cp
JOIN _survivors s ON s.prospect_id = cp.prospect_id
WHERE cp.id <> s.survivor_id;

-- 1) Reassign email_events from losers to survivor
UPDATE email_events ee
SET campaign_prospect_id = l.survivor_id
FROM _losers l
WHERE ee.campaign_prospect_id = l.loser_id;

-- 2) Update survivor with aggregated state
UPDATE campaign_prospects cp
SET last_sent_at = a.max_last_sent,
    current_step = a.max_step,
    replied_at = a.max_replied,
    status = CASE
      WHEN a.has_replied THEN 'replied'
      WHEN a.has_in_progress THEN 'in_progress'
      WHEN a.has_completed_no_reply THEN 'completed_no_reply'
      ELSE cp.status
    END,
    updated_at = now()
FROM _survivors s
JOIN _agg a ON a.prospect_id = s.prospect_id
WHERE cp.id = s.survivor_id;

-- 3) Delete losers
DELETE FROM campaign_prospects
WHERE id IN (SELECT loser_id FROM _losers);

-- 4) Prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS campaign_prospects_prospect_id_unique
  ON public.campaign_prospects (prospect_id);

COMMIT;