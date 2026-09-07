-- Keep the position cursor separately from per-message visibility. Scrolling to
-- a newer message must not mark an unseen earlier message as read for delivery.
CREATE TABLE message_reads (
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(message_id,user_id)
);
CREATE INDEX message_reads_user ON message_reads(user_id);
