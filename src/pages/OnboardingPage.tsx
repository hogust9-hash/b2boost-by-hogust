import { useState, useEffect } from "react";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import StepWelcome from "@/components/onboarding/StepWelcome";
import StepBakery from "@/components/onboarding/StepBakery";
import StepOffers, { type OfferEntry } from "@/components/onboarding/StepOffers";
import StepCampaignRecap from "@/components/onboarding/StepCampaignRecap";
import StepPayment from "@/components/onboarding/StepPayment";
import StepSuccess from "@/components/onboarding/StepSuccess";
import { supabase } from "@/integrations/supabase/client";

const TOTAL_STEPS = 7;

interface BakeryEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bakeries, setBakeries] = useState<BakeryEntry[]>([]);
  const [offers, setOffers] = useState<OfferEntry[]>([]);
  const [selectedOfferIds, setSelectedOfferIds] = useState<Set<string>>(new Set());
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [waveSize, setWaveSize] = useState(25);

  useEffect(() => {
    const createSession = async () => {
      const { data, error } = await supabase
        .from("onboarding_sessions")
        .insert({ status: "started" })
        .select("id")
        .single();
      if (data && !error) {
        setSessionId(data.id);
      } else {
        console.error("Failed to create onboarding session:", error);
      }
    };
    createSession();
  }, []);

  const goToStep = async (s: number) => {
    setStep(s);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto">
        <div className="pt-6 pb-2 px-4">
          <h1 className="text-lg font-bold text-primary text-center">B2Boost</h1>
        </div>

        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} onBack={goBack} />

        {step === 1 && <StepWelcome onNext={() => goToStep(2)} />}
        {step === 2 && (
          <StepBakery onNext={() => goToStep(3)} onBakeriesChange={setBakeries} sessionId={sessionId} />
        )}
        {step === 3 && (
          <StepOffers
            onNext={() => goToStep(4)}
            offers={offers}
            onOffersChange={setOffers}
            selectedOfferIds={selectedOfferIds}
            onSelectedChange={setSelectedOfferIds}
            sessionId={sessionId}
            bakeries={bakeries}
          />
        )}
        {step === 4 && (
          <StepCampaignRecap
            onNext={() => goToStep(5)}
            bakeries={bakeries}
            offers={offers}
            selectedOfferIds={selectedOfferIds}
            targetCategoryId={targetCategoryId}
            onTargetCategoryChange={setTargetCategoryId}
            sessionId={sessionId}
          />
        )}
        {step === 5 && (
          <StepPayment
            bakeries={bakeries}
            offers={offers}
            selectedOfferIds={selectedOfferIds}
            messages={[]}
            targetCategoryId={targetCategoryId}
            waveSize={waveSize}
            onSuccess={() => goToStep(6)}
          />
        )}
        {step === 6 && <StepSuccess />}
      </div>
    </div>
  );
};

export default OnboardingPage;
