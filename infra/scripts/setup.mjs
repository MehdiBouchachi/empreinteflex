import { existsSync,readFileSync,writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'../..');
if(existsSync(join(root,'.env'))){console.log('.env already exists; keeping existing credentials.');process.exit(0)}
let config=readFileSync(join(root,'.env.example'),'utf8');
const db=randomBytes(24).toString('base64url'),admin=randomBytes(24).toString('base64url');
config=config.replaceAll('CHANGE_TO_A_LONG_RANDOM_DB_PASSWORD',db).replace('CHANGE_TO_A_LONG_RANDOM_ADMIN_PASSWORD',admin);
config=config.replace('ADMIN_EMAIL=admin@empreinteflex.local','ADMIN_EMAIL=admin@empreinteflex.test');
config+='\n# Enable sample SKUs ONLY in disposable local evaluation\nSEED_DEMO=true\n';
writeFileSync(join(root,'.env'),config,{mode:0o600,flag:'wx'});
console.log('Created .env with unique generated passwords.');
console.log('Initial admin login: admin@empreinteflex.test');
console.log('Initial admin password:',admin);
console.log('Store this password safely. Before production, disable SEED_DEMO, enable HTTPS, and configure backup/SMTP.');
