

# Plan d'implémentation — Améliorations Onboarding B2Boost

## Résumé des changements

10 modifications à apporter au tunnel d'onboarding et à la page de paiement.

---

## 1. Extraction des offres via webhook n8n

**Fichier** : `src/components/onboarding/StepOffers.tsx`

Remplacer l'appel à `supabase.functions.invoke("extract-offers")` par un `fetch` POST vers `https://n8n.beautifulflow.ai/webhook/depot-offres`. Envoyer le fichier (FormData ou base64 + filename) et parser la réponse pour construire les `OfferEntry[]`.

---

## 2. Séquence de prospection via webhook n8n

**Fichiers** : `src/components/onboarding/StepMessages.tsx`, `src/pages/OnboardingPage.tsx`

- Quand on entre à l'étape 6, appeler `POST https://n8n.beautifulflow.ai/webhook/exemples-messages` avec les bakeries et offres validées.
- Afficher les messages retournés en **lecture seule** (pas d'Input/Textarea éditables).
- Ajouter un bouton "Valider" et un bouton "Demander des modifications" qui affiche un champ texte pour saisir des indications, puis relance le webhook avec ces indications.
- Supprimer la fonction `generateMessages` locale.

---

## 3. Récap campagne — Supprimer "Taille de vague"

**Fichiers** : `src/components/onboarding/StepCampaignRecap.tsx`, `src/pages/OnboardingPage.tsx`

- Retirer le bloc `Slider` / taille de vague du récap.
- Retirer les props `waveSize` / `onWaveSizeChange` du composant.
- Nettoyer le state correspondant dans `OnboardingPage`.

---

## 4. Récap — Bouton "Choisir mon rythme de prospection"

**Fichier** : `src/components/onboarding/StepCampaignRecap.tsx`

Modifier le texte du bouton de "Lancer la campagne" à "Choisir mon rythme de prospection".

---

## 5. Page Packs — Indication crédits = prospects

**Fichier** : `src/components/onboarding/StepPayment.tsx`

Ajouter sous le titre une note explicative : "25 crédits = 25 nouveaux prospects contactés, soit 75 emails envoyés (3 par prospect)."

---

## 6. Supprimer les tarifs des packs

**Fichier** : `src/components/onboarding/StepPayment.tsx`

Retirer l'affichage du prix (`pack.price`, `€`) des boutons de sélection de pack et du bouton de soumission.

---

## 7. Tutoiement dans toute l'app

**Fichiers** : Tous les composants onboarding + pages principales.

Passer en revue tous les textes pour remplacer le vouvoiement par le tutoiement (ex: "Découvrez" → "Découvre", "ajustez" → "ajuste", "Vérifie" ok déjà).

---

## 8. Upload de logo pour signature email

**Fichiers** : `src/components/onboarding/StepPayment.tsx` (ou nouveau composant), `src/pages/OnboardingPage.tsx`

- Ajouter un champ d'upload d'image (logo) dans le formulaire de création de compte.
- Stocker le logo dans un bucket Supabase Storage `logos` (migration SQL pour créer le bucket).
- Sauvegarder l'URL du logo dans la table `profiles` (migration pour ajouter colonne `logo_url`).

---

## 9. Page de succès post-création de compte

**Fichier** : Nouveau `src/components/onboarding/StepSuccess.tsx`, + `src/pages/OnboardingPage.tsx`

- Ajouter une étape 9 après le paiement.
- Afficher : "Félicitations, ta campagne est créée ! On a bien reçu ta demande. D'ici 48h nous te contacterons pour valider son lancement."
- Bouton vers le dashboard.
- Passer `TOTAL_STEPS` à 9.

---

## 10. Fix création de compte

**Fichier** : `src/components/onboarding/StepPayment.tsx`

Le signup échoue probablement car les inserts (bakeries, offers, etc.) sont exécutés immédiatement après `signUp` mais les policies RLS exigent `auth.uid()` qui n'est pas encore actif (email non confirmé). Solutions :
- Désactiver la confirmation email dans Supabase Auth settings, **ou**
- Utiliser `supabase.auth.signUp()` puis `supabase.auth.signInWithPassword()` immédiatement après pour obtenir une session active avant les inserts.
- Vérifier aussi que la session est bien établie avant d'effectuer les insertions.

---

## Migrations Supabase nécessaires

1. **Bucket storage `logos`** pour l'upload de logo
2. **Colonne `logo_url`** sur `profiles`

---

## Ordre d'implémentation

1. Fix création de compte (critique)
2. Webhooks n8n (offres + messages)
3. Modifications UI (récap, packs, tutoiement, logo, succès)

