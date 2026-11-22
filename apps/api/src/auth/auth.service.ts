import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Database } from '../db/database';
import { digest, token } from '../platform/utils';
export type Identity = { id: string; email: string; displayName: string; roles: { role: string; locationId: string|null }[]; customerId?: string|null };
@Injectable()
export class AuthService {
  constructor(private readonly db: Database) {}
  async identity(req: Request): Promise<Identity> {
    const raw = req.cookies?.ef_session;
    if (!raw || typeof raw !== 'string') throw new UnauthorizedException();
    const rows = await this.db.query(`SELECT u.id,u.email,u.display_name,u.active,
      (SELECT c.id FROM customers c WHERE c.user_id=u.id) customer_id FROM sessions s JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=$1 AND s.expires_at>now() AND s.revoked_at IS NULL`, [digest(raw)]);
    const u = rows.rows[0];
    if (!u || !u.active) throw new UnauthorizedException();
    const grants = await this.db.query('SELECT role,location_id FROM user_role_grants WHERE user_id=$1 AND revoked_at IS NULL', [u.id]);
    return { id: u.id, email: u.email, displayName: u.display_name, roles: grants.rows.map(x=>({role:x.role,locationId:x.location_id})),customerId:u.customer_id };
  }
  async login(email: string,password: string,res:Response) {
    const u = (await this.db.query('SELECT * FROM users WHERE email=$1 AND active=true',[email.trim().toLowerCase()])).rows[0];
    if (!u || !(await bcrypt.compare(password,u.password_hash))) throw new UnauthorizedException('Invalid login');
    await this.createSession(u.id,res);
    return { ok: true, displayName: u.display_name };
  }
  async register(email:string,password:string,name:string,res:Response) {
    const normalized=email.trim().toLowerCase();
    const hash=await bcrypt.hash(password,12);
    try {
      const id=await this.db.tx(async c=>{
        const u=(await c.query('INSERT INTO users(email,password_hash,display_name) VALUES($1,$2,$3) RETURNING id',[normalized,hash,name])).rows[0];
        await c.query("INSERT INTO user_role_grants(user_id,role) VALUES($1,'CUSTOMER')",[u.id]);
        await c.query('INSERT INTO customers(user_id,full_name,email) VALUES($1,$2,$3)',[u.id,name,normalized]);
        return u.id as string;
      });
      await this.createSession(id,res);
      return {ok:true};
    } catch(e:any) { if(e.code==='23505') throw new ConflictException('Email already registered'); throw e; }
  }
  private async createSession(id:string,res:Response) {
    const raw=token();
    await this.db.query("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '7 days')",[id,digest(raw)]);
    res.cookie('ef_session',raw,{httpOnly:true,secure:process.env.COOKIE_SECURE==='true',sameSite:'lax',path:'/',maxAge:7*86400*1000});
  }
  async logout(req:Request,res:Response){
    if(req.cookies?.ef_session) await this.db.query('UPDATE sessions SET revoked_at=now() WHERE token_hash=$1',[digest(req.cookies.ef_session)]);
    res.clearCookie('ef_session',{path:'/',secure:process.env.COOKIE_SECURE==='true',sameSite:'lax'});
    return {ok:true};
  }
  can(identity: Identity, roles: string[], locationId?:string): boolean {
    return identity.roles.some(g=>roles.includes(g.role) && (!locationId || g.locationId===null || g.locationId===locationId));
  }
  require(identity:Identity,roles:string[],locationId?:string){
    if(!this.can(identity,roles,locationId)) throw new ForbiddenException('Insufficient role or location access');
  }
}
