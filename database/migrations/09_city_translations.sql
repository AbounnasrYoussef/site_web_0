CREATE TABLE IF NOT EXISTS city_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  locale locale_type NOT NULL,
  name varchar NOT NULL,
  region varchar
);

CREATE UNIQUE INDEX IF NOT EXISTS city_translations_city_id_locale_uidx
  ON city_translations (city_id, locale);
