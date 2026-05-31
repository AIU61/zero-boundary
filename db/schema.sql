create table users (
  id text primary key,
  did_hash text not null unique,
  display_name text not null,
  level text not null,
  energy integer not null default 0 check (energy >= 0),
  contribution integer not null default 0 check (contribution >= 0),
  credit integer not null default 80 check (credit between 0 and 100),
  created_at timestamptz not null default now()
);

create table merchants (
  id text primary key,
  name text not null,
  scene text not null,
  address text not null,
  distance_meters integer not null default 0,
  rating numeric(2, 1) not null default 4.5,
  compliance_status text not null check (compliance_status in ('approved', 'pending', 'suspended')),
  created_at timestamptz not null default now()
);

create table tasks (
  id text primary key,
  title text not null,
  subtitle text not null,
  story text not null,
  reward_energy integer not null check (reward_energy >= 0),
  route_name text not null,
  required_merchant_id text not null references merchants(id),
  expires_at timestamptz not null,
  status text not null check (status in ('available', 'claimed', 'completed', 'expired')),
  claimed_by text references users(id),
  claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table task_stops (
  id bigserial primary key,
  task_id text not null references tasks(id) on delete cascade,
  merchant_id text not null references merchants(id),
  title text not null,
  action text not null,
  sort_order integer not null
);

create table checkins (
  id text primary key,
  user_id text not null references users(id),
  task_id text not null references tasks(id),
  merchant_id text not null references merchants(id),
  qr_payload text not null,
  device_id text not null,
  status text not null check (status in ('pending', 'verified', 'rejected')),
  reason text,
  chain_business_id text,
  created_at timestamptz not null default now()
);

create unique index checkins_one_verified_per_user_task
  on checkins(user_id, task_id)
  where status = 'verified';

create table benefits (
  id text primary key,
  user_id text not null references users(id),
  task_id text references tasks(id),
  title text not null,
  description text not null,
  type text not null check (type in ('ticket', 'hidden_menu', 'coupon', 'priority')),
  transferable boolean not null default false,
  cashable boolean not null default false,
  expires_at timestamptz not null,
  status text not null check (status in ('available', 'used', 'expired')),
  chain_business_id text,
  created_at timestamptz not null default now(),
  check (transferable = false),
  check (cashable = false)
);

create table consents (
  id text primary key,
  user_id text not null references users(id),
  merchant_id text not null references merchants(id),
  purpose text not null,
  reward_description text not null,
  expires_at timestamptz not null,
  status text not null check (status in ('active', 'revoked', 'expired')),
  chain_business_id text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table chain_receipts (
  business_id text primary key,
  registry text not null check (registry in ('TaskReceiptRegistry', 'ConsentRegistry', 'BenefitCredentialRegistry')),
  payload_hash text not null,
  status text not null check (status in ('pending', 'confirmed', 'failed')),
  tx_id text,
  error_reason text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table chain_outbox (
  id bigserial primary key,
  business_id text not null unique,
  registry text not null,
  payload_json jsonb not null,
  attempt_count integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  created_at timestamptz not null default now()
);
