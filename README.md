# dice-anarchy — Lanceur de dés Shadowrun: Anarchy

Application web légère (Vite + JavaScript vanilla) pour lancer les dés de **Shadowrun: Anarchy**,
avec gestion des dés spéciaux, du seuil de Chance et de la relance.

Interface cyberpunk, entièrement en français, sans dépendance runtime.

## Fonctionnalités

- **Réserve de dés** ajustable (1 à 50).
- **Dés de Complication** qui *remplacent* une partie de la réserve.
- **Dé d'Imprévu** optionnel (+1 dé).
- **Chance Avant-Jet** : abaisse le seuil de succès de 5 à 4.
- **Relance de Chance** : relance *tous* les dés, hors effets acquis.
- Détection des **Exploits** et **Complications**, avec alertes visuelles.
- Modale de règles intégrée, accessible au clavier.

## Règles implémentées

| Élément | Comportement |
| --- | --- |
| **Succès** | Un dé de 5 ou 6 (ou 4-5-6 avec la Chance Avant-Jet). |
| **Chance Avant-Jet** | Abaisse le seuil de succès à 4. |
| **Dé Normal** | Dé classique de la réserve. |
| **Dé d'Imprévu** | S'ajoute à la réserve. Un **5-6** génère un *Exploit* ; un **1** génère une *Complication*. Compte comme un succès s'il atteint le seuil. |
| **Dé de Complication** | Remplace des dés de la réserve. Un **1** génère une *Complication*. Ne génère jamais d'Exploit, mais compte comme un succès s'il atteint le seuil. |
| **Relance (Après-Jet)** | Dépense un point de Chance pour relancer **tous** les dés. Un dé porteur d'un effet **acquis** — Complication ou Exploit — est **verrouillé** et n'est pas relancé. |

> Note : le seuil d'un *Exploit* reste **5-6**, indépendamment de la Chance Avant-Jet
> (qui ne modifie que le seuil de succès).

## Développement

Prérequis : [Node.js](https://nodejs.org/) (18+).

```bash
npm install      # installe les dépendances de dev (Vite)
npm run dev      # serveur de développement avec HMR
npm run build    # build de production dans dist/
npm run preview  # prévisualise le build de production
```

## Structure du projet

```
.
├── index.html     # structure de la page (point d'entrée Vite)
├── main.js        # logique du lanceur de dés (état, jets, relance, rendu)
├── style.css      # thème cyberpunk et mise en page
├── public/        # assets statiques (favicon)
└── dist/          # build de production (généré, non versionné)
```

## Licence

Non spécifiée.
