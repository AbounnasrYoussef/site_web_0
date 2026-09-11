CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category notification_category NOT NULL,
  title varchar NOT NULL,
  message text,
  admin_message text,
  is_read boolean NOT NULL DEFAULT false,
  is_actioned boolean NOT NULL DEFAULT false,
  action_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_receiver_id_idx ON notifications (receiver_id);
CREATE INDEX IF NOT EXISTS notifications_receiver_id_is_read_idx ON notifications (receiver_id, is_read);
CREATE INDEX IF NOT EXISTS notifications_category_idx ON notifications (category);
CREATE INDEX IF NOT EXISTS notifications_created_at_desc_idx ON notifications (created_at DESC);