# 🌐 CampusConnect – The University Talent Finder App  

*A SURGE ’25 Web Hackathon Submission*  

---

## 🚀 Overview  

**CampusConnect** is an on-campus talent discovery platform that connects students through opportunities — from part-time jobs to startup gigs, academic projects, or collaboration opportunities.  

The goal is to simulate an **intra-university job marketplace** where students can seamlessly switch between acting as:  

- 👨‍💼 **Talent Finder** – Post jobs or opportunities.  
- 👩‍💻 **Talent Seeker** – Browse, apply, or express interest in listings.  

---

## 🧩 Core Features  

### 🏠 1. Landing Page  
A responsive and modern landing page introducing CampusConnect, highlighting its mission and core modules.  

### 🔐 2. Authentication  
- Email/password sign-up & login  
- OAuth login (Google / GitHub)  
- Email verification & password reset  
- Role switching between *Finder* ↔ *Seeker* without logging out  

### 🧭 3. Talent Finder Dashboard  
- Create, edit, delete, and mark job posts as filled  
- Save draft posts before publishing  
- Manage applicants: view profiles, shortlist, send messages  
- Analytics for each post (views, applications, interest rate)  

### 💼 4. Talent Seeker Dashboard  
- Browse and filter jobs by title, type, or tags  
- Personalized job recommendations (skills/interests based)  
- Save/bookmark jobs  
- Upload resume or proposal while applying  
- Track application status: *Pending*, *Shortlisted*, *Rejected*, *Accepted*  

### 🗄️ 5. Database Integration  
All users, posts, and applications are stored securely in a database (MongoDB preferred).  

### ⚙️ 6. Engineering Logic  
- Custom algorithm for job-matching / recommendation ranking  
- Optional: AI-assisted resume parsing or profile scoring  

### 💬 7. Real-time Chat & Notifications  
- WebSocket or Firebase-based messaging system  
- Push notifications for new messages or application updates  

### 🎯 8. Match Score  
Each job shows a **Match Percentage** based on the applicant’s skills vs. job requirements (e.g., *“You match 85% of this opportunity”*).  

---

## 🧱 Tech Stack  

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js / Vite / TailwindCSS |
| **Backend** | Node.js / Express.js |
| **Database** | MongoDB / Mongoose |
| **Authentication** | JWT + OAuth (Google/GitHub) |
| **Real-time Chat** | Socket.io / Firebase |
| **Deployment** | Vercel (Frontend) + Render / Railway (Backend) |

---

## 🧠 Judging Criteria Alignment  

| Category | Weight | Implementation Summary |
|-----------|---------|------------------------|
| **Functionality** | 30 | Complete MVP with dashboards, job posting, and application flow |
| **Design & UX** | 20 | Responsive, intuitive, university-themed interface |
| **Scalability & Architecture** | 20 | Modular MERN structure, reusable components, secure API routes |
| **Engineering Logic** | 15 | Job recommendation and match-score logic |
| **Presentation & Demo** | 15 | Smooth walkthrough, clear flow, team pitch-ready |

---

## 🧾 Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/<your-username>/CampusConnect.git
cd CampusConnect
