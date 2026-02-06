import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomToastProvider } from "@/components/ui/custom-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ProspectsPage from "./pages/ProspectsPage";
import AuthPage from "./pages/AuthPage";
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
            <Route path="/" element={<DashboardPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/prospects" element={<ProspectsPage />} />
            <Route path="/profil" element={<DashboardPage />} />
            <Route path="/campaign/config" element={<CampaignConfigPage />} />
            <Route path="/campaign/strategy" element={<StrategyPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CustomToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
