CREATE TABLE IF NOT EXISTS diploma_fields (
  diploma_id UUID NOT NULL REFERENCES diplomas(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  PRIMARY KEY (diploma_id, field_id)
);

CREATE INDEX IF NOT EXISTS diploma_fields_field_id_idx ON diploma_fields (field_id);