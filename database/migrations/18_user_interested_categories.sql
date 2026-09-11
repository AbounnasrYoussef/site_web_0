CREATE TABLE IF NOT EXISTS user_interested_categories (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

  PRIMARY KEY (user_id, category_id)
);
