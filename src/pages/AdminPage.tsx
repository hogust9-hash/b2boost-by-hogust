import * as React from "react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Loader2, Lock, Users, MailCheck, Send, Clock, LogIn, Activity, RefreshCw, EyeOff, Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientOverview {
  bakery_id: string;
  bakery_name: string;
  bakery_city: string | null;
  owner_name: string | null;
  owner_email: string | null;
  last_sign_in_at: string | null;
  signed_up_at: string | null;
  total_prospects: number;
  contacted: number;
  replied: number;
  in_progress: number;
  finished: number;
  not_started: number;
  step1: number;
  step2: number;
  step3: number;
  step4: number;
  step5: number;
  last_activity: string | null;
}

const STEP_FIELDS: { key: keyof ClientOverview; label: string; color: string }[] = [
  { key: "not_started", label: "Non démarré", color: "bg-muted text-muted-foreground" },
  { key: "step1", label: "Premier contact", color: "bg-primary/10 text-primary" },
  { key: "step2", label: "Relance 1", color: "bg-primary/15 text-primary" },
  { key: "step3", label: "Relance 2", color: "bg-primary/20 text-primary" },
  { key: "step4", label: "Relance 3", color: "bg-primary/25 text-primary" },
  { key: "step5", label: "Dernier message", color: "bg-primary/30 text-primary" },
];

const relative = (iso: string | null): string =>
  iso ? formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr }) : "—";

const fullDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const AdminPage = () => {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ClientOverview[]>([]);
  const [hideEmpty, setHideEmpty] = useState(true);

  const fetchOverview = async (pinValue: string) => {
    setLoading(true);
    setError(null);
    const { data: res, error: err } = await (supabase.rpc as any)("admin_overview", { pin: pinValue });
    setLoading(false);
    if (err) {
      setError("Erreur de connexion à la base.");
      return false;
    }
    if (!res || (res as any).error) {
      setError("Code PIN incorrect.");
      return false;
    }
    setData(res as ClientOverview[]);
    setAuthed(true);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOverview(pin);
  };

  // ---- PIN gate ----
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center gap-5"
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Espace Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Entrez le code PIN pour accéder à la vue cumulée.</p>
          </div>
          <Input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(null); }}
            placeholder="• • • •"
            className="text-center text-2xl tracking-[0.5em] h-14"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || pin.length === 0}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accéder"}
          </Button>
        </form>
      </div>
    );
  }

  // ---- Dashboard ----
  const rows = [...data]
    .sort((a, b) => b.total_prospects - a.total_prospects)
    .filter((r) => !hideEmpty || r.total_prospects > 0);

  const totals = data.reduce(
    (acc, r) => ({
      clients: acc.clients + (r.total_prospects > 0 ? 1 : 0),
      prospects: acc.prospects + r.total_prospects,
      replied: acc.replied + r.replied,
      inProgress: acc.inProgress + r.in_progress,
    }),
    { clients: 0, prospects: 0, replied: 0, inProgress: 0 }
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-5 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-primary">Dashboard Admin</h1>
            <p className="text-sm text-muted-foreground">Vue cumulée de tous les clients</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideEmpty((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              {hideEmpty ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {hideEmpty ? "Afficher comptes vides" : "Masquer comptes vides"}
            </button>
            <button
              onClick={() => fetchOverview(pin)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Global summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard icon={<Users className="h-5 w-5" />} label="Clients actifs" value={totals.clients} />
          <SummaryCard icon={<Send className="h-5 w-5" />} label="Prospects totaux" value={totals.prospects} />
          <SummaryCard icon={<MailCheck className="h-5 w-5" />} label="Réponses" value={totals.replied} accent="success" />
          <SummaryCard icon={<Clock className="h-5 w-5" />} label="En cours" value={totals.inProgress} />
        </div>

        {/* Client cards */}
        <div className="space-y-4">
          {rows.map((c) => {
            const responseRate = c.contacted > 0 ? Math.round((c.replied / c.contacted) * 100) : 0;
            return (
              <div key={c.bakery_id} className="bg-card border border-border rounded-xl p-5">
                {/* Top row: identity + last connection */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{c.bakery_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {c.owner_name || "—"}
                      {c.bakery_city ? ` · ${c.bakery_city}` : ""}
                      {c.owner_email ? ` · ${c.owner_email}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground space-y-0.5">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <LogIn className="h-3.5 w-3.5" />
                      Dernière connexion : <span className="font-medium text-foreground">{relative(c.last_sign_in_at)}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 justify-end">
                      <Activity className="h-3.5 w-3.5" />
                      Dernier envoi : <span className="font-medium text-foreground">{fullDate(c.last_activity)}</span>
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <MiniStat label="Prospects" value={c.total_prospects} />
                  <MiniStat label="Contactés" value={c.contacted} />
                  <MiniStat label="Réponses" value={`${c.replied} (${responseRate}%)`} accent="success" />
                  <MiniStat label="En cours" value={c.in_progress} />
                </div>

                {/* Step breakdown */}
                <div className="mt-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Répartition par étape
                  </p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {STEP_FIELDS.map((s) => (
                      <div key={s.key} className={cn("rounded-lg px-2 py-2 text-center", s.color)}>
                        <div className="text-lg font-bold leading-none">{c[s.key] as number}</div>
                        <div className="text-[10px] mt-1 leading-tight">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">Aucun client à afficher.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: number; accent?: "success" }> = ({
  icon, label, value, accent,
}) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className={cn("flex items-center gap-1.5 text-xs font-medium", accent === "success" ? "text-success" : "text-muted-foreground")}>
      {icon}
      {label}
    </div>
    <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
  </div>
);

const MiniStat: React.FC<{ label: string; value: React.ReactNode; accent?: "success" }> = ({ label, value, accent }) => (
  <div className="rounded-lg bg-muted/50 px-3 py-2">
    <div className="text-[11px] text-muted-foreground">{label}</div>
    <div className={cn("text-base font-bold", accent === "success" ? "text-success" : "text-foreground")}>{value}</div>
  </div>
);

export default AdminPage;
