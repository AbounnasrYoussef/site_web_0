CREATE TABLE IF NOT EXISTS favoris (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, university_id)
);

CREATE INDEX IF NOT EXISTS favoris_user_id_idx ON favoris (user_id);
CREATE INDEX IF NOT EXISTS favoris_university_id_idx ON favoris (university_id);
