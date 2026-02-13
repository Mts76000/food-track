# App Suivi Nutritionnel

Application mobile de suivi des repas et de leurs apports nutritionnels.

## Installation

```bash
npm install
npm start
```

## Fonctionnalités

- Ajout de repas par recherche ou scanner de code-barres
- Consultation des informations nutritionnelles (Open Food Facts)
- Authentification avec Clerk
- Historique des repas avec détails
- Objectif calorique quotidien

## Structure

- `app/(auth)` : Connexion et inscription
- `app/(main)/(home)` : Liste et détail des repas
- `app/(main)/add` : Ajout de repas et scanner
- `utils/` : Fonctions utilitaires
- `types/` : Définitions TypeScript
