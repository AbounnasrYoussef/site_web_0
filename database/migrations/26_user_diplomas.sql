CREATE TABLE IF NOT EXISTS user_diplomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  diploma_id UUID NOT NULL REFERENCES diplomas(id) ON DELETE CASCADE,
  general_grade DECIMAL(4, 2) NULL CHECK (general_grade >= 0 AND general_grade <= 20),
  obtained_year SMALLINT CHECK (obtained_year >= 1950 AND obtained_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);