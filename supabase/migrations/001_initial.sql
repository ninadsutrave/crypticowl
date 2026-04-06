-- ─────────────────────────────────────────────────────────────────────────────
-- CrypticOwl — Initial Schema
-- Run via: supabase db push  (or paste into Supabase SQL editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── puzzles ──────────────────────────────────────────────────────────────────
-- Publicly readable. Only admins / service role can insert new puzzles.

CREATE TABLE IF NOT EXISTS puzzles (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  number       integer     UNIQUE NOT NULL,
  date         date        UNIQUE NOT NULL,
  clue         text        NOT NULL,
  answer       text        NOT NULL,
  letter_count integer     NOT NULL,
  clue_type    text,                          -- 'Anagram', 'Container', etc.
  hints        jsonb       NOT NULL DEFAULT '[]',
  clue_parts   jsonb       NOT NULL DEFAULT '[]',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "puzzles_public_read"
  ON puzzles FOR SELECT
  USING (true);

CREATE POLICY "puzzles_service_write"
  ON puzzles FOR ALL
  USING (auth.role() = 'service_role');


-- ── user_stats ───────────────────────────────────────────────────────────────
-- One row per user. Stores aggregate streak / XP data.

CREATE TABLE IF NOT EXISTS user_stats (
  user_id      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_count integer     NOT NULL DEFAULT 0,
  last_solved  date,
  total_solved integer     NOT NULL DEFAULT 0,
  xp           integer     NOT NULL DEFAULT 0,
  level        integer     NOT NULL DEFAULT 1,
  best_streak  integer     NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_stats_owner"
  ON user_stats FOR ALL
  USING (auth.uid() = user_id);


-- ── solve_history ─────────────────────────────────────────────────────────────
-- One row per (user, puzzle). Unique constraint prevents double-counting.

CREATE TABLE IF NOT EXISTS solve_history (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_number  integer     NOT NULL,
  hints_used     integer     NOT NULL DEFAULT 0,
  xp_earned      integer     NOT NULL DEFAULT 0,
  solved_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT solve_history_unique_per_user UNIQUE (user_id, puzzle_number)
);

ALTER TABLE solve_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "solve_history_owner"
  ON solve_history FOR ALL
  USING (auth.uid() = user_id);

-- Index to make per-user history queries fast
CREATE INDEX IF NOT EXISTS solve_history_user_id_idx ON solve_history (user_id);


-- ── Seed: Puzzle #42 ──────────────────────────────────────────────────────────

INSERT INTO puzzles (number, date, clue, answer, letter_count, clue_type, hints, clue_parts)
VALUES (
  42,
  CURRENT_DATE,
  'Pears mixed up to form a weapon (5)',
  'SPEAR',
  5,
  'Anagram',
  '[
    {
      "id": 1,
      "title": "Definition Location",
      "text": "The definition is at the end of the clue.",
      "highlight": "a weapon",
      "mascotComment": "The definition is always at the start or end of a cryptic clue. Look at the end! 👀",
      "color": "#3B82F6",
      "bg": "#EFF6FF",
      "bgDark": "#0D1F35",
      "border": "#93C5FD"
    },
    {
      "id": 2,
      "title": "Spot the Indicator",
      "text": "\"Mixed up\" is an anagram indicator.",
      "highlight": "mixed up",
      "mascotComment": "\"Mixed up\" signals an anagram — letters are getting scrambled! 🔀",
      "color": "#7C3AED",
      "bg": "#F5F3FF",
      "bgDark": "#1A0F35",
      "border": "#C4B5FD"
    },
    {
      "id": 3,
      "title": "Find the Fodder",
      "text": "\"PEARS\" is the fodder — these are the letters you need to rearrange!",
      "highlight": "Pears",
      "mascotComment": "P-E-A-R-S... these are your building blocks! Try shuffling them around! ✨",
      "color": "#F97316",
      "bg": "#FFF7ED",
      "bgDark": "#2A1505",
      "border": "#FED7AA"
    },
    {
      "id": 4,
      "title": "Full Breakdown",
      "text": "Rearrange the letters of PEARS to get a 5-letter weapon.",
      "highlight": null,
      "mascotComment": "You''ve got all the pieces! P-E-A-R-S → _ _ _ _ _ 🎯",
      "color": "#059669",
      "bg": "#ECFDF5",
      "bgDark": "#062010",
      "border": "#6EE7B7"
    }
  ]',
  '[
    {"text": "Pears",      "type": "fodder"},
    {"text": " mixed up ", "type": "indicator"},
    {"text": "to form ",   "type": null},
    {"text": "a weapon",   "type": "definition"},
    {"text": " (5)",        "type": null}
  ]'
)
ON CONFLICT (number) DO NOTHING;
