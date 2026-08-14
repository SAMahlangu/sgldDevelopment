# Student Governance & Leadership Development (SGLD)

---

## Title Slide

- Student Governance & Leadership Development
- Building Leaders • Empowering Choices • Shaping the Future
- Presenter: [Your Name]
- Date: [Presentation Date]

---

## Problem & Opportunity

- Students lack a central system for raising concerns, voting, and accessing campus resources.
- Opportunity: Provide a simple, secure platform for student representation and campus governance.

---

## Key Features

- Role-based dashboards (Student, SRC, SFC, Admin)
- Case/concern submission and tracking
- News & events publishing
- Document management and secure previews

---

## Demo Flow

1. Landing page & role-aware login
2. Submit a concern or request
3. Admin/SRC/SFC review & actions
4. Publish news and share documents

---

## Architecture (high level)

- Frontend: React + Vite
- Backend: Supabase (Postgres + Storage + Auth)
- Hosting/Deployment: (e.g., Vercel/Netlify) — CI/CD on push

---

## Recent Changes (this commit)

- Added in-app document preview modal with PDF embed and loading spinner
- Improved modal styling and layering so preview overlays other UI
- Removed institutional roles from login role selection (ISRC/ISP/CSRC/CSP)

---

## Next Steps

- Add analytics and error monitoring
- Improve PDF accessibility and printing flow
- Add user onboarding and tutorial flow

---

## Thank You

- Questions?
- Contact: [your-email@example.com]
