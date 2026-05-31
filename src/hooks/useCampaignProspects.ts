import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CategoryType } from "@/components/ui/badge-category";
import type { StageType } from "@/components/ProspectCard";



export interface CampaignProspect {
  id: string;
  campaignId: string;
  prospectId: string;
  allCampaignProspectIds: string[];
  allCampaignIds: string[];
  name: string;
  category: CategoryType;
  categoryLabel: string;
  categoryId: string | null;
  bakery: string;
  bakeryId: string | null;
  stage: string;
  stageType: StageType;
  currentStep: number;
  campaignCurrentStep: number;
  totalSteps: number;
  context: string;
  offers: string[];
  offer: string | null;
  lastSentDate: string;
  lastSentAt: string | null;
  responseReceivedAt?: string | null;
  status: "response" | "in_progress" | "finished";
}

// Map DB category name -> internal CategoryType used by the UI badges
const mapCategory = (name?: string | null): { id: CategoryType; label: string } => {
  const n = (name ?? "").toLowerCase();
  if (n.startsWith("restaur")) return { id: "restauration", label: "Restaurant" };
  if (n.startsWith("héberg") || n.startsWith("heberg")) return { id: "hebergement", label: "Hébergement" };
  if (n.startsWith("éduc") || n.startsWith("educ")) return { id: "education", label: "Éducation" };
  if (n.startsWith("entrep") || n.startsWith("profess")) return { id: "entreprises", label: "Entreprise" };
  if (n.startsWith("collectiv")) return { id: "collectivites", label: "Collectivité" };
  return { id: "entreprises", label: name || "Entreprise" };
};

const formatFrDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const buildStage = (status: string, currentStep: number | null): { stage: string; stageType: StageType; currentStep: number } => {
  const step = currentStep ?? 0;
  const stepLabels: Record<number, string> = {
    0: "Premier contact",
    1: "Premier contact",
    2: "Relance 1",
    3: "Relance 2",
    4: "Relance 3",
    5: "Dernier message",
  };
  if (status === "replied") {
    return { stage: "Réponse reçue", stageType: "response", currentStep: Math.max(step, 1) };
  }
  if (status === "completed_no_reply" || status === "finished") {
    return { stage: "Terminé", stageType: "finished", currentStep: 5 };
  }
  // in_progress
  if (step <= 1) {
    return { stage: stepLabels[step], stageType: "initial", currentStep: 1 };
  }
  return { stage: stepLabels[step] ?? `Relance ${step - 1}`, stageType: "relance", currentStep: step };
};

const mapStatus = (status: string): CampaignProspect["status"] => {
  if (status === "replied") return "response";
  if (status === "completed_no_reply" || status === "finished") return "finished";
  return "in_progress";
};

export const useCampaignProspects = () => {
  const [prospects, setProspects] = useState<CampaignProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("campaign_prospects")
        .select(`
          id, campaign_id, prospect_id, status, current_step, last_sent_at, replied_at,
          campaign:campaigns ( bakery_id ),
          prospect:prospects ( name, city, offer, category_id, category:prospect_categories(name) )
        `);

      console.log("campaign_prospects data:", data, "error:", error);

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setProspects([]);
        setLoading(false);
        return;
      }

      const rawRows: any[] = data ?? [];

      // Group by prospect_id to merge duplicates (same prospect across multiple campaigns/waves)
      const groups = new Map<string, any[]>();
      for (const row of rawRows) {
        const key = row.prospect_id;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
      }

      const statusPriority = (s: string): number => {
        if (s === "replied") return 0;
        if (s === "in_progress") return 1;
        if (s === "completed_no_reply") return 2;
        return 3; // finished/completed
      };

      const mapped: CampaignProspect[] = Array.from(groups.values()).map((rows) => {
        // Pick representative: highest status priority, then most recent last_sent_at, then highest current_step
        const sorted = [...rows].sort((a, b) => {
          const sp = statusPriority(a.status) - statusPriority(b.status);
          if (sp !== 0) return sp;
          const ta = a.last_sent_at ? new Date(a.last_sent_at).getTime() : 0;
          const tb = b.last_sent_at ? new Date(b.last_sent_at).getTime() : 0;
          if (tb !== ta) return tb - ta;
          return (b.current_step ?? 0) - (a.current_step ?? 0);
        });
        const row = sorted[0];

        // Aggregate: latest last_sent_at across all rows, max current_step, any replied
        const latestSentAt = rows
          .map((r) => (r.last_sent_at ? new Date(r.last_sent_at).getTime() : 0))
          .reduce((m, t) => Math.max(m, t), 0);
        const lastSentAt = latestSentAt ? new Date(latestSentAt).toISOString() : null;
        const maxStep = rows.reduce((m, r) => Math.max(m, r.current_step ?? 0), 0);
        const anyReplied = rows.some((r) => r.status === "replied");
        const anyInProgress = rows.some((r) => r.status === "in_progress");
        const aggregatedStatus = anyReplied
          ? "replied"
          : anyInProgress
          ? "in_progress"
          : row.status;

        const p = row.prospect ?? {};
        const cat = mapCategory(p?.category?.name);
        const stageInfo = buildStage(aggregatedStatus, maxStep);
        const city = p?.city ?? "";
        const bakeryId = row.campaign?.bakery_id ?? null;
        return {
          id: row.id,
          campaignId: row.campaign_id,
          prospectId: row.prospect_id,
          allCampaignProspectIds: rows.map((r) => r.id),
          allCampaignIds: Array.from(new Set(rows.map((r) => r.campaign_id))),
          name: p?.name ?? "Prospect",
          category: cat.id,
          categoryLabel: cat.label,
          categoryId: p?.category_id ?? null,
          bakery: bakeryId ?? "",
          bakeryId,
          stage: stageInfo.stage,
          stageType: stageInfo.stageType,
          currentStep: stageInfo.currentStep,
          campaignCurrentStep: maxStep,
          totalSteps: 5,
          context: city ? `${cat.label} — ${city}` : cat.label,
          offers: p?.offer ? [p.offer] : [],
          offer: p?.offer ?? null,
          lastSentDate: formatFrDate(lastSentAt),
          lastSentAt,
          responseReceivedAt: rows.find((r) => r.replied_at)?.replied_at ?? null,
          status: mapStatus(aggregatedStatus),
        };
      });

      setProspects(mapped);
      setError(null);
      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { prospects, loading, error };
};
