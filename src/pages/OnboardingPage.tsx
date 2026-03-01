import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import StepWelcome from "@/components/onboarding/StepWelcome";
import StepBakery from "@/components/onboarding/StepBakery";
import StepProspects from "@/components/onboarding/StepProspects";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [bakeries, setBakeries] = useState<BakeryEntry[]>([]);

  const handleStep3Next = async () => {
    // For now, mark onboarding as completed (steps 4-8 not yet built)
    if (user) {
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
      await refreshProfile();
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="pt-6 pb-2 px-4">
          <h1 className="text-lg font-bold text-primary text-center">B2Boost</h1>
        </div>

        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

        {step === 1 && <StepWelcome onNext={() => setStep(2)} />}
        {step === 2 && (
          <StepBakery
            onNext={() => setStep(3)}
            onBakeriesChange={setBakeries}
          />
        )}
        {step === 3 && (
          <StepProspects
            bakeries={bakeries}
            onNext={handleStep3Next}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
