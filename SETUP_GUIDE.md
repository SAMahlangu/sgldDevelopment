# SGLD Setup Guide

## Database Setup

1. **Create Admin User in Supabase Auth:**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Create User"
   - Email: `siphoalex955@gmail.com`
   - Password: `OpTiMuM.2.`
   - Click Create User

2. **Run Migration Script:**
   - Copy entire `DATABASE_MIGRATIONS.sql`
   - Go to Supabase Dashboard → SQL Editor → New Query
   - Paste the migration script
   - Click RUN
   - This will create all tables, sample data, and RLS policies

3. **Verify Migration:**
   - Go to Supabase → Table Browser
   - Check that these tables exist:
     - users
     - news
     - events
     - concerns
     - polls
     - policies
     - admin_logs
     - And others

## Test Login

1. **Admin Login:**
   - Role: Administrator
   - Email: `siphoalex955@gmail.com`
   - Password: `OpTiMuM.2.`

2. **Student Signup:**
   - Click "Sign Up" → "Student Account"
   - Fill in details
   - Email format: `student@example.com`
   - You'll be marked as "pending_approval"

3. **Admin Approves Student:**
   - Login as admin
   - Go to Admin Dashboard → Approvals tab
   - Click "Approve" on student

## Admin Features

### Overview Tab
- View total users
- See pending approvals
- Check active concerns and polls

### Approvals Tab
- Approve/reject pending users

### Users Tab
- View all users
- Suspend users for violations

### Policies Tab
- Create new policies
- View pending/approved policies
- Approve policies

### News & Events Tab
- Create/edit/delete news
- Create/edit/delete events

## Sample Data

The migration includes sample data:
- 5 news articles
- 5 events
- 3 polls
- 3 sample concerns

You can add more through the admin dashboard!
