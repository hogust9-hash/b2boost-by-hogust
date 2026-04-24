import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CategoryType } from "@/components/ui/badge-category";
import type { StageType } from "@/components/ProspectCard";



export interface CampaignProspect {
  id: string;
  campaignId: string;
  prospectId: string;
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
  if (status === "replied") {
    return { stage: "Réponse reçue", stageType: "response", currentStep: Math.max(step, 1) };
  }
  if (status === "completed_no_reply" || status === "finished") {
    return { stage: "Terminé", stageType: "finished", currentStep: 5 };
  }
  // in_progress
  if (step === 0) {
    return { stage: "Email initial", stageType: "initial", currentStep: 1 };
  }
  return { stage: `Relance ${step}/5`, stageType: "relance", currentStep: step };
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

      const mapped: CampaignProspect[] = (data ?? []).map((row: any) => {
        const p = row.prospect ?? {};
        const cat = mapCategory(p?.category?.name);
        const stageInfo = buildStage(row.status, row.current_step);
        const city = p?.city ?? "";
        const bakeryId = row.campaign?.bakery_id ?? null;
        return {
          id: row.id,
          campaignId: row.campaign_id,
          prospectId: row.prospect_id,
          name: p?.name ?? "Prospect",
          category: cat.id,
          categoryLabel: cat.label,
          categoryId: p?.category_id ?? null,
          bakery: bakeryId ?? "",
          bakeryId,
          stage: stageInfo.stage,
          stageType: stageInfo.stageType,
          currentStep: stageInfo.currentStep,
          campaignCurrentStep: row.current_step ?? 0,
          totalSteps: 5,
          context: city ? `${cat.label} — ${city}` : cat.label,
          offers: p?.offer ? [p.offer] : [],
          offer: p?.offer ?? null,
          lastSentDate: formatFrDate(row.last_sent_at),
          lastSentAt: row.last_sent_at ?? null,
          responseReceivedAt: row.replied_at,
          status: mapStatus(row.status),
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
