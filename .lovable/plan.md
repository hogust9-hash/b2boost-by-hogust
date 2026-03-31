

## Plan — 3 modifications onboarding

### 1. Ajouter la catégorie "Gâteaux de voyage" (StepOffers.tsx)

Ajouter `"gâteaux de voyage"` dans le tableau `CATEGORY_OPTIONS` (ligne 82-89), entre "pâtisserie" et "traiteur". Aussi mettre à jour `guessCategory` dans `extract-offers/index.ts` pour détecter cette catégorie (mots-clés : cake, marbré, financier, quatre-quarts, etc.).

### 2. Offres sélectionnées scrollables (StepCampaignRecap.tsx)

Le `ScrollArea` avec `max-h-48` (ligne 208) tronque le contenu sans indication visuelle claire. Remplacer par une `ScrollArea` avec une hauteur fixe (`h-48`) et ajouter un indicateur de dégradé en bas pour signaler qu'il y a plus de contenu. Forcer l'affichage de la scrollbar.

### 3. Nouvelle timeline de prospection (StepCampaignRecap.tsx)

Remplacer la constante `SEQUENCE_STEPS` (lignes 31-41) et le texte descriptif (ligne 242) :

- Texte : "Un cycle sur **30 jours**" au lieu de "3 semaines"
- Nouvelle séquence :
  - Jour 0 — Premier contact
  - Jour 3 — Relance 1
  - Jour 8 — Relance 2
  - Jour 17 — Relance 3
  - Jour 30 — Clôture

La structure de données sera simplifiée : chaque étape aura un `day` et un `label`, ce qui supprime la séparation label/delay actuelle. La timeline affichera le numéro du jour dans le cercle et le label à côté, avec les intervalles entre chaque étape affichés en badges entre les lignes.

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/components/onboarding/StepOffers.tsx` | Ajout "gâteaux de voyage" dans `CATEGORY_OPTIONS` |
| `supabase/functions/extract-offers/index.ts` | Ajout pattern "gâteaux de voyage" dans `guessCategory` |
| `src/components/onboarding/StepCampaignRecap.tsx` | ScrollArea offres améliorée + nouvelle timeline 30 jours |

