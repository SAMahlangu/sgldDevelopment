# SGLD Dashboard System - Features & Implementation Guide

## Overview
The SGLD system now includes a complete role-based dashboard system with user authentication, signup forms, and comprehensive management interfaces for different user roles.

## System Architecture

### Authentication Flow
```
AuthContext (src/contexts/AuthContext.jsx)
  ├── User State Management
  ├── Login/Signup Logic
  └── Role-based Access Control
```

### Components Structure
```
src/
  ├── contexts/
  │   └── AuthContext.jsx          # Authentication state & logic
  ├── components/
  │   ├── Header.jsx               # Updated header with auth modal
  │   ├── RoleLogin.jsx            # Login form for all roles
  │   ├── StudentSignup.jsx        # Student account creation
  │   ├── AdminSignup.jsx          # Admin account creation
  │   ├── SRCAccessForm.jsx        # SRC member request form
  │   ├── StudentDashboard.jsx     # Student interface
  │   ├── AdminDashboard.jsx       # Administrator interface
  │   ├── SRCDashboard.jsx         # SRC management interface
  │   ├── Dashboards.css           # Dashboard styling
  │   └── AuthForms.css            # Auth forms styling
  ├── services/
  │   └── apiService.js            # Backend API integration layer
  └── App.jsx                      # Main app with AuthProvider wrapper
```

## Features by Role

### 1. STUDENT DASHBOARD
**Access**: Students create an account and log in directly
**Functionalities**:
- **Report Concerns**: Submit issues affecting campus life (library hours, Wi-Fi, parking, etc.)
- **View My Concerns**: Track submitted concerns with status (pending, in progress, resolved)
- **Vote in Polls**: Participate in campus governance decisions
- **Track Cases**: Follow up on resolved/in-progress concerns
- **View Upcoming Events**: See campus events related to governance and leadership

**Demo Login**: 
- Email: `student@example.com`
- Password: `pass123`

### 2. ADMIN DASHBOARD
**Access**: Admins register with verification code (`ADMIN2026`) and require no approval
**Functionalities**:
- **System Overview**: View statistics (total users, pending approvals, active concerns, active polls)
- **User Approvals**: Review and approve/reject pending SRC and admin registrations
- **User Management**: Edit, suspend, or manage all system users
- **Policy Management**: Create, review, and approve governance policies
- **Reports & Health**: View system reports and platform health status

**Demo Login**:
- Email: `admin@example.com`
- Password: `admin123`

### 3. SRC MEMBER DASHBOARD
**Access**: SRC members submit access requests that admins must approve
**Functionalities**:
- **Meeting Management**: Schedule and organize SRC meetings, view attendees
- **Handle Student Requests**: Respond to student concerns and requests
- **Publish Updates**: Share announcements and governance updates with students
- **Track Stats**: View pending actions, meeting schedules, and published updates
- **Dashboard Overview**: Quick stats on scheduled meetings, pending requests, and updates

**Demo Login**:
- Email: `src@example.com`
- Password: `src123`

## Demo Credentials

### Pre-loaded Users (in-memory)
```
STUDENT:
- Email: student@example.com
- Password: pass123
- Role: student
- Status: active

ADMIN:
- Email: admin@example.com
- Password: admin123
- Role: admin
- Status: active

SRC MEMBER:
- Email: src@example.com
- Password: src123
- Role: src
- Status: active
```

### Admin Verification Code
For creating new admin accounts: `ADMIN2026`

## How to Use

### For Students
1. Click "Login" in the header
2. Click "Create Account" → "Student Account"
3. Fill in student details (name, email, student ID, faculty)
4. Create account (instant access to dashboard)
5. Use dashboard to submit concerns, vote in polls, and track cases

### For SRC Members
1. Click "Login" in the header
2. Click "Create Account" → "SRC Member"
3. Provide SRC position, faculty, and motivation
4. Submit access request (awaits admin approval)
5. Admin approves → access to SRC dashboard

### For Admins
1. Click "Login" in the header
2. Click "Create Account" → "Administrator"
3. Enter admin code (`ADMIN2026`)
4. Create account (instant access to admin dashboard)
5. Use dashboard to manage users and policies

## Backend Integration

### API Service Layer (`src/services/apiService.js`)
The system includes a complete API service layer ready for backend integration. Replace mock data with actual API calls:

#### Authentication APIs
```javascript
authService.signup(email, password, name, role, additionalData)
authService.login(email, password, role)
authService.logout(userId)
```

#### Student APIs
```javascript
studentService.submitConcern(userId, title, description)
studentService.getConcerns(userId)
studentService.votePoll(userId, pollId, selectedOption)
studentService.getPolls()
```

#### Admin APIs
```javascript
adminService.getPendingUsers()
adminService.approveUser(userId)
adminService.rejectUser(userId)
adminService.createPolicy(title, description)
adminService.getStatistics()
```

#### SRC APIs
```javascript
srcService.createMeeting(srcId, title, date, time, location)
srcService.publishUpdate(srcId, title, content)
srcService.getRequests(srcId)
srcService.respondToRequest(requestId, response)
```

