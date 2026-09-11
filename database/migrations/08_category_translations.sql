CREATE TABLE IF NOT EXISTS category_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale locale_type NOT NULL,
  name varchar(255) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS category_translations_category_id_locale_uidx
  ON category_translations (category_id, locale);
