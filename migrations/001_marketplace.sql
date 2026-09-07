CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '' CHECK (length(name) <= 40),
  emoji text NOT NULL DEFAULT '🍏',
  bio text NOT NULL DEFAULT '' CHECK (length(bio) <= 220),
  city text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  email text,
  email_verified boolean NOT NULL DEFAULT false,
  email_suppressed boolean NOT NULL DEFAULT false,
  email_notifications boolean NOT NULL DEFAULT false,
  push_notifications boolean NOT NULL DEFAULT true,
  onboarding_completed boolean NOT NULL DEFAULT false,
  banned_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE auth_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  provider text NOT NULL CHECK (provider = 'apple'),
  subject text NOT NULL,
  refresh_token_encrypted text,
  refresh_client_id text,
  UNIQUE(provider, subject)
);
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  token_hash text NOT NULL UNIQUE,
  refresh_hash text UNIQUE,
  family_id uuid NOT NULL DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('web','ios')),
  expires_at timestamptz NOT NULL,
  refresh_expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE TABLE auth_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
CREATE SEQUENCE listing_number_seq START 3504000000;
CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number bigint NOT NULL UNIQUE DEFAULT nextval('listing_number_seq'),
  seller_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  category_id text NOT NULL CHECK (category_id IN ('mac','ipad','iphone')),
  model_id text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents > 0 AND price_cents <= 100000000),
  currency text NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  specs jsonb NOT NULL DEFAULT '{}',
  private_specs jsonb NOT NULL DEFAULT '{}',
  city text NOT NULL,
  postal_code text NOT NULL,
  status text NOT NULL DEFAULT 'public' CHECK (status IN ('public','reserved','inactive','sold','deleted')),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sold_at timestamptz
);
CREATE INDEX listings_search ON listings(status, category_id, created_at DESC, id);
CREATE INDEX listings_seller ON listings(seller_id, created_at DESC);
CREATE TABLE favorites (
  user_id uuid NOT NULL REFERENCES users(id), listing_id uuid NOT NULL REFERENCES listings(id),
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id, listing_id)
);
CREATE TABLE listing_notes (
  user_id uuid NOT NULL REFERENCES users(id), listing_id uuid NOT NULL REFERENCES listings(id),
  note text NOT NULL CHECK (length(note) <= 200), PRIMARY KEY(user_id, listing_id)
);
CREATE TABLE user_blocks (
  blocker_id uuid NOT NULL REFERENCES users(id), blocked_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(blocker_id, blocked_id), CHECK(blocker_id <> blocked_id)
);
CREATE INDEX blocks_reverse ON user_blocks(blocked_id, blocker_id);
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), listing_id uuid NOT NULL REFERENCES listings(id),
  buyer_id uuid NOT NULL REFERENCES users(id), seller_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id, buyer_id), CHECK(buyer_id <> seller_id)
);
CREATE TABLE conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id), user_id uuid NOT NULL REFERENCES users(id),
  archived boolean NOT NULL DEFAULT false, muted boolean NOT NULL DEFAULT false,
  read_sequence bigint NOT NULL DEFAULT 0, active_until timestamptz,
  PRIMARY KEY(conversation_id,user_id)
);
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  conversation_id uuid NOT NULL REFERENCES conversations(id), sender_id uuid NOT NULL REFERENCES users(id),
  kind text NOT NULL CHECK (kind IN ('text','offer','accept','decline')),
  text text NOT NULL DEFAULT '' CHECK (length(text) <= 4000), price_cents integer CHECK (price_cents > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation ON messages(conversation_id, sequence);
CREATE TABLE offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id uuid NOT NULL REFERENCES conversations(id),
  listing_id uuid NOT NULL REFERENCES listings(id), sender_id uuid NOT NULL REFERENCES users(id),
  price_cents integer NOT NULL CHECK (price_cents > 0 AND price_cents <= 100000000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz
);
CREATE UNIQUE INDEX offers_single_sale ON offers(listing_id) WHERE status = 'accepted';
CREATE TABLE device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
  session_id uuid NOT NULL REFERENCES sessions(id), token text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox','production')),
  enabled boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(token,environment)
);
CREATE TABLE notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), message_id uuid NOT NULL REFERENCES messages(id),
  recipient_id uuid NOT NULL REFERENCES users(id), channel text NOT NULL CHECK (channel IN ('email','push')),
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','processing','sent','cancelled','failed','uncertain')),
  due_at timestamptz NOT NULL, attempts integer NOT NULL DEFAULT 0, locked_until timestamptz,
  provider_id text, last_error_code text, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id,recipient_id,channel)
);
CREATE INDEX outbox_due ON notification_outbox(due_at) WHERE state IN ('pending','processing');
CREATE TABLE notification_deliveries (
  outbox_id uuid NOT NULL REFERENCES notification_outbox(id), device_id uuid NOT NULL REFERENCES device_tokens(id),
  state text NOT NULL CHECK(state IN ('sent','failed','uncertain')), PRIMARY KEY(outbox_id,device_id)
);
CREATE TABLE provider_events (
  provider text NOT NULL, event_id text NOT NULL, received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(provider,event_id)
);
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
  filename text NOT NULL UNIQUE, mime_type text NOT NULL, size_bytes integer NOT NULL CHECK(size_bytes > 0),
  created_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
ALTER TABLE users ADD COLUMN cover_media_id uuid REFERENCES media(id);
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL REFERENCES users(id),
  listing_id uuid REFERENCES listings(id), reported_user_id uuid REFERENCES users(id),
  reason text NOT NULL CHECK(length(reason) BETWEEN 1 AND 2000),
  status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewed','resolved')),
  created_at timestamptz NOT NULL DEFAULT now(), CHECK(listing_id IS NOT NULL OR reported_user_id IS NOT NULL)
);
CREATE TABLE admin_users (user_id uuid PRIMARY KEY REFERENCES users(id));
CREATE TABLE moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), admin_id uuid NOT NULL REFERENCES users(id),
  target_user_id uuid REFERENCES users(id), report_id uuid REFERENCES reports(id),
  action text NOT NULL CHECK(action IN ('ban','unban','resolve')), reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), offer_id uuid NOT NULL REFERENCES offers(id),
  author_id uuid NOT NULL REFERENCES users(id), recipient_id uuid NOT NULL REFERENCES users(id),
  score integer NOT NULL CHECK(score BETWEEN 1 AND 5), comment text NOT NULL DEFAULT '' CHECK(length(comment) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(offer_id,author_id), CHECK(author_id <> recipient_id)
);
CREATE TABLE idempotency_keys (
  user_id uuid NOT NULL REFERENCES users(id), scope text NOT NULL, key text NOT NULL CHECK(length(key) BETWEEN 8 AND 128),
  request_hash text NOT NULL, response jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id,scope,key)
);
CREATE TABLE rate_limits (
  key text NOT NULL, window_start timestamptz NOT NULL, count integer NOT NULL,
  PRIMARY KEY(key,window_start)
);

CREATE TABLE apple_revocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_encrypted text NOT NULL, client_id text NOT NULL,
  attempts integer NOT NULL DEFAULT 0, due_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz, last_error_code text
);
