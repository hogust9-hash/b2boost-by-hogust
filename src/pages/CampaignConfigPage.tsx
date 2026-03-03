import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const addressSuggestions = [
  "123 Rue de la Paix, 75001 Paris",
  "45 Avenue des Champs-Élysées, 75008 Paris",
  "78 Boulevard Saint-Germain, 75006 Paris",
];

const offers = ["Petit-déjeuner", "Goûter", "Traiteur"];

const CampaignConfigPage = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [radius, setRadius] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddressSelect = (suggestion: string) => {
    setAddress(suggestion);
    setShowSuggestions(false);
  };

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
  };

  const handleRadiusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(50, Math.max(5, Number(e.target.value) || 5));
    setRadius(value);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate loading - in real app this would call an API
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to results or next step
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border h-14 z-50">
        <div className="flex items-center h-full px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-foreground hover:text-primary transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground ml-2">
            Configurer ma campagne
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-lg mx-auto pb-28">
        {/* Bakery Reminder */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Ma Boulangerie - Paris 11
          </span>
        </div>

        {/* Address Field */}
        <div className="space-y-4 mb-6">
          <div className="space-y-1">
            <Label htmlFor="address">Adresse de ta boulangerie</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                type="text"
                placeholder="123 rue de la Paix, 75001 Paris"
                className="pl-10"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-md z-10 overflow-hidden">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted transition-colors border-b border-border last:border-b-0"
                      onMouseDown={() => handleAddressSelect(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Radius Slider */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <Label>Périmètre de prospection</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={5}
                max={50}
                value={radius}
                onChange={handleRadiusInputChange}
                className="w-16 h-9 text-center px-2"
              />
              <span className="text-sm text-muted-foreground">km</span>
            </div>
          </div>
          
          <div className="px-1">
            <Slider
              value={[radius]}
              onValueChange={handleRadiusChange}
              min={5}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>5 km</span>
              <span>50 km</span>
            </div>
          </div>
        </div>

        {/* Offers Block (Read-only) */}
        <div className="bg-muted rounded-xl p-4">
          <h3 className="font-medium text-foreground mb-1">Tes offres</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Définies avec ton conseiller Hogust
          </p>
          <div className="space-y-2">
            {offers.map((offer) => (
              <div key={offer} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground">{offer}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button fullWidth size="lg" onClick={handleSubmit}>
            Analyser mon potentiel
          </Button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl p-6 max-w-sm w-full text-center shadow-lg">
            <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Analyse de ta zone en cours...
            </h3>
            <p className="text-sm text-muted-foreground">
              Identification des prospects, génération des emails...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignConfigPage;
