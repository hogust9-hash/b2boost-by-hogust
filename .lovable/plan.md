

# Plan : Etapes 4-8 de l'onboarding + Page Profil enrichie

## Contexte

L'onboarding fonctionne actuellement sans authentification (etapes 1-3). Les donnees sont gardees en state local. La creation de compte se fera a l'etape 8 (paiement). Les tables Supabase (offers, campaigns, campaign_messages, credit_transactions) existent deja.

---

## Architecture des donnees dans le wizard

Toutes les etapes 4-7 travaillent sur du **state local** (pas de persistance DB). Ce n'est qu'a l'etape 8, apres creation de compte + paiement, que tout sera sauvegarde en base.

State partage dans `OnboardingPage.tsx` :
- `bakeries` (deja existant)
- `offers` : liste des offres extraites/editees
- `selectedOfferIds` : IDs des offres actives pour la campagne
- `messages` : tableau de 3 messages (subject + body)
- `targetCategoryId` : categorie cible
- `waveSize` : taille de vague

---

## 1. Etape 4 -- Import des offres (StepOffers.tsx)

**Zone d'upload** : input file acceptant `.pdf`, `.docx`, `.txt`
- Le fichier est lu cote client (FileReader)
- Pour les fichiers texte : extraction directe du contenu
- Pour PDF/Word : appel a une **edge function `extract-offers`** qui parse le document et retourne les offres structurees

**Edge function `extract-offers`** :
- Recoit le fichier en base64
- Pour le MVP : extraction basique par regex/heuristiques (nom, prix, categorie)
- Retourne un tableau d'offres : `{ name, category, description, price }`
- Pas besoin d'API key externe pour le MVP (parsing simple)

**UI apres extraction** :
- Offres groupees par gamme (snacking, viennoiserie, patisserie, traiteur, autre)
- Chaque offre : nom, description, prix editables inline
- Checkbox pour selectionner/deselectionner chaque offre
- Bouton "Ajouter une offre manuellement"
- CTA "Continuer"

---

## 2. Etape 5 -- Validation du contenu (StepValidateOffers.tsx)

**Carte recapitulative** des offres selectionnees :
- Groupees par categorie
- Champs editables inline (nom, description, prix)
- Compteur total d'offres actives
- CTA "Valider et continuer"

---

## 3. Etape 6 -- Constructeur de sequence (StepMessages.tsx)

**3 messages auto-generes** a partir de templates :
- Message 1 : Decouverte -- presentation de la boulangerie + offre phare
- Message 2 : Relance -- angle proximite locale + avantage concret
- Message 3 : Derniere chance -- urgence douce + fierte artisan

**Ton** : leger, percutant, jeux de mots, fierte locale

**Generation** : templates pre-ecrits avec variables dynamiques (nom boulangerie, ville, offres selectionnees). Pas d'IA generative pour le MVP.

**UI** :
- 3 cartes empilees verticalement (Message 1, 2, 3)
- Sujet + corps editables inline (textarea)
- Badge "auto-genere" sur chaque message
- CTA "Continuer"

---

## 4. Etape 7 -- Recap campagne (StepCampaignRecap.tsx)

**Panneau recapitulatif** :
- Boulangerie(s) selectionnee(s)
- Categorie cible : selecteur parmi les 6 categories existantes (prospect_categories)
- Volume : slider pour definir la taille de vague (5-100, defaut 25)
- Offres actives : liste resumee
- Sequence de messages : apercu des 3 sujets
- CTA "Lancer la campagne"

---

## 5. Etape 8 -- Paiement / Credits (StepPayment.tsx)

**Selecteur de pack** :
- 25 credits -- 75 EUR
- 50 credits -- 130 EUR
- 100 credits -- 220 EUR

**Flow** :
1. L'utilisateur choisit un pack
2. CTA "Creer mon compte et payer"
3. Formulaire de creation de compte (email + mot de passe + nom) inline
4. Appel `supabase.auth.signUp()`
5. Sauvegarde de toutes les donnees en base (bakeries, offers, campaign, campaign_messages, credit_transactions)
6. Redirect vers `/dashboard`

**Note** : Le paiement Stripe est un placeholder pour le moment (on simule l'achat en inserant directement les credits).

---

## 6. Page Profil enrichie

**Ajouts** :
- Section "Historique des credits" sous le solde : liste des transactions (date, description, montant avec couleur verte/rouge)
- Le bouton "Parametres du compte" ouvre une section inline avec les champs editables (nom, telephone)
- Bouton de sauvegarde des parametres

---

## 7. Fichiers a creer / modifier

| Fichier | Action |
|---|---|
| `supabase/functions/extract-offers/index.ts` | Nouveau -- edge function extraction d'offres |
| `supabase/config.toml` | Modifie -- config pour la nouvelle edge function |
| `src/components/onboarding/StepOffers.tsx` | Nouveau -- Etape 4 |
| `src/components/onboarding/StepValidateOffers.tsx` | Nouveau -- Etape 5 |
| `src/components/onboarding/StepMessages.tsx` | Nouveau -- Etape 6 |
| `src/components/onboarding/StepCampaignRecap.tsx` | Nouveau -- Etape 7 |
| `src/components/onboarding/StepPayment.tsx` | Nouveau -- Etape 8 |
| `src/pages/OnboardingPage.tsx` | Modifie -- ajout des etapes 4-8 + state partage |
| `src/pages/ProfilePage.tsx` | Modifie -- historique credits + parametres editables |

---

## 8. Storage Supabase

Creer un bucket `offer-documents` (public: false) pour stocker les fichiers uploades a l'etape 4. Migration SQL pour creer le bucket + politique RLS.

---

## Details techniques

### State dans OnboardingPage

```text
bakeries: BakeryEntry[]           -- etape 2
offers: OfferEntry[]              -- etapes 4-5
selectedOfferIds: Set<string>     -- etape 4
messages: MessageEntry[3]         -- etape 6
targetCategoryId: string          -- etape 7
waveSize: number                  -- etape 7
```

### Edge function extract-offers

- Endpoint POST, recoit `{ content: string, filename: string }`
- Parse le texte pour detecter des lignes type "Nom - Prix" ou des structures tabulaires
- Retourne `{ offers: { name, category, description, price }[] }`
- verify_jwt = false (pas d'auth requise a ce stade)

### Templates de messages (etape 6)

Variables disponibles : `{bakery_name}`, `{city}`, `{offer_name}`, `{category_name}`

- Sujet 1 : "Decouvrez les creations artisanales de {bakery_name}"
- Sujet 2 : "Un partenariat local qui a du gout !"
- Sujet 3 : "Derniere occasion de gouter a nos offres"

### Etape 8 -- Sequence de sauvegarde

1. `signUp()` avec email/password/full_name
2. Insert bakeries avec le nouveau `user_id`
3. Insert offers liees aux bakeries
4. Insert campaign + campaign_messages
5. Insert credit_transaction (achat)
6. Update profile `onboarding_completed = true`
7. Navigate vers `/dashboard`

