CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NULL,
  last_name VARCHAR(255) NULL,
  role user_type NOT NULL DEFAULT 'USER',
  email VARCHAR(255) NULL UNIQUE,
  year_of_birth SMALLINT NULL CHECK (year_of_birth >= 1900  AND year_of_birth <= EXTRACT(YEAR FROM CURRENT_DATE)),
  is_dropout BOOLEAN NOT NULL DEFAULT FALSE,
  profile_pic TEXT NULL,
  password_hash VARCHAR(255) NULL,
  auth_provider auth_provider_type NOT NULL DEFAULT 'LOCAL',
  google_id VARCHAR(255) NULL,
  is_2fa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  pending_2fa_code VARCHAR(255) NULL,
  pending_2fa_expires_at TIMESTAMPTZ NULL,
  pending_2fa_request_count SMALLINT NULL DEFAULT 0,
  pending_2fa_attempts SMALLINT NULL DEFAULT 0,
  pending_2fa_request_reset TIMESTAMPTZ NULL,
  toggle_2fa_attempts SMALLINT NULL DEFAULT 0,
  toggle_2fa_locked_until TIMESTAMPTZ NULL,
  must_change_password BOOLEAN NULL DEFAULT FALSE,
  failed_login_attempts SMALLINT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,
  change_password_attempts SMALLINT NOT NULL DEFAULT 0,
  change_password_locked_until TIMESTAMPTZ,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT users_auth_provider_check CHECK (
    (auth_provider = 'LOCAL' AND password_hash IS NOT NULL AND google_id IS NULL) OR 
    (auth_provider = 'GOOGLE' AND google_id IS NOT NULL AND password_hash IS NULL)
  ),
  CONSTRAINT users_admin_2fa_required CHECK (role NOT IN ('ADMIN', 'SUPERADMIN') OR is_2fa_enabled = true)

);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_uidx ON users (email) WHERE email IS NOT NULL;