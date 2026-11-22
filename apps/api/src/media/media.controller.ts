import { productMediaUrl } from '../platform/product-media';
import { BadRequestException, Controller, Delete, Get, Param, Patch, Post, Body, Req, Res, UploadedFile, UseInterceptors, UseGuards, NotFoundException, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { createHash, randomUUID } from 'node:crypto';
import { Database } from '../db/database';
import { AuthService } from '../auth/auth.service';
import { SessionGuard } from '../auth/session.guard';
import { validate, uuid } from '../platform/utils';
import { z } from 'zod';
function detectedMime(bytes:Buffer):string | null {
  if(bytes.length>=3 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return 'image/jpeg';
  if(bytes.length>=8 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if(bytes.length>=12 && bytes.subarray(0,4).toString()==='RIFF' && bytes.subarray(8,12).toString()==='WEBP') return 'image/webp';
  return null;
}
@Controller('v1/media')
export class MediaController {
  constructor(private db:Database){}
  @Get(':id') async get(@Param('id') id:string,@Headers('if-none-match') clientETag:string|undefined,@Res() res:Response){
    validate(uuid,id);
    const row=(await this.db.query('SELECT bytes,mime_type,sha256 FROM media_assets WHERE id=$1',[id])).rows[0];
    if(!row) throw new NotFoundException('Image not found');
    const etag='"'+row.sha256+'"';
    res.setHeader('ETag',etag);res.setHeader('Cache-Control','public,max-age=31536000,immutable');
    res.setHeader('X-Content-Type-Options','nosniff');
    if(clientETag===etag) return res.status(304).end();
    return res.type(row.mime_type).send(row.bytes);
  }
}
@Controller('v1/admin/media') @UseGuards(SessionGuard)
export class MediaAdminController {
  constructor(private db:Database,private auth:AuthService){}
  @Get('products/:productId')
  async list(@Req() req:Request,@Param('productId') productId:string){
    this.auth.require((req as any).identity,['COMPANY_ADMIN']);
    validate(uuid,productId);
    const {rows}=await this.db.query(`SELECT id,asset_id,r2_key,alt_text FROM product_media
      WHERE product_id=$1 AND deleted_at IS NULL ORDER BY sort_order,created_at,id`,[productId]);
    return rows.map(row=>({id:row.id,url:productMediaUrl(row.asset_id,row.r2_key),altText:row.alt_text}));
  }

  @Patch('products/:productId/:id/primary')
  async setPrimary(@Req() req:Request,@Param('productId') productId:string,@Param('id') id:string){
    this.auth.require((req as any).identity,['COMPANY_ADMIN']);
    validate(uuid,productId);validate(uuid,id);
    return this.db.tx(async c=>{
      await c.query('SELECT id FROM products WHERE id=$1 FOR UPDATE',[productId]);
      const target=await c.query('SELECT asset_id,r2_key FROM product_media WHERE product_id=$1 AND id=$2 AND deleted_at IS NULL',[productId,id]);
      if(!target.rowCount)throw new NotFoundException('Product photo not found');
      if(!productMediaUrl(target.rows[0].asset_id,target.rows[0].r2_key))throw new BadRequestException('Replace this photo before making it primary');
      await c.query(`WITH gallery AS (
        SELECT id,(row_number() OVER (ORDER BY (id=$2) DESC,sort_order,created_at,id)-1)::int position
        FROM product_media WHERE product_id=$1 AND deleted_at IS NULL
      ) UPDATE product_media pm SET sort_order=gallery.position FROM gallery WHERE pm.id=gallery.id`,[productId,id]);
      return {id};
    });
  }

  @Delete('products/:productId/:id')
  async remove(@Req() req:Request,@Param('productId') productId:string,@Param('id') id:string){
    this.auth.require((req as any).identity,['COMPANY_ADMIN']);
    validate(uuid,productId);validate(uuid,id);
    return this.db.tx(async c=>{
      await c.query('SELECT id FROM products WHERE id=$1 FOR UPDATE',[productId]);
      const updated=await c.query('UPDATE product_media SET deleted_at=now() WHERE product_id=$1 AND id=$2 AND deleted_at IS NULL',[productId,id]);
      if(!updated.rowCount)throw new NotFoundException('Product photo not found');
      return {id};
    });
  }

  @Post('upload') @UseInterceptors(FileInterceptor('file',{limits:{fileSize:10*1024*1024,files:1}}))
  async upload(@Req() req:Request,@UploadedFile() file:any,@Body() body:any){
    this.auth.require((req as any).identity,['COMPANY_ADMIN']);
    const b=validate(z.object({productId:uuid,altText:z.string().max(200).default(''),variantId:uuid.optional(),replaceId:uuid.optional()}),body);
    if(!file?.buffer || !Buffer.isBuffer(file.buffer)) throw new BadRequestException('Image file required');
    const mime=detectedMime(file.buffer);
    if(!mime || file.size>10*1024*1024) throw new BadRequestException('JPEG, PNG or WebP under 10 MB required');
    const filename=String(file.originalname||'image').slice(0,160);
    const hash=createHash('sha256').update(file.buffer).digest('hex');
    return this.db.tx(async c=>{
      const p=await c.query('SELECT id FROM products WHERE id=$1 FOR UPDATE',[b.productId]);
      if(!p.rowCount) throw new NotFoundException('Product not found');
      if(b.variantId){const v=await c.query('SELECT id FROM product_variants WHERE id=$1 AND product_id=$2',[b.variantId,b.productId]);if(!v.rowCount) throw new BadRequestException('Variant does not belong to product');}
      const asset=(await c.query(`INSERT INTO media_assets(sha256,mime_type,filename,bytes,byte_length) VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(sha256) DO UPDATE SET sha256=EXCLUDED.sha256 RETURNING id`,[hash,mime,filename,file.buffer,file.buffer.length])).rows[0];
      const media=b.replaceId
        ? (await c.query(`UPDATE product_media SET asset_id=$3,alt_text=COALESCE(NULLIF($4,''),alt_text)
            WHERE product_id=$1 AND id=$2 AND deleted_at IS NULL RETURNING id`,
            [b.productId,b.replaceId,asset.id,b.altText])).rows[0]
        : (await c.query(`INSERT INTO product_media(product_id,variant_id,asset_id,r2_key,alt_text,sort_order)
            VALUES($1,$2,$3,$4,$5,COALESCE((SELECT MAX(sort_order)+1 FROM product_media WHERE product_id=$1 AND deleted_at IS NULL),0)) RETURNING id`,
            [b.productId,b.variantId??null,asset.id,'db://'+asset.id+'/'+randomUUID(),b.altText])).rows[0];
      if(!media)throw new NotFoundException('Product photo not found');
      return {id:media.id,assetId:asset.id,url:'/v1/media/'+asset.id};
    });
  }
}
