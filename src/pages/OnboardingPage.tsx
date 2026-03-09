import { useState } from "react";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import StepWelcome from "@/components/onboarding/StepWelcome";
import StepBakery from "@/components/onboarding/StepBakery";
import StepProspects from "@/components/onboarding/StepProspects";
import StepOffers, { type OfferEntry } from "@/components/onboarding/StepOffers";
import StepMessages, { type MessageEntry, fetchMessages } from "@/components/onboarding/StepMessages";
import StepCampaignRecap from "@/components/onboarding/StepCampaignRecap";
import StepPayment from "@/components/onboarding/StepPayment";
import StepSuccess from "@/components/onboarding/StepSuccess";

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
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [waveSize, setWaveSize] = useState(25);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const goToStep = async (s: number) => {
    // When entering step 5 (messages), fetch messages from webhook
    if (s === 5 && messages.length === 0) {
      setStep(s);
      setMessagesLoading(true);
      try {
        const fetched = await fetchMessages(bakeries, offers, selectedOfferIds);
        setMessages(fetched);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
      setMessagesLoading(false);
      return;
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
          <StepMessages
            onNext={() => goToStep(6)}
            messages={messages}
            onMessagesChange={setMessages}
            bakeries={bakeries}
            offers={offers}
            selectedOfferIds={selectedOfferIds}
          />
        )}
        {step === 6 && (
          <StepCampaignRecap
            onNext={() => goToStep(7)}
            bakeries={bakeries}
            offers={offers}
            selectedOfferIds={selectedOfferIds}
            messages={messages}
            targetCategoryId={targetCategoryId}
            onTargetCategoryChange={setTargetCategoryId}
          />
        )}
        {step === 7 && (
          <StepPayment
            bakeries={bakeries}
            offers={offers}
            selectedOfferIds={selectedOfferIds}
            messages={messages}
            targetCategoryId={targetCategoryId}
            waveSize={waveSize}
            onSuccess={() => goToStep(8)}
          />
        )}
        {step === 8 && <StepSuccess />}
      </div>
    </div>
  );
};

export default OnboardingPage;
