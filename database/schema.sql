-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public messages table
CREATE TABLE public_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Private messages table
CREATE TABLE private_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for public messages
CREATE POLICY "Public messages are viewable by everyone" ON public_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert public messages" ON public_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for private messages
CREATE POLICY "Users can view their own private messages" ON private_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send private messages" ON private_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX idx_public_messages_created_at ON public_messages(created_at DESC);
CREATE INDEX idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX idx_private_messages_receiver ON private_messages(receiver_id);
CREATE INDEX idx_private_messages_created_at ON private_messages(created_at DESC);
