import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Check, Loader2, Upload, Image } from "lucide-react";
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
  { credits: 25, label: "Starter" },
  { credits: 50, label: "Pro" },
  { credits: 100, label: "Business" },
];

interface StepPaymentProps {
  bakeries: BakeryEntry[];
  offers: OfferEntry[];
  selectedOfferIds: Set<string>;
  messages: MessageEntry[];
  targetCategoryId: string;
  waveSize: number;
  onSuccess: () => void;
}

const StepPayment: React.FC<StepPaymentProps> = ({
  bakeries, offers, selectedOfferIds, messages, targetCategoryId, waveSize, onSuccess,
}) => {
  const [selectedPack, setSelectedPack] = useState(0);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

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

      // 2. Sign in immediately to get active session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // 3. Upload logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop();
        const path = `${userId}/logo.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("logos").upload(path, logoFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
          logoUrl = urlData.publicUrl;
        }
      }

      // 4. Update profile with logo
      if (logoUrl) {
        await supabase.from("profiles").update({ logo_url: logoUrl }).eq("id", userId);
      }

      // 5. Insert bakeries
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

      // 6. Insert offers
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

      // 7. Insert campaign
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

      // 8. Insert campaign messages
      const msgInserts = messages.map((m, i) => ({
        campaign_id: campaign.id,
        step_number: i + 1,
        subject: m.subject,
        body: m.body,
      }));
      const { error: msgErr } = await supabase.from("campaign_messages").insert(msgInserts);
      if (msgErr) throw msgErr;

      // 9. Insert credit transaction
      const pack = PACKS[selectedPack];
      const { error: creditErr } = await supabase.from("credit_transactions").insert({
        user_id: userId,
        amount: pack.credits,
        type: "purchase",
        description: `Achat pack ${pack.label} — ${pack.credits} crédits`,
      });
      if (creditErr) throw creditErr;

      // 10. Mark onboarding completed
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);

      // 11. Go to success step
      onSuccess();
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
        <p className="text-xs text-muted-foreground mt-1">Les crédits non utilisés sont conservés pour tes prochaines campagnes.</p>
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
              <p className="text-xs text-muted-foreground">{pack.credits} crédits — {pack.credits} prospects contactés, {pack.credits * 5} emails envoyés</p>
            </div>
            {selectedPack === i && <Check className="h-5 w-5 text-primary" />}
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

          {/* Logo upload */}
          <div className="space-y-1">
            <Label>Logo (pour ta signature email)</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => logoRef.current?.click()}
            >
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              {logoPreview ? (
                <div className="flex items-center justify-center gap-3">
                  <img src={logoPreview} alt="Logo" className="h-12 w-12 object-contain rounded" />
                  <p className="text-sm text-muted-foreground">Clique pour changer</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Image className="h-6 w-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Clique pour ajouter ton logo</p>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleSubmit} disabled={isLoading} fullWidth size="lg">
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Création en cours…</>
            ) : (
              <><CreditCard className="h-4 w-4" />Créer mon compte</>
            )}
          </Button>
          
        </div>
      )}
    </div>
  );
};

export default StepPayment;
