import { productMediaUrl } from '../platform/product-media';
import { Controller, Get, Post, Patch, Param, Query, Body, Req, UseGuards, Headers, ConflictException, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { Request } from 'express';
import { eq } from 'drizzle-orm';
import { categories as categoryTable } from '../db/schema';
import { z } from 'zod';
import { Database } from '../db/database';
import { SessionGuard } from '../auth/session.guard';
import { AuthService } from '../auth/auth.service';
import { validate, uuid, priceMinor } from '../platform/utils';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
const createProduct=z.object({categoryCode:z.string().min(2).max(30),name:z.string().min(2).max(180),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),description:z.string().max(6000).default(''),nameI18n:z.object({fr:z.string().max(180).optional(),en:z.string().max(180).optional(),ar:z.string().max(180).optional()}).optional(),descriptionI18n:z.object({fr:z.string().max(6000).optional(),en:z.string().max(6000).optional(),ar:z.string().max(6000).optional()}).optional(),storefrontMeta:z.record(z.unknown()).optional(),featured:z.boolean().optional()});
const createVariant=z.object({sku:z.string().min(3).max(80).optional(),widthMm:z.number().int().positive(),lengthMm:z.number().int().positive(),heightMm:z.number().int().positive().nullable().optional(),attributes:z.record(z.union([z.string(),z.number(),z.boolean()])).default({}),priceMinor:priceMinor});
const productQuery=`SELECT p.id,p.slug,p.name,p.description,p.name_i18n,p.description_i18n,p.storefront_meta,p.featured,p.discount_percent,c.code category,
  (SELECT pm.r2_key FROM product_media pm WHERE pm.product_id=p.id AND pm.deleted_at IS NULL AND (pm.asset_id IS NOT NULL OR ${Boolean(process.env.R2_PUBLIC_URL)}) ORDER BY pm.sort_order,pm.created_at,pm.id LIMIT 1) image_key,
  (SELECT pm.asset_id FROM product_media pm WHERE pm.product_id=p.id AND pm.deleted_at IS NULL AND (pm.asset_id IS NOT NULL OR ${Boolean(process.env.R2_PUBLIC_URL)}) ORDER BY pm.sort_order,pm.created_at,pm.id LIMIT 1) image_asset_id,
  (SELECT MIN(vp.amount_minor) FROM product_variants v JOIN variant_prices vp ON vp.variant_id=v.id
    WHERE v.product_id=p.id AND v.active=true AND vp.effective_from<=now() AND (vp.effective_until IS NULL OR vp.effective_until>now())) starting_price_minor
  FROM products p JOIN categories c ON c.id=p.category_id`;
