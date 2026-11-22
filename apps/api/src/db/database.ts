import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, QueryResultRow } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

export type DbClient = Pool | PoolClient;
@Injectable()
export class Database implements OnModuleDestroy {
  readonly pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 12,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    application_name: 'empreinteflex-api',
  });
  // Drizzle adapter, available for typed query modules as they are introduced.
  readonly orm: NodePgDatabase = drizzle(this.pool);
  query<T extends QueryResultRow = any>(sql: string, params: any[] = []) {
    return this.pool.query<T>(sql, params);
  }
  async tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally { client.release(); }
  }
  onModuleDestroy() { return this.pool.end(); }
}
