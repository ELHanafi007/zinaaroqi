const fs = require('fs');
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Missing MONGODB_URI. Add it to .env.local first.');
fs.writeFileSync('/tmp/alt.txt', uri);
