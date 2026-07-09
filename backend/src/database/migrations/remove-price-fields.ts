// backend/src/database/migrations/remove-price-fields.ts
//
// L'application est désormais 100% gratuite : ce script nettoie les documents
// existants qui contiennent encore d'anciens champs liés au prix, pour que la
// base reste cohérente avec les schemas actuels (qui ne déclarent plus ces champs).
//
// Usage : npm run migrate:remove-price   (depuis backend/)

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Reservia';
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const results: Record<string, number> = {};

  const services = await db
    .collection('services')
    .updateMany(
      {},
      { $unset: { basePrice: '', price: '', discountPrice: '' } },
    );
  results.services = services.modifiedCount;

  const users = await db
    .collection('users')
    .updateMany({}, { $unset: { 'preferences.maxPrice': '' } });
  results.users = users.modifiedCount;

  const reservations = await db
    .collection('reservations')
    .updateMany({}, { $unset: { price: '' } });
  results.reservations = reservations.modifiedCount;

  console.log(
    'Champs liés au prix supprimés des documents existants :',
    results,
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
