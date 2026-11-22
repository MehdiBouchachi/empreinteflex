import { BadRequestException, ConflictException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { z, ZodType } from 'zod';
export const uuid = z.string().uuid();
export const qty = z.number().int().min(1).max(500);
export const priceMinor = z.number().int().min(0).max(1_000_000_000_000);
export function validate<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new BadRequestException(result.error.flatten());
  return result.data;
}
export function digest(value: string) { return createHash('sha256').update(value).digest('hex'); }
export function token() { return randomBytes(32).toString('base64url'); }
export function orderNumber() { return `EF-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${randomBytes(5).toString('hex').toUpperCase()}`; }
export function safeMoney(value: string | number): number {
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 0) throw new ConflictException('Invalid amount from database');
  return result;
}
export function assertPositiveItems(items: { variantId: string; quantity: number }[]) {
  const ids = items.map(x => x.variantId);
  if (new Set(ids).size !== ids.length) throw new BadRequestException('Duplicate variants; combine quantities');
  if (items.reduce((a,b)=>a+b.quantity,0) > 500) throw new BadRequestException('Too many items');
}
