import * as React from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Store, LogOut, ChevronRight } from "lucide-react";

const ProfilePage = () => {
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
            <h1 className="text-lg font-semibold text-foreground">Jean Dupont</h1>
            <p className="text-sm text-muted-foreground">Boulanger artisan</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border divide-y divide-border">
          <ProfileRow icon={Mail} label="Email" value="jean.dupont@gmail.com" />
          <ProfileRow icon={Phone} label="Téléphone" value="06 12 34 56 78" />
          <ProfileRow icon={MapPin} label="Ville" value="Orléans" />
          <ProfileRow icon={Store} label="Boulangeries" value="3 établissements" />
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
        <Button variant="outline" fullWidth="mobile" className="text-destructive border-destructive/30 hover:bg-destructive/5">
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
