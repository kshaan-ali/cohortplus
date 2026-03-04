-- Migration: Create chat_messages table for batch community chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_email TEXT,
  sender_role TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast batch message lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_batch_id ON chat_messages(batch_id, created_at DESC);

-- Enable Realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Enable RLS (backend uses service role so this is mainly for Realtime security)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read messages (Realtime needs this)
CREATE POLICY "Users can read chat messages" ON chat_messages
  FOR SELECT USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Users can insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (true);
