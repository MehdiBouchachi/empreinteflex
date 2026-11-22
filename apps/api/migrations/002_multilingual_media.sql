-- Store product imagery as PostgreSQL bytea for this low-volume MVP.
-- Decorative assets stay in Next.js /public. For growth, migrate binary blobs to R2 using asset IDs.
CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sha256 text NOT NULL UNIQUE,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
  filename text NOT NULL,
  bytes bytea NOT NULL,
  byte_length integer NOT NULL CHECK (byte_length > 0 AND byte_length <= 10485760),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE products ADD COLUMN name_i18n jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN description_i18n jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN storefront_meta jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN featured boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN discount_percent numeric(5,2) NOT NULL DEFAULT 0 CHECK(discount_percent >= 0 AND discount_percent < 100);
ALTER TABLE product_media ADD COLUMN asset_id uuid REFERENCES media_assets(id);
CREATE INDEX ix_product_media_assets ON product_media(asset_id);
