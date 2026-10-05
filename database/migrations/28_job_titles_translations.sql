CREATE TABLE IF NOT EXISTS job_titles_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title_id UUID NOT NULL REFERENCES job_titles(id) ON DELETE CASCADE,
  locale locale_type NOT NULL,
  title TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS job_titles_translations_job_titles_id_locale_uidx
  ON job_titles_translations (job_title_id, locale);

CREATE UNIQUE INDEX IF NOT EXISTS job_titles_translations_title_locale_uidx
  ON job_titles_translations (locale, title);