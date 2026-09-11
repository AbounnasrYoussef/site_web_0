CREATE TABLE IF NOT EXISTS program_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  required_diploma_id UUID REFERENCES diplomas(id) ON DELETE CASCADE NULL,
  min_grade DECIMAL(4, 2) NULL CHECK (min_grade >= 0 AND min_grade <= 20),
  max_years_since_graduation SMALLINT NULL,
  requirement_group SMALLINT NOT NULL DEFAULT 1,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS program_requirements_program_id_required_diploma_id_uidx
  ON program_requirements (program_id, required_diploma_id);
