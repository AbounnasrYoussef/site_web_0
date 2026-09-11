CREATE TABLE IF NOT EXISTS user_diploma_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_diploma_id UUID NOT NULL REFERENCES user_diplomas(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE RESTRICT,
  value NUMERIC(4, 2) CHECK (value >= 0 AND value <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_diploma_id, field_id)
);

CREATE INDEX IF NOT EXISTS user_diploma_fields_user_diploma_id_idx ON user_diploma_fields (user_diploma_id);
CREATE INDEX IF NOT EXISTS user_diploma_fields_field_id_idx ON user_diploma_fields (field_id);