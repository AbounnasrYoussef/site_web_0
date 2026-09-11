CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id varchar NOT NULL,
  device_name varchar,
  device_identifier_hash TEXT UNIQUE,
  user_agent text,
  ip_address inet,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  is_trusted boolean NOT NULL DEFAULT false,
  trusted_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id_hash
  ON user_devices (user_id, device_identifier_hash);

-- user lookup
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id
  ON user_devices (user_id);

-- Last used cleanup
CREATE INDEX IF NOT EXISTS idx_user_devices_last_used_at
  ON user_devices (last_used_at);