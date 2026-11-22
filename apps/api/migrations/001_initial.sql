-- Empreinte Flex 2.0: retail-only MVP. Requires PostgreSQL 16+.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE,
  password_hash text NOT NULL, display_name text NOT NULL, active boolean NOT NULL DEFAULT true,
  email_verified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_normalized CHECK (email = lower(trim(email)))
);
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE,
  name text NOT NULL, kind text NOT NULL CHECK (kind IN ('SHOWROOM','WAREHOUSE')),
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE user_role_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('CUSTOMER','SELLER','LOCATION_MANAGER','COMPANY_ADMIN','TECHNICAL_OPERATOR')),
  location_id uuid REFERENCES locations(id), granted_by uuid REFERENCES users(id),
  revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT grant_scope CHECK (
    (role IN ('SELLER','LOCATION_MANAGER') AND location_id IS NOT NULL) OR
    (role IN ('CUSTOMER','COMPANY_ADMIN','TECHNICAL_OPERATOR') AND location_id IS NULL)
  )
);
CREATE UNIQUE INDEX uq_active_grant ON user_role_grants(user_id, role, COALESCE(location_id, '00000000-0000-0000-0000-000000000000'::uuid)) WHERE revoked_at IS NULL;
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_sessions_user ON sessions(user_id);
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE,
  name text NOT NULL, active boolean NOT NULL DEFAULT true
);
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category_id uuid NOT NULL REFERENCES categories(id),
  slug text NOT NULL UNIQUE, name text NOT NULL, description text NOT NULL DEFAULT '', active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES products(id),
  sku text NOT NULL UNIQUE, width_mm integer NOT NULL CHECK (width_mm > 0),
  length_mm integer NOT NULL CHECK (length_mm > 0), height_mm integer CHECK (height_mm IS NULL OR height_mm > 0),
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_variants_product ON product_variants(product_id);
CREATE TABLE variant_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), variant_id uuid NOT NULL REFERENCES product_variants(id),
  amount_minor bigint NOT NULL CHECK (amount_minor >= 0), currency char(3) NOT NULL DEFAULT 'DZD',
  effective_from timestamptz NOT NULL DEFAULT now(), effective_until timestamptz,
  CHECK (effective_until IS NULL OR effective_until > effective_from)
);
CREATE UNIQUE INDEX uq_current_variant_price ON variant_prices(variant_id,currency) WHERE effective_until IS NULL;
CREATE INDEX ix_variant_price_history ON variant_prices(variant_id, effective_from DESC);
CREATE TABLE product_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id), r2_key text NOT NULL UNIQUE, alt_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE stock_balances (
  location_id uuid NOT NULL REFERENCES locations(id), variant_id uuid NOT NULL REFERENCES product_variants(id),
  on_hand integer NOT NULL DEFAULT 0, reserved integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(location_id,variant_id),
  CHECK (on_hand >= 0), CHECK (reserved >= 0), CHECK (reserved <= on_hand)
);
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid UNIQUE REFERENCES users(id),
  full_name text NOT NULL, email text, phone text, created_by uuid REFERENCES users(id), created_location_id uuid REFERENCES locations(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE order_channels (code text PRIMARY KEY, name text NOT NULL);
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_number text NOT NULL UNIQUE,
  channel_code text NOT NULL REFERENCES order_channels(code),
  status text NOT NULL CHECK (status IN ('PENDING','CONFIRMED','FULFILLED','CANCELLED','EXPIRED','RETURNED')),
  payment_status text NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID','PARTIAL','PAID','REFUNDED')),
  customer_id uuid REFERENCES customers(id), created_by uuid REFERENCES users(id),
  sales_location_id uuid REFERENCES locations(id), customer_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  shipping_snapshot jsonb, currency char(3) NOT NULL DEFAULT 'DZD', total_minor bigint NOT NULL CHECK(total_minor >= 0),
  tracking_token_hash text UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_orders_created ON orders(created_at DESC);
CREATE INDEX ix_orders_customer ON orders(customer_id,created_at DESC);
CREATE INDEX ix_orders_location ON orders(sales_location_id,created_at DESC);
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id),
  variant_id uuid REFERENCES product_variants(id), sku_snapshot text NOT NULL, name_snapshot text NOT NULL,
  configuration_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, qty integer NOT NULL CHECK(qty > 0),
  unit_price_minor bigint NOT NULL CHECK(unit_price_minor >= 0), discount_minor bigint NOT NULL DEFAULT 0 CHECK(discount_minor >= 0),
  tax_minor bigint NOT NULL DEFAULT 0 CHECK(tax_minor >= 0),
  line_total_minor bigint NOT NULL CHECK(line_total_minor >= 0)
);
CREATE INDEX ix_order_items_order ON order_items(order_id);
CREATE TABLE stock_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_item_id uuid NOT NULL REFERENCES order_items(id),
  location_id uuid NOT NULL REFERENCES locations(id), variant_id uuid NOT NULL REFERENCES product_variants(id),
  quantity integer NOT NULL CHECK(quantity > 0),
  state text NOT NULL CHECK(state IN ('ACTIVE','RELEASED','CONSUMED')),
  expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_reservations_expiry ON stock_reservations(expires_at) WHERE state='ACTIVE';
CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), location_id uuid NOT NULL REFERENCES locations(id),
  variant_id uuid NOT NULL REFERENCES product_variants(id), event_type text NOT NULL, event_id uuid NOT NULL,
  event_line integer NOT NULL DEFAULT 0, delta_on_hand integer NOT NULL DEFAULT 0,
  delta_reserved integer NOT NULL DEFAULT 0, actor_id uuid REFERENCES users(id), reason text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_type,event_id,event_line), CHECK(delta_on_hand <> 0 OR delta_reserved <> 0)
);
CREATE INDEX ix_movements_stock ON stock_movements(location_id,variant_id,occurred_at DESC);
CREATE TABLE fulfillments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id),
  source_location_id uuid NOT NULL REFERENCES locations(id), status text NOT NULL,
  method text NOT NULL CHECK(method IN ('PICKUP','DELIVERY')),
  delivery_reference text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE fulfillment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), fulfillment_id uuid NOT NULL REFERENCES fulfillments(id),
  order_item_id uuid NOT NULL REFERENCES order_items(id), quantity integer NOT NULL CHECK(quantity > 0)
);
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id),
  method text NOT NULL, provider text, provider_reference text UNIQUE,
  state text NOT NULL CHECK(state IN ('PENDING','CONFIRMED','FAILED','REFUNDED')),
  amount_minor bigint NOT NULL CHECK(amount_minor >= 0), currency char(3) NOT NULL DEFAULT 'DZD',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id),
  amount_minor bigint NOT NULL CHECK(amount_minor>0), currency char(3) NOT NULL DEFAULT 'DZD',
  method text NOT NULL CHECK(method IN ('CASH')),
  reason text NOT NULL, processed_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_refunds_order ON refunds(order_id);

CREATE TABLE idempotency_records (
  scope text NOT NULL, idempotency_key text NOT NULL, request_hash text NOT NULL,
  response jsonb, state text NOT NULL DEFAULT 'PROCESSING', created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(scope,idempotency_key)
);
CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_type text NOT NULL, aggregate_id uuid NOT NULL,
  payload jsonb NOT NULL, state text NOT NULL DEFAULT 'PENDING', attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(), locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_outbox_queue ON outbox_events(state,next_attempt_at);
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid REFERENCES users(id), location_id uuid REFERENCES locations(id),
  action text NOT NULL, subject_type text NOT NULL, subject_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_audit_created ON audit_logs(created_at DESC);
