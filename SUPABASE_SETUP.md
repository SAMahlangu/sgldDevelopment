# Supabase Integration Setup Guide

## Prerequisites
- Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Go to Project Settings → API
3. Copy your `Project URL` and `Anon Key`

## Step 3: Set Environment Variables

Create a `.env.local` file in your project root:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Step 4: Create Database Tables

Run these SQL queries in Supabase SQL Editor:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_approval',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### News Table
```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_news_created_at ON news(created_at DESC);
```

### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  event_date DATE NOT NULL,
  event_time TIME,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(event_date);
```

### Concerns Table
```sql
CREATE TABLE concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_concerns_user_id ON concerns(user_id);
CREATE INDEX idx_concerns_status ON concerns(status);
```

### Polls Table
```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  options JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Poll Votes Table
```sql
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  selected_option VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, poll_id)
);

CREATE INDEX idx_poll_votes_user_id ON poll_votes(user_id);
CREATE INDEX idx_poll_votes_poll_id ON poll_votes(poll_id);
```

## Step 5: Enable Row Level Security (RLS)

Enable RLS on all tables for security:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- Enable RLS on news table
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read news
CREATE POLICY "Anyone can read news" 
ON news FOR SELECT 
USING (true);

-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read events
CREATE POLICY "Anyone can read events" 
ON events FOR SELECT 
USING (true);

-- Enable RLS on concerns table
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own concerns
CREATE POLICY "Users can read their own concerns" 
ON concerns FOR SELECT 
USING (auth.uid() = user_id);

-- Enable RLS on polls table
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read polls
CREATE POLICY "Anyone can read polls" 
ON polls FOR SELECT 
USING (true);

-- Enable RLS on poll_votes table
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own votes
CREATE POLICY "Users can read their own votes" 
ON poll_votes FOR SELECT 
USING (auth.uid() = user_id);
```

## Step 6: Test the Connection

Run `npm run dev` and test the login/signup functionality.

## Session Management

Sessions are automatically managed by Supabase:
- Authentication tokens are stored securely in the browser
- Sessions persist across page refreshes
- Use `supabase.auth.getSession()` to check current session
- Use `supabase.auth.onAuthStateChange()` to listen for auth changes

## API Endpoints Reference

All API endpoints are now connected to Supabase tables. The service layer automatically handles:
- Authentication (signup/login/logout)
- Session persistence
- Data CRUD operations
- Row-level security

## Troubleshooting

**"Cannot find module '@supabase/supabase-js'"**
- Run `npm install @supabase/supabase-js`

**"Invalid API key"**
- Check your `.env.local` file has correct keys
- Regenerate keys in Supabase if needed

**"Session not persisting"**
- Check browser localStorage is enabled
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly
