import React, { useState } from "react";
import { PartyPopper, Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dashboardPreview1 from "@/assets/dashboard-preview-1.png";
import dashboardPreview2 from "@/assets/dashboard-preview-2.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const StepSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email et mot de passe requis");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError("Email ou mot de passe incorrect");
      return;
    }

    setOpen(false);
    navigate("/prospects");
  };

  return (
    <div className="flex flex-col items-center text-center px-4 py-10 space-y-8">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <PartyPopper className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-3 max-w-sm">
        <h2 className="text-2xl font-bold text-foreground">Félicitations 🎉</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Ta demande est bien enregistrée. On récolte les informations sur les prospects identifiés.
        </p>
        <p className="text-sm font-semibold text-primary">
          On revient vers toi d'ici 48h avec ton dashboard prêt.
        </p>
      </div>

      <Button fullWidth onClick={() => setOpen(true)}>
        Voir votre campagne en cours
      </Button>

      <div className="w-full space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Aperçu de ton futur dashboard
        </p>
        <div className="space-y-3">
          <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            <img
              src={dashboardPreview1}
              alt="Aperçu du tableau de bord"
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            <img
              src={dashboardPreview2}
              alt="Aperçu de la page prospects"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connectez-vous</DialogTitle>
            <DialogDescription>
              Accédez à votre campagne en cours.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="login-popup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-popup-email"
                  type="email"
                  placeholder="votre@email.com"
                  className={cn("pl-10")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="login-popup-password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-popup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StepSuccess;