@Controller('v1/catalog')
export class CatalogController {
  constructor(private db:Database){}
  @Get('storefront') async storefront(@Query('locale') locale='fr'){
    const lang=['fr','en','ar'].includes(locale)?locale:'fr';
    const rows=(await this.db.query(`${productQuery} WHERE p.active=true ORDER BY p.created_at DESC LIMIT 250`)).rows;
    if(rows.length===0) return [];
    const ids=rows.map(r=>r.id);
    const variants=(await this.db.query(`SELECT v.product_id,v.id,v.sku,v.width_mm,v.length_mm,v.height_mm,v.attributes,
      vp.amount_minor,COALESCE(SUM(GREATEST(0,s.on_hand-s.reserved)),0)::int available
      FROM product_variants v JOIN LATERAL (SELECT amount_minor FROM variant_prices
      WHERE variant_id=v.id AND effective_from<=now() AND (effective_until IS NULL OR effective_until>now()) ORDER BY effective_from DESC LIMIT 1) vp ON true
      LEFT JOIN stock_balances s ON s.variant_id=v.id
      WHERE v.product_id=ANY($1::uuid[]) AND v.active=true
      GROUP BY v.product_id,v.id,v.sku,v.width_mm,v.length_mm,v.height_mm,v.attributes,vp.amount_minor
      ORDER BY v.width_mm,v.length_mm,v.height_mm`,[ids])).rows;
    const media=(await this.db.query(`SELECT product_id,asset_id,r2_key,alt_text FROM product_media WHERE product_id=ANY($1::uuid[]) AND deleted_at IS NULL ORDER BY sort_order,created_at,id`,[ids])).rows;
    const localized=(x:any,field:string)=> x?.[field]?.[lang] || x?.[field]?.fr || x?.[field]?.en || null;
    return rows.map(p=>{
      const pVariants=variants.filter(v=>v.product_id===p.id);
      const pMedia=media.filter(m=>m.product_id===p.id).map(m=>productMediaUrl(m.asset_id,m.r2_key)).filter(Boolean);
      const meta=p.storefront_meta||{};
      const priceList=pVariants.map(v=>Number(v.amount_minor)/100);
      const prices=priceList.length?{min:Math.min(...priceList),max:Math.max(...priceList)}:null;
      const bySize=new Map<string,any>();
      for(const v of pVariants){
        const size=`${v.width_mm/10}x${v.length_mm/10}`;
        if(!bySize.has(size)) bySize.set(size,{dimensionId:size,size,options:[]});
        bySize.get(size).options.push({variantId:v.id,thickness:meta.pricingType==='VARIANT_FULL'?v.height_mm/10:null,
          price:Number(v.amount_minor)/100,available:Number(v.available),sku:v.sku});
      }
      const simple=meta.pricingType==='SIMPLE';
      return {id:p.id,slug:p.slug,name:localized(p,'name_i18n')||p.name,description:localized(p,'description_i18n')||p.description,
        category:meta.range||(p.category==='MATTRESS'?'classic':p.category==='PILLOW'?'oreiller':'sur-matelas'),
        subcategory:meta.subcategory||null,categoryTranslations:meta.categoryTranslations??null,subcategoryTranslations:meta.subcategoryTranslations??null,
        pricingType:meta.pricingType||(simple?'SIMPLE':'VARIANT_FULL'),basePrice:simple?(prices?.min??0):null,
        defaultVariantId:pVariants[0]?.id||null,
        images:pMedia,featured:p.featured,available:pVariants.some(v=>Number(v.available)>0),discount:Number(p.discount_percent)||0,
        minPrice:prices?.min??0,priceRange:prices,details:{thickness:pVariants[0]?.height_mm?`${pVariants[0].height_mm/10} cm`:null,
          firmness:null,dimensions:simple?[]:[...bySize.values()],technicalSpecs:meta.technicalSpecs||[],whyChoose:meta.whyChoose||[]}
      };
    });
  }
  @Get('categories') async categories(){return this.db.orm.select({id:categoryTable.id,code:categoryTable.code,name:categoryTable.name}).from(categoryTable).where(eq(categoryTable.active,true)).orderBy(categoryTable.name);}
  @Get('products') async products(@Query('q') q='',@Query('category') category='',@Query('page') page='1'){
    const p=Math.max(1,Math.min(10000,Number.parseInt(page,10)||1));
    const rows=await this.db.query(`${productQuery} WHERE p.active=true AND ($1='' OR p.name ILIKE '%'||$1||'%') AND ($2='' OR c.code=$2) ORDER BY p.created_at DESC LIMIT 24 OFFSET $3`,[q.slice(0,80),category.slice(0,30),(p-1)*24]);
    return {items:rows.rows.map(x=>({...x,starting_price_minor:x.starting_price_minor===null?null:Number(x.starting_price_minor),image_url:productMediaUrl(x.image_asset_id,x.image_key)})),page:p};
  }
  @Get('products/:slug') async detail(@Param('slug') slug:string){
    const p=(await this.db.query(`${productQuery} WHERE p.slug=$1 AND p.active=true`,[slug])).rows[0];
    if(!p) throw new NotFoundException('Product not found');
    const vars=await this.db.query(`SELECT v.id,v.sku,v.width_mm,v.length_mm,v.height_mm,v.attributes,
      vp.amount_minor,vp.currency,
      COALESCE((SELECT SUM(GREATEST(0,s.on_hand-s.reserved)) FROM stock_balances s JOIN locations l ON l.id=s.location_id WHERE l.active AND s.variant_id=v.id),0)::int available
      FROM product_variants v LEFT JOIN LATERAL
      (SELECT amount_minor,currency FROM variant_prices WHERE variant_id=v.id AND effective_from<=now() AND (effective_until IS NULL OR effective_until>now()) ORDER BY effective_from DESC LIMIT 1) vp ON true
      WHERE v.product_id=$1 AND v.active ORDER BY v.width_mm,v.length_mm`,[p.id]);
    const media=(await this.db.query('SELECT id,r2_key,alt_text,variant_id,asset_id FROM product_media WHERE product_id=$1 AND deleted_at IS NULL ORDER BY sort_order,created_at,id',[p.id])).rows;
    return {...p,starting_price_minor:p.starting_price_minor===null?null:Number(p.starting_price_minor),variants:vars.rows.map(v=>({...v,amount_minor:v.amount_minor===null?null:Number(v.amount_minor)})),media:media.map(m=>({...m,url:m.asset_id?`/v1/media/${m.asset_id}`:process.env.R2_PUBLIC_URL?`${process.env.R2_PUBLIC_URL.replace(/\/$/,'')}/${m.r2_key}`:null}))};
  }
  @Get('variants/:id/availability') async availability(@Param('id') id:string){
    validate(uuid,id);
    const row=(await this.db.query('SELECT COALESCE(SUM(GREATEST(0,s.on_hand-s.reserved)),0)::int qty FROM stock_balances s JOIN locations l ON l.id=s.location_id WHERE s.variant_id=$1 AND l.active',[id])).rows[0];
    return {available:Number(row.qty)>0};
  }
}
@Controller('v1/admin') @UseGuards(SessionGuard)
export class CatalogAdminController {
  constructor(private db:Database,private auth:AuthService){}
  private admin(req:Request){this.auth.require((req as any).identity,['COMPANY_ADMIN']);}
  @Post('products') async create(@Req() req:Request,@Body() body:unknown){
    this.admin(req);const b=validate(createProduct,body);
    const row=(await this.db.query(`INSERT INTO products(category_id,name,slug,description,name_i18n,description_i18n,storefront_meta,featured) SELECT id,$2,$3,$4,$5,$6,$7,$8 FROM categories WHERE code=$1 AND active RETURNING *`,[b.categoryCode,b.name,b.slug,b.description,JSON.stringify(b.nameI18n??{}),JSON.stringify(b.descriptionI18n??{}),JSON.stringify(b.storefrontMeta??{}),b.featured??false])).rows[0];
    if(!row) throw new BadRequestException('Unknown category');return row;
  }
  @Patch('products/:id') async patch(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){
    this.admin(req);validate(uuid,id);
    const b=validate(createProduct.partial().extend({active:z.boolean().optional()}),body);
    const row=(await this.db.query(`UPDATE products SET name=COALESCE($2,name),slug=COALESCE($3,slug),description=COALESCE($4,description),active=COALESCE($5,active),name_i18n=COALESCE($6,name_i18n),description_i18n=COALESCE($7,description_i18n),storefront_meta=COALESCE($8,storefront_meta),featured=COALESCE($9,featured),updated_at=now() WHERE id=$1 RETURNING *`,[id,b.name??null,b.slug??null,b.description??null,b.active??null,b.nameI18n?JSON.stringify(b.nameI18n):null,b.descriptionI18n?JSON.stringify(b.descriptionI18n):null,b.storefrontMeta?JSON.stringify(b.storefrontMeta):null,b.featured??null])).rows[0];
    if(!row) throw new NotFoundException();return row;
  }
  @Post('products/:id/variants') async createVariant(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){
    this.admin(req);validate(uuid,id);const b=validate(createVariant,body);
    return this.db.tx(async c=>{
      const product=(await c.query('SELECT p.id,p.slug,c.code FROM products p JOIN categories c ON c.id=p.category_id WHERE p.id=$1 FOR UPDATE OF p',[id])).rows[0];
      if(!product) throw new NotFoundException('Product not found');
      if(['MATTRESS','TOPPER'].includes(product.code) && !b.heightMm) throw new BadRequestException('Mattress and topper thickness required');
      if(!b.sku){
        const duplicate=await c.query(`SELECT 1 FROM product_variants WHERE product_id=$1 AND active
          AND width_mm=$2 AND length_mm=$3 AND height_mm IS NOT DISTINCT FROM $4::int`,[id,b.widthMm,b.lengthMm,b.heightMm??null]);
        if(duplicate.rowCount)throw new ConflictException('A variant with these dimensions and thickness already exists');
      }
      const sku=b.sku??`${product.slug.slice(0,10).toUpperCase()}-${product.id.replace(/-/g,'').toUpperCase()}-${b.widthMm}X${b.lengthMm}${b.heightMm!=null?`X${b.heightMm}`:''}`;
      const v=(await c.query(`INSERT INTO product_variants(product_id,sku,width_mm,length_mm,height_mm,attributes)
        VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(sku) DO NOTHING RETURNING *`,
        [id,sku,b.widthMm,b.lengthMm,b.heightMm??null,JSON.stringify(b.attributes)])).rows[0];
      if(!v)throw new ConflictException('A variant with this product reference already exists');
      await c.query('INSERT INTO variant_prices(variant_id,amount_minor,currency) VALUES($1,$2,\'DZD\')',[v.id,b.priceMinor]);
      return v;
    });
  }
  @Post('variants/:id/prices') async setPrice(@Req() req:Request,@Param('id') id:string,@Body() body:unknown){
    this.admin(req);validate(uuid,id);const b=validate(z.object({amountMinor:priceMinor}),body);
    return this.db.tx(async c=>{
      const variant=(await c.query('SELECT id FROM product_variants WHERE id=$1 FOR UPDATE',[id])).rows[0];
      if(!variant) throw new NotFoundException();
      // Appending exactly one current price; record historical effective_until.
      await c.query('UPDATE variant_prices SET effective_until=now() WHERE variant_id=$1 AND effective_until IS NULL',[id]);
      const p=(await c.query('INSERT INTO variant_prices(variant_id,amount_minor,currency,effective_from) VALUES($1,$2,\'DZD\',now()) RETURNING *',[id,b.amountMinor])).rows[0];
      await c.query('INSERT INTO audit_logs(actor_id,action,subject_type,subject_id,metadata) VALUES($1,\'PRICE_CHANGED\',\'variant\',$2,$3)',[(req as any).identity.id,id,JSON.stringify({priceMinor:b.amountMinor})]);
      return p;
    });
  }
  @Post('media/presign') async presign(@Req() req:Request,@Body() body:unknown){
    this.admin(req);const b=validate(z.object({contentType:z.enum(['image/jpeg','image/png','image/webp']),productId:uuid}),body);
    if(!process.env.R2_ACCOUNT_ID||!process.env.R2_ACCESS_KEY_ID||!process.env.R2_SECRET_ACCESS_KEY) throw new ServiceUnavailableException('R2 is not configured');
    const exists=(await this.db.query('SELECT id FROM products WHERE id=$1',[b.productId])).rowCount;
    if(!exists) throw new NotFoundException();
    const extension=b.contentType==='image/jpeg'?'jpg':b.contentType==='image/png'?'png':'webp';
    const key=`products/${b.productId}/${randomUUID()}.${extension}`;
    const s3=new S3Client({region:'auto',endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,credentials:{accessKeyId:process.env.R2_ACCESS_KEY_ID,secretAccessKey:process.env.R2_SECRET_ACCESS_KEY}});
    const uploadUrl=await getSignedUrl(s3,new PutObjectCommand({Bucket:process.env.R2_BUCKET,Key:key,ContentType:b.contentType}),{expiresIn:300});
    return {key,uploadUrl,expiresIn:300};
  }
  @Post('media') async saveMedia(@Req() req:Request,@Body() body:unknown){
    this.admin(req);const b=validate(z.object({productId:uuid,variantId:uuid.nullable().optional(),key:z.string().max(500),altText:z.string().max(200).default('')}),body);
    if(!b.key.startsWith(`products/${b.productId}/`)||!/^products\/[0-9a-f-]+\/[0-9a-f-]+\.(jpg|png|webp)$/.test(b.key)) throw new BadRequestException('Unexpected R2 key');
    return this.db.tx(async c=>{
      const product=await c.query('SELECT id FROM products WHERE id=$1 FOR UPDATE',[b.productId]);
      if(!product.rowCount)throw new NotFoundException('Product not found');
      const {rows}=await c.query(`INSERT INTO product_media(product_id,variant_id,r2_key,alt_text,sort_order)
        VALUES($1,$2,$3,$4,COALESCE((SELECT MAX(sort_order)+1 FROM product_media WHERE product_id=$1 AND deleted_at IS NULL),0))
        RETURNING *`,[b.productId,b.variantId??null,b.key,b.altText]);
      return rows[0];
    });
  }
}
