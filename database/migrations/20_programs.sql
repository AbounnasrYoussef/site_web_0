CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  output_diploma_id UUID REFERENCES diplomas(id) ON DELETE CASCADE NULL,
  title VARCHAR(255) NOT NULL,
  years_of_study SMALLINT NOT NULL,
  monthly_subscription DECIMAL(10, 2) NULL CHECK (monthly_subscription >= 0),
  max_age SMALLINT NULL  CHECK (max_age > 0),
  has_concours BOOLEAN NOT NULL DEFAULT FALSE,
  diploma_recognition_abroad_status diploma_recognition_type NULL,
  diploma_recognition_morocco_status diploma_recognition_type NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
