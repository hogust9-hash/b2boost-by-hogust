import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomToastProvider } from "@/components/ui/custom-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ProspectsPage from "./pages/ProspectsPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import CampaignConfigPage from "./pages/CampaignConfigPage";
import StrategyPage from "./pages/StrategyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CustomToastProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/prospects" element={<ProspectsPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/campaign/config" element={<CampaignConfigPage />} />
            <Route path="/campaign/strategy" element={<StrategyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CustomToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
