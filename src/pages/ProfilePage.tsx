import * as React from "react";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Store, LogOut, ChevronRight, ChevronDown, CreditCard, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

const ProfilePage = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [creditBalance, setCreditBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [bakeryCount, setBakeryCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setTransactions(data);
          setCreditBalance(data.reduce((s, t) => s + t.amount, 0));
        }
      });
    supabase
      .from("bakeries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => {
        if (count !== null) setBakeryCount(count);
      });
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditPhone(profile.phone || "");
    }
  }, [profile]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    await supabase.from("profiles").update({
      full_name: editName,
      phone: editPhone,
    }).eq("id", user.id);
    setIsSaving(false);
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

        {/* Credit History */}
        {transactions.length > 0 && (
          <div className="bg-card rounded-xl shadow-sm border border-border divide-y divide-border">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-foreground">Historique des crédits</p>
            </div>
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">{tx.description || tx.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(tx.created_at), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border divide-y divide-border">
          <ProfileRow icon={Mail} label="Email" value={email} />
          <ProfileRow icon={Store} label="Boulangeries" value={`${bakeryCount} établissement${bakeryCount > 1 ? "s" : ""}`} />
        </div>

        {/* Actions */}
        <div className="bg-card rounded-xl shadow-sm border border-border divide-y divide-border">
          <button
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            onClick={() => setShowSettings(!showSettings)}
          >
            <span className="text-sm text-foreground">Paramètres du compte</span>
            {showSettings ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showSettings && (
            <div className="px-4 py-4 space-y-4">
              <div className="space-y-1">
                <Label>Nom complet</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Téléphone</Label>
                <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="06 12 34 56 78" />
              </div>
              <Button onClick={handleSaveSettings} disabled={isSaving} size="sm">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </Button>
            </div>
          )}
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
