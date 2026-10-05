CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name varchar NOT NULL,
  email varchar NOT NULL,
  message varchar NOT NULL,
  created_at timestamptz DEFAULT now()
);
