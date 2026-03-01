import * as React from "react";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Store, LogOut, ChevronRight, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [creditBalance, setCreditBalance] = useState(0);
  const [bakeryCount, setBakeryCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    // Fetch credit balance
    supabase
      .from("credit_transactions")
      .select("amount")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setCreditBalance(data.reduce((s, t) => s + t.amount, 0));
      });
    // Fetch bakery count
    supabase
      .from("bakeries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => {
        if (count !== null) setBakeryCount(count);
      });
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Utilisateur";
  const email = user?.email || "";

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="px-4 py-6 max-w-5xl mx-auto space-y-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground">Boulanger artisan</p>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Solde crédits</p>
            <p className="text-lg font-bold text-foreground">{creditBalance} crédits</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border divide-y divide-border">
          <ProfileRow icon={Mail} label="Email" value={email} />
          <ProfileRow icon={Store} label="Boulangeries" value={`${bakeryCount} établissement${bakeryCount > 1 ? "s" : ""}`} />
        </div>

        {/* Actions */}
        <div className="bg-card rounded-xl shadow-sm border border-border divide-y divide-border">
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors">
            <span className="text-sm text-foreground">Paramètres du compte</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors">
            <span className="text-sm text-foreground">Aide & Support</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Logout */}
        <Button variant="outline" fullWidth="mobile" className="text-destructive border-destructive/30 hover:bg-destructive/5" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </main>
      <BottomNavigation />
    </div>
  );
};

const ProfileRow: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-3.5">
    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground truncate">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
