CREATE TABLE IF NOT EXISTS university_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  address text,
  website text,
  longitude numeric(9,6),
  latitude numeric(9,6),
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS university_locations_university_id_idx ON university_locations (university_id);
CREATE INDEX IF NOT EXISTS university_locations_city_id_idx ON university_locations (city_id);
CREATE UNIQUE INDEX IF NOT EXISTS university_locations_university_id_city_id_uidx
  ON university_locations (university_id, city_id);
