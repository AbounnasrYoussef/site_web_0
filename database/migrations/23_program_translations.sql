CREATE TABLE IF NOT EXISTS program_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  locale locale_type NOT NULL,
  name varchar NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS program_translations_program_id_locale_uidx
  ON program_translations (program_id, locale);
