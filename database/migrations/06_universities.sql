CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type university_type NOT NULL,
  -- logo_url text,
  is_approved boolean NOT NULL DEFAULT false,
  internat_available boolean NOT NULL DEFAULT false,
  bourse_available boolean NOT NULL DEFAULT false,
  abreviation text unique,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS universities_type_idx ON universities (type);
CREATE INDEX IF NOT EXISTS universities_is_approved_idx ON universities (is_approved);