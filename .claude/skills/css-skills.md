# Compétences CSS / Tailwind

## Principes fondamentaux

- **CSS centralisé** : Tout le CSS personnalisé de l’application **doit** être écrit dans `app/globals.css`.  
  Aucune page ou composant ne doit avoir son propre fichier CSS (sauf exceptions justifiées pour des librairies tierces).
- **Approche utility‑first** : Utiliser les classes Tailwind autant que possible. Le CSS personnalisé ne sert que pour des styles complexes ou des animations spécifiques qui ne peuvent pas être exprimées en Tailwind.

## Organisation du CSS personnalisé

Le fichier `globals.css` est structuré en **sections préfixées** pour éviter les collisions et faciliter la maintenance.  
Les préfixes existants sont :

- `navbar-*` – barre de navigation
- `sdp-*` / `sp-*` – pages de détail / carte de service
- `prov-*` – dashboard et pages du prestataire
- `admin-*` – interface d’administration
- `filterbar__*` – barre de filtres
- `cc-*` – carte client (map)
- `chatbot-*` – composant chatbot
- `auth-*` – pages d’authentification (login, register)
- `dashboard-*` – tableaux de bord généraux

**Règles** :
- Si tu crées une nouvelle fonctionnalité, **ajoute un nouveau préfixe** (ex: `profile-*`) et documente‑le brièvement dans un commentaire en tête de section.
- Regroupe toutes les règles relatives à ce préfixe dans une même zone du fichier.
- Évite de dupliquer des règles ; réutilise les classes existantes avec des combinaisons Tailwind.

## Design moderne et responsive

- **Tokens de conception** : Toutes les variables (couleurs, espacements, rayons, polices, transitions) sont définies dans `:root` (et `.dark` pour le mode sombre).  
  Utilise ces variables CSS plutôt que des valeurs en dur.
- **Responsive** : Privilégie les classes Tailwind `sm:`, `md:`, `lg:`, `xl:` pour l’adaptation aux écrans. Pour des cas complexes, utilise des media queries dans `globals.css` avec les mêmes breakpoints.
- **Animations** :
  - Utilise les utilitaires Tailwind pour les transitions (`transition-all`, `duration-300`, `ease-in-out`).
  - Pour des animations personnalisées, définis des `@keyframes` dans `globals.css` et crée des classes utilitaires associées (ex: `.fade-in`, `.slide-up`).
- **Mode sombre** : La classe `.dark` est appliquée sur `<html>`. Utilise `dark:` dans les classes Tailwind ou des sélecteurs `.dark .ma-classe` dans le CSS personnalisé.
- **Éviter `!important`** : Utilise la spécificité naturelle (préfixes, nesting) pour surcharger les styles.

## Bonnes pratiques

- Avant d’ajouter du CSS personnalisé, vérifie si une combinaison de classes Tailwind peut faire l’affaire.
- Si tu dois écrire du CSS, place‑le dans la section appropriée avec son préfixe.
- Les classes CSS doivent être **réutilisables** et **nommées sémantiquement** (ex: `.card-hover` plutôt que `.blue-box`).
- Les animations doivent être **fluides** et **non intrusives** (durée < 300ms pour les micro‑interactions).
- La page doit rester **accessible** (contraste, focus visible, etc.).