

## Plan: Modifications de l'onboarding

### 1. StepBakery — Rayon minimum à 1 km + webhook au bon moment
- Changer le `min` du Slider de `5` à `1`
- Le webhook `adresse-poi` est déjà appelé au clic "Valider ma boulangerie" — c'est correct, rien à changer ici

### 2. StepOffers — Checkbox par produit individuel + ajout manuel d'offres
- Actuellement, le toggle s'applique à l'`offerId` entier (une catégorie contenant plusieurs produits). Il faut individualiser : chaque produit (fragment de description) doit avoir sa propre checkbox indépendante
- Approche : maintenir un `Set<string>` de clés `offerId-idx` au lieu de `offerId` seul, pour que chaque produit soit cochable/décochable individuellement
- Ajouter un bouton "Ajouter une offre" en bas de la liste, avec un petit formulaire inline (nom du produit, catégorie via select)
- Quand l'utilisateur clique "Continuer", appeler le webhook `POST https://n8n.beautifulflow.ai/webhook/redaction-messages` avec : session_id, offres validées + produits sélectionnés, nom et adresse de la boulangerie

### 3. StepMessages — 5 messages + délais + bulle d'info
- Passer `MESSAGE_LABELS` à 5 entrées (Message 1 — Découverte, Message 2 — Relance 1, Message 3 — Relance 2, Message 4 — Relance 3, Message 5 — Dernière chance)
- Changer la condition de polling de `data.length >= 3` à `data.length >= 5`
- Ajouter entre chaque message un séparateur affichant le délai : "J+3", "J+3", "J+4", "J+6"
- Ajouter une bulle d'info (icône `Info`) cliquable à côté des délais, avec un tooltip/popover expliquant la préconisation d'un cycle de 3 semaines

### 4. Webhook redaction-messages au clic "Continuer" des offres
- Dans `OnboardingPage`, quand on passe de l'étape 3 (offres) à l'étape 4 (messages) : envoyer un POST au webhook avec les données nécessaires
- Le StepMessages reste en mode polling/loading en attendant que n8n insère les 5 messages dans `onboarding_messages`

### Fichiers modifiés
- `src/components/onboarding/StepBakery.tsx` — min slider à 1
- `src/components/onboarding/StepOffers.tsx` — checkbox individuelle par produit, bouton ajout offre, suppression de l'étape StepValidateOffers (plus nécessaire car la validation se fait ici)
- `src/components/onboarding/StepMessages.tsx` — 5 labels, polling >= 5, délais entre messages, bulle d'info
- `src/pages/OnboardingPage.tsx` — appel webhook redaction-messages à la transition étape 3→4

