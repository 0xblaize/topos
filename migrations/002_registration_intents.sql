CREATE TABLE IF NOT EXISTS registration_intents (
  username text PRIMARY KEY,
  user_handle text NOT NULL,
  challenge text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS registration_intents_expires_idx ON registration_intents(expires_at);
