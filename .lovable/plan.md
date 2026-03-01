

# Phase 1 : Auth reelle + Base de donnees + Onboarding Etapes 1-3

## Objectif
Mettre en place l'authentification Supabase, le schema de base de donnees complet, et les 3 premieres etapes du tunnel d'onboarding (creation de compte, ajout boulangeries avec carte Mapbox, apercu des prospects).

---

## 1. Schema de base de donnees (migration SQL)

Tables a creer :

**profiles** -- Infos utilisateur liees a auth.users
- `id` (uuid, PK, FK -> auth.users)
- `full_name` (text)
- `phone` (text, nullable)
- `created_at`, `updated_at`
- `onboarding_completed` (boolean, default false)
- Trigger auto-creation a l'inscription

**bakeries** -- Les boulangeries du client
- `id` (uuid, PK)
- `user_id` (uuid, FK -> auth.users, NOT NULL)
- `name` (text)
- `address` (text)
- `city` (text)
- `latitude` (double precision)
- `longitude` (double precision)
- `radius_km` (integer, default 15)
- `created_at`

**prospect_categories** -- Categories de prospects B2B
- `id` (uuid, PK)
- `name` (text) -- restauration, hebergement, education, entreprises, collectivites
- `icon_name` (text)

**prospects** -- Prospects detectes dans la zone
- `id` (uuid, PK)
- `bakery_id` (uuid, FK -> bakeries)
- `name` (text)
- `category_id` (uuid, FK -> prospect_categories)
- `address`, `city`, `latitude`, `longitude`
- `status` (text : pending, contacted, responded, handled)
- `created_at`

**offers** -- Paniers / offres importees
- `id` (uuid, PK)
- `bakery_id` (uuid, FK -> bakeries)
- `name` (text)
- `category` (text) -- snacking, viennoiserie, patisserie, traiteur...
- `description` (text)
- `price` (numeric, nullable)
- `is_active` (boolean, default true)
- `created_at`

**campaigns** -- Campagnes de prospection
- `id` (uuid, PK)
- `bakery_id` (uuid, FK -> bakeries)
- `target_category_id` (uuid, FK -> prospect_categories)
- `wave_size` (integer)
- `status` (text : draft, active, paused, completed)
- `created_at`, `started_at`

**campaign_messages** -- Sequence de 3 messages
- `id` (uuid, PK)
- `campaign_id` (uuid, FK -> campaigns)
- `step_number` (integer, 1-3)
- `subject` (text)
- `body` (text)

**credit_transactions** -- Achats et consommation de credits
- `id` (uuid, PK)
- `user_id` (uuid, FK -> auth.users)
- `amount` (integer) -- positif = achat, negatif = consommation
- `type` (text : purchase, consumption)
- `description` (text)
- `created_at`

RLS sur toutes les tables : chaque utilisateur ne voit que ses propres donnees (via `user_id` ou jointure bakery -> user_id).

---

## 2. Authentification Supabase

- Brancher `AuthPage` sur `supabase.auth.signUp()` / `signInWithPassword()`
- Creer un `AuthProvider` (contexte React) avec `onAuthStateChange` + `getSession`
- Proteger les routes : si non connecte -> redirect `/auth`
- Apres inscription -> redirect vers `/onboarding`
- Apres login : si `onboarding_completed = false` -> `/onboarding`, sinon -> `/`

---

## 3. Cle API Mapbox

Le token Mapbox (cle publique `pk.*`) sera stocke directement dans le code car c'est une cle publique. On te demandera de la fournir avant d'implementer l'etape 2.

---

## 4. Page Onboarding (`/onboarding`)

Un wizard multi-etapes avec barre de progression (8 etapes au total, on construit les 3 premieres).

### Etape 1 -- Compte cree (confirmation)
- Ecran de bienvenue post-inscription
- Affiche le nom de l'utilisateur
- CTA "Commencer" pour passer a l'etape 2

### Etape 2 -- Ajouter une boulangerie
- Champ adresse avec autocompletion Mapbox Geocoding API
- Carte Mapbox GL JS v3 avec marqueur (Layer Symbol) positionne aux coordonnees lon/lat
- Slider rayon de couverture (5-50 km) avec cercle affiche sur la carte
- Affichage en temps-reel du nombre estime de cibles B2B (mock calcule en fonction du rayon)
- Bouton "Ajouter une autre boulangerie" pour repeter
- Sauvegarde dans la table `bakeries`

### Etape 3 -- Apercu des prospects
- Compteur total de prospects detectes
- Repartition par categorie (restaurants, hotels, ecoles, entreprises, collectivites) avec barres de progression
- Lecture seule, donnees mock basees sur le rayon choisi
- CTA "Continuer"

---

## 5. Fichiers crees / modifies

| Fichier | Action |
|---|---|
| Migration SQL | Toutes les tables + RLS + trigger profiles |
| `src/contexts/AuthContext.tsx` | Nouveau -- Provider auth Supabase |
| `src/components/ProtectedRoute.tsx` | Nouveau -- Redirect si non auth |
| `src/pages/AuthPage.tsx` | Modifie -- Branche sur Supabase auth reel |
| `src/pages/OnboardingPage.tsx` | Nouveau -- Wizard container |
| `src/components/onboarding/StepWelcome.tsx` | Nouveau -- Etape 1 |
| `src/components/onboarding/StepBakery.tsx` | Nouveau -- Etape 2 (carte + adresse) |
| `src/components/onboarding/StepProspects.tsx` | Nouveau -- Etape 3 (apercu) |
| `src/components/onboarding/OnboardingProgress.tsx` | Nouveau -- Barre de progression |
| `src/App.tsx` | Modifie -- AuthProvider + routes protegees + route /onboarding |
| `src/pages/ProfilePage.tsx` | Modifie -- Solde credits + deconnexion reelle |

---

## 6. Dependances a installer

- `mapbox-gl` (v3) + `@types/mapbox-gl` pour la carte et le geocoding

---

## Hors perimetre de cette phase
- Etapes 4-8 (import offres, messages, recap, paiement)
- Edge function d'extraction IA des documents
- Envoi reel d'emails
- Stripe / paiement

