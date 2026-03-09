

# Plan : Renommer "produit" en "offre" + Réflexion stockage

## 1. Renommer le bouton

Dans `StepOffers.tsx`, changer le texte du bouton "Ajouter un produit manuellement" en **"Ajouter une offre manuellement"**.

## 2. Pas de stockage Supabase pendant l'onboarding

Stocker les offres en base pendant l'onboarding n'est **pas nécessaire ni souhaitable** pour les raisons suivantes :

- L'utilisateur n'a pas encore de compte (pas de `user_id`, pas de session auth). Les tables `offers` et `bakeries` ont des policies RLS qui exigent `auth.uid()`.
- Le state local (`offers[]`, `selectedOfferIds`) est déjà transmis d'étape en étape via les props dans `OnboardingPage.tsx`. Les offres (document + manuelles) sont dans le même tableau et passent correctement aux étapes 5, 6, 7 et 8.
- Tout est persisté en base à l'étape 8 (création de compte), ce qui est le bon moment.

Créer des entrées orphelines sans `user_id` avec un "status" ajouterait de la complexité (nettoyage des abandons, table temporaire sans RLS, etc.) sans bénéfice réel.

## Changement unique

| Fichier | Modification |
|---|---|
| `src/components/onboarding/StepOffers.tsx` | Texte du bouton : "Ajouter une offre manuellement" |

