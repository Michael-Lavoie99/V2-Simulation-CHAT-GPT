# Simulation de vente automobile (Client IA)

Application web légère (HTML/CSS/JS) pour entraîner un représentant automobile avec un **client simulé par ChatGPT**.

## Fonctionnalités

- Plusieurs personnages clients avec des situations distinctes.
- Conversation interactive représentant ↔ client IA.
- Évaluation du représentant sur **100%** avec 3 axes pondérés :
  - Qualification du client (40%)
  - Présentation du véhicule (35%)
  - Finalisation de la vente (25%)
- Rétroaction instantanée pour améliorer les compétences de vente.
- Compatible pour une présentation d'offre de véhicule **neuf** ou **d'occasion**.

## Démarrage

```bash
python3 -m http.server 8000
```

Puis ouvrir : http://localhost:8000

## Utilisation

1. Sélectionner un personnage client.
2. Choisir le type de véhicule (neuve/occasion).
3. Démarrer la simulation.
4. Poser des questions détaillées (budget, besoins, kilométrage, etc.).
5. Présenter les caractéristiques du véhicule.
6. Proposer une offre et conclure.
7. Observer la note sur 100% et la rétroaction pour progresser.
