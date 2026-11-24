CREATE TABLE social_profiles (
  platform TEXT PRIMARY KEY,
  handle TEXT NOT NULL,
  href TEXT NOT NULL,
  visible INTEGER NOT NULL CHECK (visible IN (0, 1))
);
