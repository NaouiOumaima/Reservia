# Compétences Next.js 14

- Utiliser le dossier `app/` avec `page.tsx`, `layout.tsx`, `loading.tsx`.
- Privilégier les composants serveur par défaut ; utiliser `'use client'` pour les interactifs.
- Récupération de données : `fetch` dans les composants serveur ; SWR ou React Query côté client.
- Middleware : `middleware.ts` pour l’authentification et les redirections.
- Optimisation des images : `next/image` avec `priority` pour le LCP.
- Variables d’environnement : `NEXT_PUBLIC_*` pour le client.
- Styles : Tailwind + CSS personnalisé avec variables CSS.

Voir la structure du projet : `features/` pour la logique, `components/` pour l’UI partagée.