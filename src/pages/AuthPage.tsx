import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AuthTab = "login" | "signup";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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
    // Navigation handled by useEffect above
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};
    if (!signupForm.name) newErrors.name = "Le nom est requis";
    if (!signupForm.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) newErrors.email = "Email invalide";
    if (!signupForm.password) newErrors.password = "Le mot de passe est requis";
    else if (signupForm.password.length < 8) newErrors.password = "Minimum 8 caractères";
    if (signupForm.password !== signupForm.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
      options: {
        data: { full_name: signupForm.name },
        emailRedirectTo: window.location.origin,
      },
    });
    setIsLoading(false);

    if (error) {
      setErrors({ general: error.message });
    } else {
      setSignupSuccess(true);
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

          {/* Tabs */}
          <div className="bg-muted rounded-lg p-1 flex mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setErrors({}); }}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === "login"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("signup"); setErrors({}); }}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === "signup"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Inscription
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center">{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
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
          )}

          {/* Signup Form or Success */}
          {activeTab === "signup" && !signupSuccess && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="signup-name">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="signup-name" type="text" placeholder="Jean Dupont"
                    className={cn("pl-10", errors.name && "border-destructive")}
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="signup-email" type="email" placeholder="votre@email.com"
                    className={cn("pl-10", errors.email && "border-destructive")}
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    className={cn("pl-10 pr-10", errors.password && "border-destructive")}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="signup-confirm" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                    className={cn("pl-10 pr-10", errors.confirmPassword && "border-destructive")}
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" fullWidth disabled={isLoading}>
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Création...</> : "Créer mon compte"}
              </Button>
            </form>
          )}

          {/* Signup Success */}
          {activeTab === "signup" && signupSuccess && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">Vérifiez votre email</h3>
                <p className="text-sm text-muted-foreground">
                  Un lien de confirmation a été envoyé à <strong className="text-foreground">{signupForm.email}</strong>.
                  Cliquez sur le lien pour activer votre compte.
                </p>
              </div>
              <Button variant="outline" onClick={() => { setActiveTab("login"); setSignupSuccess(false); }} fullWidth>
                Retour à la connexion
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2026 Hogust. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
