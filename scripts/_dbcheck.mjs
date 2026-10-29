import mongoose from 'mongoose';
const uri = process.argv[2];
await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
const db = mongoose.connection.db;
const cols = await db.listCollections().toArray();
console.log('collections:', cols.map(c=>c.name).join(', '));
for (const c of cols) {
  const n = await db.collection(c.name).countDocuments();
  console.log(' -', c.name, n);
}
const p = await db.collection('properties').find({}).limit(1).toArray();
console.log('--- sample property ---');
console.log(JSON.stringify(p, null, 2));
await mongoose.disconnect();
