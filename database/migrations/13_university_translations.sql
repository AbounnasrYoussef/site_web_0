CREATE TABLE IF NOT EXISTS university_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  locale locale_type NOT NULL,
  name varchar NOT NULL,
  description text
);

CREATE UNIQUE INDEX IF NOT EXISTS university_translations_university_id_locale_uidx
  ON university_translations (university_id, locale);
