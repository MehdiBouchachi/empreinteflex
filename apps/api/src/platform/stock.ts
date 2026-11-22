import { ConflictException } from '@nestjs/common';
import { PoolClient } from 'pg';
export async function changeStock(c: PoolClient, input: {
  locationId: string; variantId: string; onHand: number; reserved: number;
  eventType: string; eventId: string; eventLine?: number; actorId?: string | null; reason?: string;
}) {
  // Single conditional mutation, checked before journal insert, all in caller's transaction.
  const row = await c.query(`UPDATE stock_balances SET on_hand=on_hand+$3, reserved=reserved+$4, updated_at=now()
    WHERE location_id=$1 AND variant_id=$2 AND on_hand+$3>=0 AND reserved+$4>=0 AND reserved+$4<=on_hand+$3
    RETURNING on_hand,reserved`, [input.locationId,input.variantId,input.onHand,input.reserved]);
  if (!row.rowCount) throw new ConflictException('Insufficient or uninitialized stock at location');
  await c.query(`INSERT INTO stock_movements(location_id,variant_id,event_type,event_id,event_line,delta_on_hand,delta_reserved,actor_id,reason)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [input.locationId,input.variantId,input.eventType,input.eventId,input.eventLine??0,input.onHand,input.reserved,input.actorId??null,input.reason??null]);
}
export async function stockForVariants(c: PoolClient, variantIds: string[]) {
  // Stable lock order protects against deadlocks when selling multiple SKUs.
  const rows = await c.query(`SELECT v.id,v.sku,p.name,v.width_mm,v.length_mm,v.height_mm,v.attributes,
    vp.amount_minor, vp.currency FROM product_variants v JOIN products p ON p.id=v.product_id
    JOIN LATERAL (SELECT amount_minor,currency FROM variant_prices WHERE variant_id=v.id AND effective_from<=now()
      AND (effective_until IS NULL OR effective_until>now()) ORDER BY effective_from DESC LIMIT 1) vp ON true
    WHERE v.id=ANY($1::uuid[]) AND v.active=true AND p.active=true ORDER BY v.id`, [variantIds]);
  if (rows.rowCount !== variantIds.length) throw new ConflictException('One or more variants are unavailable or unpriced');
  return new Map(rows.rows.map(x => [x.id, x]));
}
