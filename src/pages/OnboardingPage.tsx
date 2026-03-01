import { useState } from "react";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import StepWelcome from "@/components/onboarding/StepWelcome";
import StepBakery from "@/components/onboarding/StepBakery";
import StepProspects from "@/components/onboarding/StepProspects";
import StepOffers, { type OfferEntry } from "@/components/onboarding/StepOffers";
import StepValidateOffers from "@/components/onboarding/StepValidateOffers";
import StepMessages, { type MessageEntry, generateMessages } from "@/components/onboarding/StepMessages";
import StepCampaignRecap from "@/components/onboarding/StepCampaignRecap";
import StepPayment from "@/components/onboarding/StepPayment";

const TOTAL_STEPS = 8;

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
  const [bakeries, setBakeries] = useState<BakeryEntry[]>([]);
  const [offers, setOffers] = useState<OfferEntry[]>([]);
  const [selectedOfferIds, setSelectedOfferIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<MessageEntry[]>([
    { subject: "", body: "" },
    { subject: "", body: "" },
    { subject: "", body: "" },
  ]);
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [waveSize, setWaveSize] = useState(25);

  // Generate messages when entering step 6
  const goToStep = (s: number) => {
    if (s === 6 && messages[0].subject === "") {
      setMessages(generateMessages(bakeries, offers, selectedOfferIds));
    }
    setStep(s);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto">
        <div className="pt-6 pb-2 px-4">
          <h1 className="text-lg font-bold text-primary text-center">B2Boost</h1>
        </div>

        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

        {step === 1 && <StepWelcome onNext={() => goToStep(2)} />}
        {step === 2 && (
          <StepBakery onNext={() => goToStep(3)} onBakeriesChange={setBakeries} />
        )}
        {step === 3 && (
          <StepProspects bakeries={bakeries} onNext={() => goToStep(4)} />
        )}
        {step === 4 && (
          <StepOffers
            onNext={() => goToStep(5)}
            offers={offers}
            onOffersChange={setOffers}
            selectedOfferIds={selectedOfferIds}
            onSelectedChange={setSelectedOfferIds}
          />
        )}
        {step === 5 && (
          <StepValidateOffers
            onNext={() => goToStep(6)}
            offers={offers}
            selectedOfferIds={selectedOfferIds}
            onOffersChange={setOffers}
          />
        )}
        {step === 6 && (
          <StepMessages
            onNext={() => goToStep(7)}
            messages={messages}
            onMessagesChange={setMessages}
            bakeries={bakeries}
            offers={offers}
            selectedOfferIds={selectedOfferIds}
          />
        )}
        {step === 7 && (
          <StepCampaignRecap
            onNext={() => goToStep(8)}
            bakeries={bakeries}
            offers={offers}
            selectedOfferIds={selectedOfferIds}
            messages={messages}
            targetCategoryId={targetCategoryId}
            onTargetCategoryChange={setTargetCategoryId}
            waveSize={waveSize}
            onWaveSizeChange={setWaveSize}
          />
        )}
        {step === 8 && (
          <StepPayment
            bakeries={bakeries}
            offers={offers}
            selectedOfferIds={selectedOfferIds}
            messages={messages}
            targetCategoryId={targetCategoryId}
            waveSize={waveSize}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
