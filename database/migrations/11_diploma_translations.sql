CREATE TABLE IF NOT EXISTS diploma_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diploma_id UUID NOT NULL REFERENCES diplomas(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  locale locale_type NOT NULL,
  UNIQUE (diploma_id, locale)
);

CREATE INDEX IF NOT EXISTS diploma_translations_diploma_id_idx ON diploma_translations (diploma_id);