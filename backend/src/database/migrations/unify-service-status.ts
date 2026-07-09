// backend/src/database/migrations/unify-service-status.ts
//
// Remplace les anciens booléens isActive/isPendingApproval des services par
// un statut unique (status: pending_approval | active | disabled | banned)
// pour que la base reste cohérente avec le schema actuel.
//
// Usage : npm run migrate:unify-service-status   (depuis backend/)

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Reservia';
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const services = db.collection('services');

  const toPendingApproval = await services.updateMany(
    { isPendingApproval: true },
    { $set: { status: 'pending_approval' } },
  );

  const toActive = await services.updateMany(
    { isPendingApproval: false, isActive: true },
    { $set: { status: 'active' } },
  );

  const toDisabled = await services.updateMany(
    { isPendingApproval: false, isActive: false },
    { $set: { status: 'disabled' } },
  );

  const cleaned = await services.updateMany(
    {},
    { $unset: { isActive: '', isPendingApproval: '' } },
  );

  console.log('Migration statut service terminée :', {
    toPendingApproval: toPendingApproval.modifiedCount,
    toActive: toActive.modifiedCount,
    toDisabled: toDisabled.modifiedCount,
    cleaned: cleaned.modifiedCount,
  });

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
