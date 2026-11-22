import { productMediaUrl } from '../platform/product-media';
import { Controller, Get, Post, Query, Body, Req, UseGuards, BadRequestException, NotFoundException, Headers } from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { Database } from '../db/database';
import { AuthService } from '../auth/auth.service';
import { SessionGuard } from '../auth/session.guard';
import { changeStock } from '../platform/stock';
import { withIdempotency } from '../platform/idempotency';
import { uuid, validate } from '../platform/utils';
@Controller('v1/staff') @UseGuards(SessionGuard)
export class InventoryController {
  constructor(private db:Database,private auth:AuthService){}
  @Get('locations') async locations(@Req() req:Request){
    const u=(req as any).identity;
    this.auth.require(u,['SELLER','LOCATION_MANAGER','COMPANY_ADMIN']);
    const admin=this.auth.can(u,['COMPANY_ADMIN']);
    const rows=await this.db.query(`SELECT DISTINCT l.id,l.code,l.name,l.kind,l.active FROM locations l
      WHERE l.active AND ($1::boolean OR l.id=ANY($2::uuid[])) ORDER BY l.name`,[admin,u.roles.filter((x:any)=>x.locationId).map((x:any)=>x.locationId)]);
    return rows.rows;
  }
  @Get('inventory') async inventory(@Req() req:Request,@Query('locationId') locationId:string,@Query('q') q='',@Query('groupBy') groupBy?:string){
    validate(uuid,locationId);
    this.auth.require((req as any).identity,['SELLER','LOCATION_MANAGER','COMPANY_ADMIN'],locationId);
    const grouped=groupBy==='product';
    const matches="(p.name ILIKE '%'||$2||'%' OR v.sku ILIKE '%'||$2||'%')";
    const rows=await this.db.query(`SELECT v.id variant_id,v.sku,p.name,v.width_mm,v.length_mm,v.height_mm,
      ${grouped?'p.id product_id, media.asset_id image_asset_id, media.r2_key image_key,':''}
      COALESCE(s.on_hand,0) on_hand,COALESCE(s.reserved,0) reserved,
      COALESCE(s.on_hand-s.reserved,0) available, vp.amount_minor
      FROM product_variants v JOIN products p ON p.id=v.product_id
      ${grouped?`LEFT JOIN LATERAL (
        SELECT pm.asset_id,pm.r2_key FROM product_media pm
        WHERE pm.product_id=p.id AND pm.deleted_at IS NULL AND (pm.asset_id IS NOT NULL OR $3::boolean)
        ORDER BY pm.sort_order,pm.created_at,pm.id LIMIT 1
      ) media ON true`:''}
      LEFT JOIN stock_balances s ON s.variant_id=v.id AND s.location_id=$1
      LEFT JOIN LATERAL (SELECT amount_minor FROM variant_prices WHERE variant_id=v.id AND effective_from<=now() AND (effective_until IS NULL OR effective_until>now()) ORDER BY effective_from DESC LIMIT 1) vp ON true
      WHERE v.active AND ${grouped?`p.active AND p.id IN (
        SELECT p.id FROM products p
        WHERE p.active
          AND EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id=p.id AND v.active AND ${matches})
        ORDER BY p.name,p.id LIMIT 100
      )`:matches}
      ORDER BY p.name,v.sku ${grouped?'':'LIMIT 100'}`,grouped?[locationId,q.slice(0,70),Boolean(process.env.R2_PUBLIC_URL)]:[locationId,q.slice(0,70)]);
    return rows.rows.map(({image_asset_id,image_key,...row})=>({
      ...row,amount_minor:row.amount_minor===null?null:Number(row.amount_minor),
      ...(grouped?{image_url:productMediaUrl(image_asset_id,image_key)}:{})
    }));
  }
  @Post('inventory/adjustments') async adjust(@Req() req:Request,@Body() body:unknown,@Headers('idempotency-key') key:string){
    const b=validate(z.object({locationId:uuid,variantId:uuid,delta:z.number().int().min(-100000).max(100000).refine(v=>v!==0),reason:z.string().min(5).max(300)}),body);
    const u=(req as any).identity;
    this.auth.require(u,['LOCATION_MANAGER','COMPANY_ADMIN'],b.locationId);
    const eventId=randomUUID();
    return this.db.tx(async c=>withIdempotency(c,`adjust:${u.id}`,key,b,async()=>{
      const loc=(await c.query('SELECT id FROM locations WHERE id=$1 AND active',[b.locationId])).rows[0];
      const variant=(await c.query('SELECT id FROM product_variants WHERE id=$1 AND active',[b.variantId])).rows[0];
      if(!loc||!variant) throw new NotFoundException('Location or variant');
      await c.query('INSERT INTO stock_balances(location_id,variant_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[b.locationId,b.variantId]);
      await changeStock(c,{locationId:b.locationId,variantId:b.variantId,onHand:b.delta,reserved:0,eventType:'ADJUSTMENT',eventId,actorId:u.id,reason:b.reason});
      await c.query('INSERT INTO audit_logs(actor_id,location_id,action,subject_type,subject_id,metadata) VALUES($1,$2,\'STOCK_ADJUSTED\',\'variant\',$3,$4)',[u.id,b.locationId,b.variantId,JSON.stringify({delta:b.delta,reason:b.reason})]);
      return {ok:true,movementId:eventId};
    }));
  }
}
