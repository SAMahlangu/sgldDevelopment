# 🚀 SGLD Admin Dashboard - Complete Setup Guide

## ⏱️ TIME SENSITIVE: Setup for Presentation in ~1 Hour

---

## 📋 SETUP CHECKLIST

Follow these steps in order. Each step should take only a few minutes.

### Step 1: Run the Complete Database Setup SQL ✅
**Time: ~2 minutes**

1. Go to: **https://supabase.com/dashboard**
2. Select your project: **bppcpfbjuwyiegntoudf**
3. Click **SQL Editor** (left sidebar)
4. Click **+ New Query**
5. Copy the **ENTIRE** contents of `FINAL_COMPLETE_SETUP.sql` from this project
6. Paste it into the SQL editor
7. Click **Run** button (top right)
8. ✅ You should see verification queries show results at the bottom with:
   - `table_name` results (7 tables: users, news, events, etc.)
   - User data showing 2 admin accounts
   - Database health check showing "healthy"

**If you get errors:**
- If error mentions "table already exists" → Click **Run** anyway (it will skip existing)
- If you see results → Setup is successful!

---

### Step 2: Refresh Your Application ✅
**Time: ~1 minute**

1. Go back to VS Code
2. Make sure dev server is running (`npm run dev`)
3. **Hard refresh** your application:
   - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache for localhost

---

### Step 3: Test Admin Login ✅
**Time: ~2 minutes**

Use these credentials:

| Field | Value |
|-------|-------|
| **Email** | `admin1@sgld.com` |
| **Password** | `123456` |
| **Role** | `Administrator` |

**Expected Result:**
- ✅ Login succeeds
- ✅ Redirects to Admin Dashboard
- ✅ You see "✅ DB Connected" in top right of header
- ✅ Dashboard shows:
  - Overview tab with stats (2 pending approvals, 5 active polls, etc.)
  - News tab with 5 sample news items
  - Events tab with 5 upcoming events
  - Policies tab with policies
  - Approvals tab with pending users

**If login fails:**
- Check you're using exact email/password above
- Check role is set to "Administrator"
- Check browser console for errors (F12 → Console)

---

### Step 4: Verify Database Status Indicator ✅
**Time: ~30 seconds**

1. After login, look at top right of page
2. You should see **"✅ DB Connected"** (green)
3. **Hover over it** to see detailed stats:
   - Status: healthy
   - Tables: 7/7
   - Users: 4+
   - News: 5
   - Events: 5

If you see ❌ or ⚠️, the setup didn't complete properly. Go back to Step 1.

---

### Step 5: Test Admin Features ✅
**Time: 5 minutes (optional)**

**Create a News Item:**
1. Click "News & Events" tab
2. Click "Add New News"
3. Fill in:
   - Title: "Test News Item"
   - Description: "This is a test"
   - Image URL: (leave blank)
4. Click "Save News"
5. ✅ Should appear in the news list

**View Approvals:**
1. Click "Approvals" tab
2. You should see 1 "Jane Smith" student pending approval
3. Click "Approve" button
4. ✅ User should move from pending to approved

**View Policies:**
1. Click "Policies" tab
2. You should see 5 default policies
3. One should be "Proposed Improvement" (pending)
4. Others should be "approved"

---

## 🎯 FOR YOUR PRESENTATION

### What to Show:

1. **Login Screen** → Show clean login with all 3 roles available
2. **Admin Dashboard** → Show Overview tab with data
3. **Database Status** → Hover over ✅ DB Connected to show all systems operational
4. **News Management** → Show existing news, create a new news item
5. **Event Management** → Show events with dates and times
6. **User Approvals** → Show pending users and approval workflow
7. **Policies** → Show approved and pending policies

### Demo Flow:
```
1. "Here's our clean login interface" → Show login screen
2. "Admin logs in" → Use admin1@sgld.com / 123456
3. "Dashboard shows real-time statistics" → Point to stats box
4. "Database is verified and healthy" → Hover over DB status
5. "Content management is simple" → Create/delete news item
6. "Admin approval workflow" → Approve a student
7. "Policy management" → Show policies
```

---

## 🔐 Additional Admin Accounts (if needed)

If `admin1@sgld.com` doesn't work, try this alternate account:

| Email | Password | Role |
|-------|----------|------|
| `admin@sgld.com` | `123456` | Administrator |

---

## 📊 Sample Data Included

The database automatically includes:

- **Users:**
  - 2 admin accounts (active)
  - 3 student/SRC accounts (1 pending, 2 active)

- **News:** 5 items (Welcome, Campus Event, Policy Update, Scholarship, Senate Meeting)

- **Events:** 5 items (Festival, Senate Meeting, Career Fair, Orientation, Sports Day)

- **Policies:** 5 items (3 approved, 2 requiring action)

- **Polls:** 5 active polls for student feedback

---

## 🛠️ Database Functions

The setup includes these automatic functions:

1. **`database_health_check()`** - Shows database status
2. **`get_admin_statistics()`** - Powers the overview stats
3. **`approve_pending_user()`** - Approves students
4. **`reject_pending_user()`** - Rejects students
5. **`suspend_user()`** - Suspends problematic users

---

## ❌ TROUBLESHOOTING

### "Database Disconnected" appears
**Solution:** 
- Refresh page (Ctrl+Shift+R)
- Check if SQL setup completed (see Step 1 verification)
- Check browser console for errors

### "Invalid email, password, or role" on login
**Solution:**
- Use exact credentials: `admin1@sgld.com` / `123456` / `Administrator`
- Make sure you selected "Administrator" role (not "Student")
- Re-run Step 1 SQL setup

### No data appears in dashboard
**Solution:**
- Click "Refresh Dashboard" button
- Hard refresh browser (Ctrl+Shift+R)
- Check database status (should show "✅ DB Connected")

### Stats show 0 but data exists
**Solution:**
- This might be a display bug
- Refresh the page with Ctrl+Shift+R
- Stats should populate from the `get_admin_statistics()` function

---

## 📱 What Admin Can Do

✅ View dashboard statistics
✅ Create/edit/delete news
✅ Create/edit/delete events  
✅ Create/edit/delete policies
✅ Approve/reject pending users
✅ Suspend users
✅ View all student concerns
✅ View poll results
✅ Manage all content

---

## 🎉 YOU'RE READY!

Once you see:
- ✅ Login successful
- ✅ DB Connected indicator green
- ✅ Dashboard loads with real data
- ✅ Admin functions work

**You're ready to present!**

---

## 📞 If Something Still Doesn't Work

1. **Check the browser console** (Press F12 → Console tab)
2. **Look for specific error messages**
3. **Try the alternate admin account** (admin@sgld.com)
4. **Verify SQL ran successfully** by checking Supabase SQL Editor history

---

**Good luck with your presentation! 🚀**

*Last Updated: April 14, 2026*
