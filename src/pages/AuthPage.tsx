import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (profile && !profile.onboarding_completed) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};
    if (!loginForm.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) newErrors.email = "Email invalide";
    if (!loginForm.password) newErrors.password = "Le mot de passe est requis";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setIsLoading(false);

    if (error) {
      setErrors({ general: "Email ou mot de passe incorrect" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 pt-10 sm:pt-20">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">B2Boost</h1>
            <p className="text-sm text-muted-foreground mt-1">by Hogust</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="login-email" type="email" placeholder="votre@email.com"
                  className={cn("pl-10", errors.email && "border-destructive")}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="login-password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Connexion...</> : "Se connecter"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2026 Hogust. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
