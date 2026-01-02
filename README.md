# Real-Time Chat Application

A modern chat application with public and private messaging features built with React and Supabase.

## Features

- **Public Chat**: Send messages visible to all users
- **Private Chat**: One-on-one messaging with specific users
- **Real-time Updates**: Messages appear instantly using Supabase real-time subscriptions
- **User Authentication**: Secure login and registration
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React.js
- Supabase (Database & Real-time)
- Tailwind CSS
- React Router

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/richu337/realtime-chat-app.git
cd realtime-chat-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 4. Configure environment variables

Create a `.env` file in the root directory:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set up database tables

Run these SQL commands in your Supabase SQL Editor:

```sql
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
```

### 6. Run the application
```bash
npm start
```

The app will open at `http://localhost:3000`

## Usage

1. **Sign Up/Login**: Create an account or login
2. **Select Chat Type**: Choose between Public or Private chat from the sidebar
3. **Public Chat**: Send messages that everyone can see
4. **Private Chat**: Select a user and start a private conversation

## Project Structure

```
realtime-chat-app/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth.js
│   │   ├── Sidebar.js
│   │   ├── PublicChat.js
│   │   ├── PrivateChat.js
│   │   └── UserList.js
│   ├── config/
│   │   └── supabase.js
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## License

MIT License
