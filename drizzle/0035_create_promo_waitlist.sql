CREATE TABLE IF NOT EXISTS promo_waitlist (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  audience VARCHAR(50) NOT NULL DEFAULT 'client',
  location VARCHAR(255) NOT NULL DEFAULT 'Cyberjaya',
  categories TEXT NOT NULL DEFAULT '[]', -- JSON string of array of strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_promo_waitlist_email ON promo_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_promo_waitlist_created_at ON promo_waitlist(created_at);