# Compétences MongoDB / Mongoose

- Schémas : définis dans `src/database/schemas/` avec `@Schema()` et `@Prop()`.
- Index : éviter les doublons (ne pas mettre `unique: true` et `schema.index()` en même temps).
- Requêtes : utiliser les méthodes Mongoose (`find`, `findOne`, `aggregate`).
- Relations : utiliser `populate` pour les références.
- Validation : utiliser les validateurs intégrés ou `class-validator` avec les DTO.
- Optimisation : utiliser `lean()` pour les lectures lorsque possible, `select` pour limiter les champs.