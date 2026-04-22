import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/components/ui/custom-toast";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { showToast } = useCustomToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery token from URL hash and creates a session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setValidSession(true);
      } else {
        setError("Lien invalide ou expiré. Demande un nouveau lien de réinitialisation.");
      }
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setValidSession(true);
        setError(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    showToast("success", "Mot de passe mis à jour !");
    setTimeout(() => navigate("/prospects"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Nouveau mot de passe</h1>
          <p className="text-sm text-muted-foreground">
            Choisis un nouveau mot de passe pour ton compte.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="text-sm text-success font-medium">Mot de passe mis à jour</p>
            <p className="text-xs text-muted-foreground">Redirection en cours...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 text-left">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!validSession}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!validSession}
                />
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading || !validSession}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