### Connecting to Backend

1. **Set API Base URL**:
   ```bash
   # In .env file
   REACT_APP_API_URL=https://your-backend-api.com
   ```

2. **Update AuthContext** to use `apiService` instead of mock data:
   ```javascript
   const result = await authService.login(email, password, role)
   ```

3. **Replace Dashboard API Calls**:
   Each dashboard component can import and use the apiService methods

### Example: Supabase Integration
```javascript
// In AuthContext.jsx
import { supabase } from './supabaseClient'

const signup = async (email, password, name, role) => {
  const { data, error } = await supabase.auth.signUp({
    email, password
  })
  // Handle response
}
```

## Styling

### Dashboard Styles (`src/components/Dashboards.css`)
- Auth forms with validation feedback
- Dashboard cards and grids
- Status indicators and badges
- Role-specific color schemes
- Responsive design (mobile-first)

### Available CSS Classes
```css
.dashboard              /* Main dashboard container */
.dashboard-card        /* Card components */
.auth-form            /* Authentication form */
.error-alert          /* Error messages */
.success-alert        /* Success notifications */
.status               /* Status badges */
.badge               /* Info badges */
```

## State Management

### AuthContext Hooks
```javascript
const { user, loading, signup, login, logout } = useAuth()

// user: { id, email, name, role, status }
// loading: boolean (during auth operations)
// signup: async function
// login: async function
// logout: function
```

### Local Component State
Each dashboard manages its own state for:
- Form data
- Active tabs
- Lists (concerns, meetings, etc.)
- UI toggles (modals, dropdowns)

## Security Considerations

### Current Implementation (Development)
- Passwords stored in memory (NOT SECURE)
- No token-based authentication
- Client-side validation only

### Production Implementation
- Use HTTPS only
- Hash passwords on backend (bcrypt, argon2)
- Implement JWT tokens
- Server-side validation
- CORS configuration
- Rate limiting
- Input sanitization

## Responsive Design

### Mobile Breakpoints
```css
@media (max-width: 1024px) { /* Tablets */ }
@media (max-width: 768px)  { /* Small tablets */ }
@media (max-width: 500px)  { /* Mobile phones */ }
```

### Touch-Friendly Elements
- Large buttons (min 44px)
- Spacing for touch targets
- Full-width forms on mobile
- Collapsed navigation

## Troubleshooting

### Login Not Working
- Check if user exists in AuthContext
- Verify email and password match exactly
- Ensure role is selected (for login)

### Dashboard Not Showing
- Check if user state is set in AuthContext
- Verify user role matches dashboard component
- Check browser console for errors

### Styles Not Applied
- Ensure Dashboards.css is imported in components
- Check CSS class names match element classes
- Verify CSS selectors are specificity-correct

## Future Enhancements

1. **Backend Integration**: Connect to actual backend API
2. **Email Verification**: Confirm student emails during signup
3. **Two-Factor Authentication**: Additional security layer
4. **Real-time Notifications**: Socket.io for live updates
5. **File Upload**: Support for documents and PDFs
6. **Analytics**: Track system usage and metrics
7. **Export Reports**: PDF/CSV export functionality
8. **Advanced Search**: Filter and search concerns/polls
9. **Mobile App**: Native iOS/Android versions
10. **Internationalization**: Multi-language support

## File Structure Summary

```
NEW FILES CREATED:
├── src/contexts/AuthContext.jsx
├── src/components/StudentSignup.jsx
├── src/components/AdminSignup.jsx
├── src/components/SRCAccessForm.jsx
├── src/components/RoleLogin.jsx
├── src/components/StudentDashboard.jsx
├── src/components/AdminDashboard.jsx
├── src/components/SRCDashboard.jsx
├── src/components/Dashboards.css
├── src/components/AuthForms.css
└── src/services/apiService.js

MODIFIED FILES:
├── src/App.jsx (wrapped with AuthProvider)
├── src/components/Header.jsx (updated with auth modal)
└── src/styles.css (added user menu & signup styles)
```

## Testing the System

### Quick Test Flow
1. Open app → Click Login → Create Student Account
2. Fill form → Get instant dashboard access
3. Test: Submit concern, vote poll, track case
4. Logout → Create SRC Account
5. Request access → Logout
6. Login as Admin → Approve SRC request
7. Login as SRC Member → Access SRC dashboard

## Support & Customization

### Customizing Colors
Edit CSS variables in `src/styles.css`:
```css
:root {
  --accent: #0f766e;    /* Primary color */
  --accent-600: #115e59; /* Darker accent */
  --bg: #ffffff;         /* Background */
}
```

### Adding New Roles
1. Add role to `AuthContext`
2. Create new Dashboard component
3. Update `App.jsx` conditional rendering
4. Add role-specific API methods

### Modifying Dashboard Cards
Each dashboard component uses reusable card structure:
```jsx
<div className="dashboard-card">
  <div className="card-header">
    <h2>Title</h2>
  </div>
  <div className="card-body">
    {/* Content */}
  </div>
</div>
```
