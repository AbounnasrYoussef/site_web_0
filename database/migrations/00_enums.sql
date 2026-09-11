-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE university_type AS ENUM ('PUBLIC', 'SEMI_PUBLIC', 'PRIVATE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE diploma_recognition_type AS ENUM ('RECOGNIZED', 'EVALUATION_REQUIRED', 'NOT_RECOGNIZED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('SUPERADMIN', 'ADMIN', 'USER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


DO $$ BEGIN
  CREATE TYPE auth_provider_type AS ENUM ('LOCAL', 'GOOGLE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE locale_type AS ENUM ('EN', 'FR', 'AR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_category AS ENUM (
    'USER_ADD_UNIVERSITY',
    'USER_ADD_PROGRAM',
    'USER_REPORT_ISSUE',
    'ADMIN_APPROVE_UNIVERSITY',
    'ADMIN_DECLINE_UNIVERSITY',
    'ADMIN_APPROVE_PROGRAM',
    'ADMIN_DECLINE_PROGRAM'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;