import { Pool } from 'pg';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
async function main(){
  const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1});
  const dir=[join(process.cwd(),'migrations'),join(process.cwd(),'apps/api/migrations')].find(existsSync);
  if(!dir) throw new Error('SQL migrations directory not found');
  const c=await pool.connect();
  try {
    await c.query(`CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())`);
    for(const file of readdirSync(dir).filter(n=>/^\d+_.+\.sql$/.test(n)).sort()){
      await c.query('BEGIN');
      try {
        const present=(await c.query('SELECT 1 FROM schema_migrations WHERE name=$1',[file])).rowCount;
        if(!present){
          await c.query(readFileSync(join(dir,file),'utf8'));
          await c.query('INSERT INTO schema_migrations(name) VALUES($1)',[file]);
          console.log('Applied',file);
        }
        await c.query('COMMIT');
      } catch(err){await c.query('ROLLBACK');throw err;}
    }
  } finally {c.release();await pool.end();}
}
main().catch(err=>{console.error(err);process.exit(1)});
