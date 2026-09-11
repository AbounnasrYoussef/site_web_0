CREATE TABLE IF NOT EXISTS field_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  locale locale_type NOT NULL,
  name VARCHAR NOT NULL,
  UNIQUE (field_id, locale),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS field_translations_field_id_idx ON field_translations (field_id);