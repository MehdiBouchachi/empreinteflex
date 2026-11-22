import { Controller, Get, Post, Patch, Param, Query, Body, Req, UseGuards, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Database } from '../db/database';
import { AuthService } from '../auth/auth.service';
import { SessionGuard } from '../auth/session.guard';
import { validate, uuid } from '../platform/utils';
@Controller('v1/staff') @UseGuards(SessionGuard)
export class StaffController {
  constructor(private db:Database,private auth:AuthService){}
  @Get('customers') async customers(@Req() req:Request,@Query('q') q='') {
    const u=(req as any).identity;this.auth.require(u,['SELLER','LOCATION_MANAGER','COMPANY_ADMIN']);
    const admin=this.auth.can(u,['COMPANY_ADMIN']);
    return (await this.db.query(`SELECT c.id,c.full_name,c.email,c.phone,c.created_at,
      (SELECT COUNT(*)::int FROM orders o WHERE o.customer_id=c.id) order_count
      FROM customers c WHERE ($1='' OR c.full_name ILIKE '%'||$1||'%' OR c.phone ILIKE '%'||$1||'%')
      AND ($2::boolean OR c.created_location_id=ANY($3::uuid[]) OR EXISTS(
        SELECT 1 FROM orders o WHERE o.customer_id=c.id AND o.sales_location_id=ANY($3::uuid[])))
      ORDER BY c.created_at DESC LIMIT 100`,[q.slice(0,100),admin,u.roles.filter((g:any)=>g.locationId).map((g:any)=>g.locationId)])).rows;
  }
  @Post('customers') async createCustomer(@Req() req:Request,@Body() body:unknown){
    const b=validate(z.object({fullName:z.string().min(2).max(120),email:z.string().email().nullable().optional(),phone:z.string().max(40).nullable().optional(),locationId:uuid}),body);
    const u=(req as any).identity;this.auth.require(u,['SELLER','LOCATION_MANAGER','COMPANY_ADMIN'],b.locationId);
    return (await this.db.query(`INSERT INTO customers(full_name,email,phone,created_by,created_location_id)
      VALUES($1,$2,$3,$4,$5) RETURNING id,full_name,email,phone,created_at`,[b.fullName,b.email??null,b.phone??null,u.id,b.locationId])).rows[0];
  }
  @Get('reports/sales-summary') async sales(@Req() req:Request,@Query('locationId') locationId?:string){
    const u=(req as any).identity;
    this.auth.require(u,['LOCATION_MANAGER','COMPANY_ADMIN'],locationId);
    if(locationId) validate(uuid,locationId);
    if(!locationId && !this.auth.can(u,['COMPANY_ADMIN'])) throw new BadRequestException('Location required');
    // Cash-flow summary (not an accounting tax ledger): payment inflows less cash refunds during the Algeria local day.
    const rows=await this.db.query(`SELECT channel_code,COUNT(*) FILTER (WHERE kind='PAYMENT')::int orders,
      COALESCE(SUM(CASE WHEN kind='REFUND' THEN -amount_minor ELSE amount_minor END),0)::bigint total_minor
      FROM (
        SELECT o.channel_code,p.amount_minor,'PAYMENT' kind,o.id order_id,o.sales_location_id
          FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.state IN ('CONFIRMED','REFUNDED')
          AND p.created_at >= (date_trunc('day',now() AT TIME ZONE 'Africa/Algiers') AT TIME ZONE 'Africa/Algiers')
        UNION ALL
        SELECT o.channel_code,r.amount_minor,'REFUND' kind,o.id order_id,o.sales_location_id
          FROM refunds r JOIN orders o ON o.id=r.order_id
          WHERE r.created_at >= (date_trunc('day',now() AT TIME ZONE 'Africa/Algiers') AT TIME ZONE 'Africa/Algiers')
      ) entries
      WHERE ($1::uuid IS NULL OR sales_location_id=$1 OR EXISTS(
        SELECT 1 FROM fulfillments f WHERE f.order_id=entries.order_id AND f.source_location_id=$1) OR EXISTS(
        SELECT 1 FROM stock_reservations r JOIN order_items oi ON oi.id=r.order_item_id WHERE oi.order_id=entries.order_id AND r.location_id=$1))
      GROUP BY channel_code ORDER BY channel_code`,[locationId??null]);
    return {period:'today',metric:'cash_flow_minor',currency:'DZD',byChannel:rows.rows.map(r=>({...r,total_minor:Number(r.total_minor)}))};
  }
}
@Controller('v1/admin') @UseGuards(SessionGuard)
export class TeamAdminController {
  constructor(private db:Database,private auth:AuthService){}
  @Get('users') async users(@Req() req:Request){
    this.auth.require((req as any).identity,['COMPANY_ADMIN']);
    return (await this.db.query(`SELECT u.id,u.email,u.display_name,u.active,
      COALESCE(json_agg(json_build_object('role',g.role,'locationId',g.location_id)) FILTER (WHERE g.id IS NOT NULL),'[]'::json) roles
      FROM users u LEFT JOIN user_role_grants g ON g.user_id=u.id AND g.revoked_at IS NULL
      GROUP BY u.id ORDER BY u.created_at DESC LIMIT 100`)).rows;
  }
  @Patch('users/:id/status') async status(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){
    this.auth.require((req as any).identity,['COMPANY_ADMIN']);validate(uuid,id);
    const b=validate(z.object({active:z.boolean()}),body);
    if(id===(req as any).identity.id && !b.active) throw new ConflictException('Cannot disable your own account');
    const updated=(await this.db.query('UPDATE users SET active=$2 WHERE id=$1 RETURNING id,email,active',[id,b.active])).rows[0];
    if(!updated) throw new NotFoundException();return updated;
  }
  @Post('users') async create(@Req() req:Request,@Body() body:unknown){
    const u=(req as any).identity;this.auth.require(u,['COMPANY_ADMIN']);
    const b=validate(z.object({email:z.string().email(),displayName:z.string().min(2).max(120),password:z.string().min(12).max(128),role:z.enum(['SELLER','LOCATION_MANAGER','COMPANY_ADMIN','TECHNICAL_OPERATOR']),locationId:uuid.nullable().optional()}),body);
    if(['SELLER','LOCATION_MANAGER'].includes(b.role) !== !!b.locationId) throw new BadRequestException('Location scope does not match selected role');
    const hashed=await bcrypt.hash(b.password,12);
    return this.db.tx(async c=>{
      const user=(await c.query('INSERT INTO users(email,password_hash,display_name,email_verified_at) VALUES($1,$2,$3,now()) RETURNING id,email,display_name',[b.email.trim().toLowerCase(),hashed,b.displayName])).rows[0];
      await c.query('INSERT INTO user_role_grants(user_id,role,location_id,granted_by) VALUES($1,$2,$3,$4)',[user.id,b.role,b.locationId??null,u.id]);
      await c.query('INSERT INTO audit_logs(actor_id,action,subject_type,subject_id,metadata) VALUES($1,\'USER_CREATED\',\'user\',$2,$3)',[u.id,user.id,JSON.stringify({role:b.role,locationId:b.locationId??null})]);
      return user;
    });
  }
}
@Controller('v1/staff/customers') @UseGuards(SessionGuard)
export class CustomerHistoryController {
  constructor(private db:Database,private auth:AuthService){}
  @Get(':id/orders') async history(@Req() req:Request,@Param('id') id:string){
    validate(uuid,id);
    const u=(req as any).identity;this.auth.require(u,['SELLER','LOCATION_MANAGER','COMPANY_ADMIN']);
    const all=this.auth.can(u,['COMPANY_ADMIN']);
    const locs=u.roles.filter((x:any)=>x.locationId).map((x:any)=>x.locationId);
    const customer=(await this.db.query(`SELECT id FROM customers WHERE id=$1 AND ($2::boolean OR created_location_id=ANY($3::uuid[])
      OR EXISTS(SELECT 1 FROM orders WHERE customer_id=$1 AND sales_location_id=ANY($3::uuid[])))`,[id,all,locs])).rows[0];
    if(!customer) throw new NotFoundException();
    return (await this.db.query(`SELECT order_number,channel_code,status,total_minor,created_at FROM orders WHERE customer_id=$1
      AND ($2::boolean OR sales_location_id=ANY($3::uuid[])) ORDER BY created_at DESC LIMIT 100`,[id,all,locs])).rows.map(x=>({...x,total_minor:Number(x.total_minor)}));
  }
}
