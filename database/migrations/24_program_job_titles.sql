CREATE TABLE IF NOT EXISTS program_job_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  job_title_id UUID REFERENCES job_titles(id) ON DELETE CASCADE NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS program_job_titles_program_id_job_title_id_uidx
  ON program_job_titles (program_id, job_title_id);
