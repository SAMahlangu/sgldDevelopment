# SRC Management System Setup Guide

## Overview
This system allows admins to create and manage SRC (Student Representative Council) members. Each admin is assigned to a specific campus and can only manage SRCs assigned to them.

**Structure:**
- 2 Admins (one per campus)
- 6 SRC Members (3 per campus, assigned to their admin)
- Only the assigned admin can create, edit, delete their SRCs

---

## Step 1: Run Database Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire content from `SRC_SETUP.sql` and paste it
5. Click **Run** to execute the migration

**What this does:**
- Adds `campus` field to users table
- Creates `srcs` table with admin assignment and campus field
- Sets up RLS policies for security

---

## Step 2: Get Admin IDs

After running the migration, you need to find your admin user IDs:

1. In Supabase SQL Editor, run:
```sql
SELECT id, email, name, campus FROM users WHERE role = 'admin';
```

2. You should see:
   - admin@sgld.com (will be assigned to Campus 1)
   - admin1@sgld.com (will be assigned to Campus 2)

---

## Step 3: Create SRC Members

**Option A: Using SQL (Recommended for testing)**

In Supabase SQL Editor, run this query with your actual admin IDs:

```sql
-- Get your admin IDs first from Step 2
-- Replace 'ADMIN_ID_1' and 'ADMIN_ID_2' with actual UUIDs from Step 2

INSERT INTO srcs (name, email, password, admin_id, campus) VALUES

-- Campus 1 SRCs (for admin@sgld.com)
('John Doe', 'src1@sgld.com', 'src1pass', 'ADMIN_ID_1', 'Campus 1'),
('Jane Smith', 'src2@sgld.com', 'src2pass', 'ADMIN_ID_1', 'Campus 1'),
('Mike Johnson', 'src3@sgld.com', 'src3pass', 'ADMIN_ID_1', 'Campus 1'),

-- Campus 2 SRCs (for admin1@sgld.com)
('Sarah Williams', 'src4@sgld.com', 'src4pass', 'ADMIN_ID_2', 'Campus 2'),
('Tom Brown', 'src5@sgld.com', 'src5pass', 'ADMIN_ID_2', 'Campus 2'),
('Lisa Garcia', 'src6@sgld.com', 'src6pass', 'ADMIN_ID_2', 'Campus 2');
```

**Option B: Using Admin Dashboard (Coming in next update)**

Admins can create SRCs directly from their dashboard.

---

## Step 4: Test the System

### Test the System

### Login as Admin (Campus 1)
1. Use `admin@sgld.com` with password `admin123`
2. You should see your `campus: Campus 1` assignment
3. Navigate to **SRC Management** tab

### View Assigned SRCs
- You'll see only the 3 SRCs assigned to your campus
- Other campuses' SRCs won't be visible

### Login as SRC
1. Use one of the SRC credentials (e.g., `src1@sgld.com` / `src1pass`)
2. You'll be taken to the SRC Dashboard
3. You can manage meetings, requests, and updates for your campus

---

## Demo Credentials

### Campus 1
- **Admin:** admin@sgld.com / admin123
  - Campus: Campus 1
  - SRCs: John Doe, Jane Smith, Mike Johnson

### Campus 2  
- **Admin:** admin1@sgld.com / admin123
  - Campus: Campus 2
  - SRCs: Sarah Williams, Tom Brown, Lisa Garcia

### SRC Login Examples
- Email: src1@sgld.com / Password: src1pass
- Email: src4@sgld.com / Password: src4pass

---

## Admin Dashboard Features (SRC Management)

Once logged in as admin, you'll see:

1. **SRC Overview**
   - Total SRCs under your management
   - Active/Inactive count
   - Campus assignment

2. **Create SRC**
   - Add new SRC member with name, email, password
   - Automatically assigned to your campus

3. **Manage SRCs**
   - Edit SRC details
   - Activate/Deactivate SRCs
   - Delete SRCs

4. **View SRC Activities**
   - See meetings scheduled by your SRCs
   - View updates posted by your SRCs
   - Track student requests handled

---

## Troubleshooting

**"Cannot see other admin's SRCs"**
- ✅ This is correct! RLS policies prevent cross-campus access

**"Login failing for SRC"**
- Verify SRC email and password are correct
- Check that the SRC is marked as 'active' status

**"Campus field not showing"**
- Ensure the migration ran successfully
- Refresh the page after login

---

## Next Steps

After testing, you can:
1. Remove demo data and create real admins/SRCs
2. Customize SRC dashboard features
3. Add more campuses if needed
