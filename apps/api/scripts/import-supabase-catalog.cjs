const { readFileSync } = require('node:fs');
const { basename } = require('node:path');
const { createHash } = require('node:crypto');
const { Pool } = require('pg');

function imageType(bytes) {
  if (bytes.subarray(0, 3).toString('hex') === 'ffd8ff') return 'image/jpeg';
  if (bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return 'image/png';
  throw new Error('Expected a JPEG or PNG catalog photo');
}

async function importCatalog(db, products) {
  const result = { products: 0, variants: 0, addedVariants: 0, pricesChanged: 0, photos: 0, archivedDemoVariants: 0, reservedDemoVariants: 0 };
  for (const product of products) {
    const saved = await db.query(`INSERT INTO products
      (category_id,slug,name,description,name_i18n,description_i18n,storefront_meta,featured,discount_percent)
      SELECT id,$2,$3,$4,$5,$6,$7,$8,$9 FROM categories WHERE code=$1
      ON CONFLICT(slug) DO UPDATE SET category_id=EXCLUDED.category_id,name=EXCLUDED.name,
        description=EXCLUDED.description,name_i18n=EXCLUDED.name_i18n,description_i18n=EXCLUDED.description_i18n,
        storefront_meta=products.storefront_meta||EXCLUDED.storefront_meta,featured=EXCLUDED.featured,
        discount_percent=EXCLUDED.discount_percent,updated_at=now()
      RETURNING id`, [product.categoryCode, product.slug, product.name.fr, product.description.fr,
      product.name, product.description, product.metadata, product.featured, product.discountPercent]);
    if (!saved.rowCount) throw new Error(`Unknown category for ${product.slug}`);
    const productId = saved.rows[0].id;
    result.products++;
    const existing = (await db.query('SELECT * FROM product_variants WHERE product_id=$1 FOR UPDATE',[productId])).rows;
    const mappedIds = [];
    for (const variant of product.variants) {
      const { widthMm, lengthMm, heightMm, legacyId, amountMinor } = variant;
      const sameSize = existing.filter(row => row.width_mm===widthMm && row.length_mm===lengthMm && row.height_mm===heightMm);
      const previous = existing.find(row => row.attributes.legacySupabaseId===legacyId) ||
        (sameSize.length===1 ? sameSize[0] : null);
      if (!previous && sameSize.length>1) throw new Error(`Ambiguous existing variant for ${product.slug} / ${legacyId}`);
      const attributes = { legacySupabaseId: legacyId };
      let variantId;
      if (previous) {
        variantId = previous.id;
        await db.query(`UPDATE product_variants SET width_mm=$2,length_mm=$3,height_mm=$4,
          attributes=attributes||$5::jsonb WHERE id=$1`,[variantId,widthMm,lengthMm,heightMm,attributes]);
      } else {
        const sku = `SB-${product.slug.toUpperCase()}-${legacyId}`;
        variantId = (await db.query(`INSERT INTO product_variants(product_id,sku,width_mm,length_mm,height_mm,attributes)
          VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,[productId,sku,widthMm,lengthMm,heightMm,attributes])).rows[0].id;
        result.addedVariants++;
      }
      mappedIds.push(variantId);
      const price = (await db.query(`SELECT id,amount_minor FROM variant_prices
        WHERE variant_id=$1 AND currency='DZD' AND effective_until IS NULL FOR UPDATE`,[variantId])).rows[0];
      if (!price || Number(price.amount_minor)!==amountMinor) {
        if (price) await db.query('UPDATE variant_prices SET effective_until=now() WHERE id=$1',[price.id]);
        await db.query('INSERT INTO variant_prices(variant_id,amount_minor) VALUES($1,$2)',[variantId,amountMinor]);
        result.pricesChanged++;
      }
      result.variants++;
    }
    // Demo variants retain their identifiers, stock movements, and order references.
    const demoPrefix = product.slug.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,14);
    const demoSkus = [[900,1900,220],[1400,1900,220],[1600,2000,220]].map(size=>`${demoPrefix}-${size.join('-')}`);
    const demoPredicate = `v.product_id=$1 AND v.active AND v.sku=ANY($2::text[])
      AND NOT(v.id=ANY($3::uuid[]))
      AND EXISTS(SELECT 1 FROM stock_movements m WHERE m.variant_id=v.id AND m.event_type='SEED_STOCK')`;
    const archived = await db.query(`UPDATE product_variants v SET active=false WHERE ${demoPredicate}
      AND NOT EXISTS(SELECT 1 FROM stock_balances s WHERE s.variant_id=v.id AND s.reserved>0)`,[productId,demoSkus,mappedIds]);
    result.archivedDemoVariants += archived.rowCount;
    result.reservedDemoVariants += Number((await db.query(`SELECT count(*) count FROM product_variants v WHERE ${demoPredicate}`,[productId,demoSkus,mappedIds])).rows[0].count);

    for (const [sort,photo] of product.photos.entries()) {
      const bytes=Buffer.from(photo.bytes,'base64');
      const sha=createHash('sha256').update(bytes).digest('hex');
      const asset=(await db.query(`INSERT INTO media_assets(sha256,mime_type,filename,bytes,byte_length)
        VALUES($1,$2,$3,$4,$5) ON CONFLICT(sha256) DO UPDATE SET sha256=EXCLUDED.sha256 RETURNING id`,
        [sha,imageType(bytes),basename(photo.path),bytes,bytes.length])).rows[0];
      await db.query(`INSERT INTO product_media(product_id,asset_id,r2_key,alt_text,sort_order)
        VALUES($1,$2,$3,$4,$5) ON CONFLICT(r2_key) DO NOTHING`,
        [productId,asset.id,`legacy-supabase/${product.legacyId}/${photo.legacyId}`,product.name.fr,sort-100]);
      result.photos++;
    }
  }
  return result;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const products=JSON.parse(readFileSync(0,'utf8'));
  const pool=new Pool({connectionString:process.env.DATABASE_URL});
  try {
    const connection=await pool.connect();
    try {
      await connection.query('BEGIN');
      await connection.query("SELECT pg_advisory_xact_lock(hashtext('supabase-catalog-import'))");
      const result=await importCatalog(connection,products);
      const dryRun=process.env.CATALOG_IMPORT_DRY_RUN==='true';
      await connection.query(dryRun?'ROLLBACK':'COMMIT');
      console.log(JSON.stringify({dryRun,...result}));
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch(error=>{ console.error(error.message); process.exitCode=1; });
