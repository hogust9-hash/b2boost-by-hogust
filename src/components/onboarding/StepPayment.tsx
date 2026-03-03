import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { OfferEntry } from "./StepOffers";
import type { MessageEntry } from "./StepMessages";

interface BakeryEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

const PACKS = [
  { credits: 25, price: 75, label: "Starter" },
  { credits: 50, price: 130, label: "Pro" },
  { credits: 100, price: 220, label: "Business" },
];

interface StepPaymentProps {
  bakeries: BakeryEntry[];
  offers: OfferEntry[];
  selectedOfferIds: Set<string>;
  messages: MessageEntry[];
  targetCategoryId: string;
  waveSize: number;
}

const StepPayment: React.FC<StepPaymentProps> = ({
  bakeries, offers, selectedOfferIds, messages, targetCategoryId, waveSize,
}) => {
  const [selectedPack, setSelectedPack] = useState(0);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password || !fullName) {
      setError("Remplis tous les champs.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // 1. Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Impossible de créer le compte.");

      // 2. Insert bakeries
      const bakeryInserts = bakeries.map(b => ({
        user_id: userId,
        name: b.name,
        address: b.address,
        city: b.city,
        latitude: b.latitude,
        longitude: b.longitude,
        radius_km: b.radiusKm,
      }));
      const { data: insertedBakeries, error: bakeryErr } = await supabase
        .from("bakeries")
        .insert(bakeryInserts)
        .select("id");
      if (bakeryErr) throw bakeryErr;

      const bakeryId = insertedBakeries?.[0]?.id;
      if (!bakeryId) throw new Error("Erreur lors de la sauvegarde.");

      // 3. Insert offers
      const activeOffers = offers.filter(o => selectedOfferIds.has(o.id));
      if (activeOffers.length > 0) {
        const offerInserts = activeOffers.map(o => ({
          bakery_id: bakeryId,
          name: o.name,
          category: o.category,
          description: o.description,
          price: o.price,
          is_active: true,
        }));
        const { error: offerErr } = await supabase.from("offers").insert(offerInserts);
        if (offerErr) throw offerErr;
      }

      // 4. Insert campaign
      const { data: campaign, error: campErr } = await supabase
        .from("campaigns")
        .insert({
          bakery_id: bakeryId,
          target_category_id: targetCategoryId || null,
          wave_size: waveSize,
          status: "draft",
        })
        .select("id")
        .single();
      if (campErr) throw campErr;

      // 5. Insert campaign messages
      const msgInserts = messages.map((m, i) => ({
        campaign_id: campaign.id,
        step_number: i + 1,
        subject: m.subject,
        body: m.body,
      }));
      const { error: msgErr } = await supabase.from("campaign_messages").insert(msgInserts);
      if (msgErr) throw msgErr;

      // 6. Insert credit transaction (simulate purchase)
      const pack = PACKS[selectedPack];
      const { error: creditErr } = await supabase.from("credit_transactions").insert({
        user_id: userId,
        amount: pack.credits,
        type: "purchase",
        description: `Achat pack ${pack.label} — ${pack.credits} crédits`,
      });
      if (creditErr) throw creditErr;

      // 7. Mark onboarding completed
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);

      // 8. Redirect
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Choisis ton pack</h2>
        <p className="text-sm text-muted-foreground mt-1">Les crédits non utilisés sont conservés pour tes prochaines campagnes.</p>
      </div>

      {/* Pack selection */}
      <div className="space-y-3">
        {PACKS.map((pack, i) => (
          <button
            key={i}
            onClick={() => { setSelectedPack(i); setShowSignup(true); }}
            className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
              selectedPack === i
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">{pack.label}</p>
              <p className="text-xs text-muted-foreground">{pack.credits} crédits</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-foreground">{pack.price} €</p>
              {selectedPack === i && <Check className="h-5 w-5 text-primary" />}
            </div>
          </button>
        ))}
      </div>

      {/* Signup form */}
      {showSignup && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Crée ton compte</h3>
          <div className="space-y-1">
            <Label>Nom complet</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jean Dupont" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean@boulangerie.fr" />
          </div>
          <div className="space-y-1">
            <Label>Mot de passe</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 caractères" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleSubmit} disabled={isLoading} fullWidth size="lg">
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Création en cours…</>
            ) : (
              <><CreditCard className="h-4 w-4" />Créer mon compte et payer {PACKS[selectedPack].price} €</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Paiement simulé — aucun prélèvement réel</p>
        </div>
      )}
    </div>
  );
};

export default StepPayment;
