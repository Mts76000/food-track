# NutriTrack 🥗

Appli de suivi nutritionnel en React Native / Expo.
Permet de logger ses repas, scanner des codes-barres et suivre ses calories au quotidien.

## Setup

1. Cloner le repo
2. Copier `.env.example` en `.env` et ajouter ta clé Clerk
3. `npm install`
4. `npx expo start`

> ⚠️ Il faut un compte [Clerk](https://clerk.com) pour que l'auth fonctionne.

## Stack

- **Expo SDK 54** + Expo Router v6
- **Clerk** pour l'authentification (email + MDP, vérification par code)
- **Open Food Facts API** pour les données nutritionnelles
- **AsyncStorage** pour la persistence locale
- **expo-camera** pour le scan de codes-barres

## Structure du projet

- `app/(auth)` : Connexion et inscription
- `app/(main)/(home)` : Liste et détail des repas
- `app/(main)/add` : Ajout de repas + scanner
- `utils/` : Helpers (API, storage, calculs, dates)
- `types/` : Définitions TypeScript
- `constants/` : Thème (couleurs, spacing, radius)

## TODO

- [ ] Pull-to-refresh sur la liste des repas
- [ ] Découper `add/index.tsx` (trop gros, 700+ lignes)
- [ ] Tests unitaires sur les utils
- [ ] Mode hors-ligne
