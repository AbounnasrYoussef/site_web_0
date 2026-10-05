CREATE TABLE IF NOT EXISTS job_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary INTEGER NOT NULL CHECK (salary > 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
