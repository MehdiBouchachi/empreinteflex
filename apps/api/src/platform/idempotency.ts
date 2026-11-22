import { ConflictException, BadRequestException } from '@nestjs/common';
import { PoolClient } from 'pg';
import { digest } from './utils';
export async function withIdempotency<T>(client: PoolClient, scope: string, key: string, body: any, handler: () => Promise<T>): Promise<T> {
  if (!key || key.length < 12 || key.length > 128) throw new BadRequestException('Idempotency-Key must be 12-128 characters');
  const requestHash = digest(JSON.stringify(body));
  await client.query('INSERT INTO idempotency_records(scope,idempotency_key,request_hash) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [scope,key,requestHash]);
  const row = (await client.query('SELECT * FROM idempotency_records WHERE scope=$1 AND idempotency_key=$2 FOR UPDATE', [scope,key])).rows[0];
  if (row.request_hash !== requestHash) throw new ConflictException('Idempotency key reused for a different request');
  if (row.state === 'COMPLETED') return row.response as T;
  const result = await handler();
  await client.query("UPDATE idempotency_records SET response=$3, state='COMPLETED' WHERE scope=$1 AND idempotency_key=$2", [scope,key,JSON.stringify(result)]);
  return result;
}
