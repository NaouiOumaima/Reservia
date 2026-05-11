# 📚 Guide des Catégories - Reservia

## Vue d'ensemble

Toutes les catégories du projet sont centralisées dans un seul fichier pour garantir la cohérence et faciliter la maintenance.

## Fichiers principaux

```
frontend/lib/api/constants/
├── categories.ts          # Définition des catégories
└── index.ts              # Exports principaux
```

## Utilisation

### Import basique

```typescript
import { CATEGORIES } from '@/lib/api/constants/categories';

// CATEGORIES est un array de tous les types de services
CATEGORIES.forEach(cat => {
  console.log(cat.label);        // 'restaurant'
  console.log(cat.frenchLabel);  // 'Restauration'
  console.log(cat.icon);         // JSX element
});
```

### Utiliser les utilitaires

```typescript
import {
  getCategoryByLabel,
  getCategoryByFrenchLabel,
  getCategoryIcon,
  getCategoryFrenchLabel,
  getAllCategoryLabels,
  getAllCategoryKeys,
} from '@/lib/api/constants/categories';

// Obtenir une catégorie par son label
const cat = getCategoryByLabel('restaurant');
console.log(cat?.frenchLabel); // 'Restauration'

// Obtenir une catégorie par son label français
const cat2 = getCategoryByFrenchLabel('Restauration');
console.log(cat2?.label); // 'restaurant'

// Obtenir uniquement l'icône
const icon = getCategoryIcon('hotel');

// Obtenir le label français
const label = getCategoryFrenchLabel('gym'); // 'Fitness'

// Lister tous les labels français
const allLabels = getAllCategoryLabels();
// ['Restauration', 'Hébergement', 'Beauté & Bien-être', ...]

// Lister tous les labels techniques
const allKeys = getAllCategoryKeys();
// ['restaurant', 'hotel', 'beauté', ...]
```

## Ajouter une nouvelle catégorie

Pour ajouter une nouvelle catégorie :

1. Ouvrez [frontend/lib/api/constants/categories.ts](../constants/categories.ts)
2. Ajoutez une entrée à l'enum `CategoryKey`
3. Ajoutez l'icône au fichier Icons
4. Créez une nouvelle entrée dans l'array `CATEGORIES`

Exemple :

```typescript
export enum CategoryKey {
  RESTAURANT = 'restaurant',
  // ... autres
  VETERINARY = 'veterinary', // Nouvelle catégorie
}

export const CATEGORIES: Category[] = [
  // ... autres
  {
    key: CategoryKey.VETERINARY,
    label: 'veterinary',
    frenchLabel: 'Vétérinaire',
    icon: <VeterinaryIcon className="w-10 h-10" />,
    description: 'Services vétérinaires et cliniques animales',
  },
];
```

## Pages qui utilisent les catégories

- ✅ **frontend/app/page.tsx** - Page d'accueil
- ✅ **frontend/app/search/page.tsx** - Page de recherche
- ✅ **frontend/app/client/preferences/page.tsx** - Préférences utilisateur

## Bonne pratique

### ✅ À FAIRE

```typescript
// Import depuis le fichier centralisé
import { CATEGORIES, getCategoryFrenchLabel } from '@/lib/api/constants/categories';

// Réutiliser les catégories partout
const label = getCategoryFrenchLabel(serviceCategory);
```

### ❌ À NE PAS FAIRE

```typescript
// Ne pas dupliquer les catégories dans chaque fichier
const CATEGORIES = [
  { id: 'restaurant', name: 'Restaurants' },
  { id: 'hotel', name: 'Hôtels' },
  // ...
];
```

## Structure des données

```typescript
interface Category {
  key: CategoryKey;           // Clé d'énumération
  label: string;              // Label technique (lowercase)
  frenchLabel: string;        // Label affiché au client
  icon: JSX.Element;          // Icône React
  description: string;        // Description
  color?: string;             // Couleur optionnelle
}
```

## Performance

Les catégories sont statiques et ne changent pas durant l'exécution. Elles sont :
- ✅ Sérialisées en tant que constantes
- ✅ Accessibles sans requête API
- ✅ Optimisées pour la réutilisabilité

Si vous devez permettre aux admins de modifier les catégories, migrez vers une collection MongoDB (future amélioration).
