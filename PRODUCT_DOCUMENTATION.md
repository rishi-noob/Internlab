# InternLab — Product Documentation

## 📋 Product Overview

InternLab is a **full-stack internship management platform** that allows administrators to create and manage internship programs, assign tasks, track intern progress, and manage the entire intern lifecycle. Interns join programs via invite codes, complete assigned tasks, submit work, and track their own progress.

---

## 🎯 Features

### Core Features (Essential)

| Feature | Description |
|---|---|
| **User Authentication** | JWT-based login/register with role-based access (ADMIN, MENTOR, INTERN) |
| **Program Management** | Admins create internship programs with title, description, domain, duration, and date range |
| **Invite Code System** | Admin generates unique 6-character invite codes tied to specific programs. Interns use these codes to enroll |
| **Task Management** | Admin/Mentor create tasks (VIDEO, READING, QUIZ/ASSIGNMENT) within programs with ordering, descriptions, and resource URLs |
| **Enrollment System** | Interns enroll via invite codes. Enrollment tracks status (ACTIVE, EXTENDED, COMPLETED) and expiration |
| **Progress Tracking** | Real-time progress tracking per enrollment — completed/total tasks, percentage display |
| **Work Submission** | Interns submit links (Google Docs, GitHub, etc.) for QUIZ/ASSIGNMENT type tasks |
| **Admin Dashboard** | 6-card stats overview: total learners, yet to start, in progress, completed, avg progress, avg time spent |
| **Student Management** | Admin views all interns, their profiles, enrollment details, and task-by-task progress |
| **Role-Based Access** | Interns only see their enrolled programs. Admins/Mentors see all programs and manage content |

### Supporting Features (Non-Essential)

| Feature | Description |
|---|---|
| **Resources & Articles** | Admin can add shared resources (articles, tools, videos) visible to all users |
| **Enrollment Extension** | Admin can extend enrollment duration by a specified number of days |
| **Certificate Placeholder** | Schema supports `certificateUrl` on enrollment (not yet implemented in UI) |
| **Grading System** | Admin/Mentor can grade task submissions |
| **Health Check Endpoint** | `GET /health` endpoint for monitoring |
| **Docker Support** | Dockerfile and docker-compose.yml included for containerized deployment |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI component library |
| **Vite** | 7.x | Build tool and dev server |
| **React Router DOM** | 7.x | Client-side routing |
| **Vanilla CSS** | — | Custom styling with CSS variables, responsiveness, animations |
| **Google Fonts (Inter)** | — | Typography |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20.x | Runtime |
| **Express** | 5.x | Web framework |
| **Prisma ORM** | 5.x | Database ORM and query builder |
| **SQLite** | — | Database (local file-based; schema also supports PostgreSQL) |
| **JWT (jsonwebtoken)** | 9.x | Authentication tokens |
| **bcryptjs** | 3.x | Password hashing |
| **Helmet** | 8.x | Security headers |
| **CORS** | 2.x | Cross-origin support |
| **express-validator** | 7.x | Request validation |
| **dotenv** | 17.x | Environment variables |
| **Nodemon** | 3.x | Dev-only auto-restart |

---

## 🗄 Database

### Current Setup: SQLite

The database is **SQLite** (file-based), configured in `server/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

The `DATABASE_URL` in `server/.env` will look like:
```
DATABASE_URL="file:./dev.db"
```

### How to Locate and Browse the Database

1. **Database file location**: `server/prisma/dev.db` (or whatever is set in `DATABASE_URL`)
2. **Browse with Prisma Studio** (recommended):
   ```bash
   cd server
   npx prisma studio
   ```
   This opens a web UI at `http://localhost:5555` where you can browse, query, and edit all tables.

3. **Browse with any SQLite viewer**:
   - [DB Browser for SQLite](https://sqlitebrowser.org/) (desktop app)
   - VS Code extension: "SQLite Viewer"
   - Open the `dev.db` file directly

### Database Schema (6 Models)

| Model | Key Fields |
|---|---|
| **User** | id, email, name, password, role (ADMIN/MENTOR/INTERN), phone, college, duration, interests |
| **Program** | id, title, description, domain, durationDays, startDate, endDate, createdById |
| **Task** | id, title, description, type (VIDEO/READING/QUIZ), contentUrl, mandatory, deadline, orderIndex, programId |
| **Enrollment** | id, userId, programId, status (ACTIVE/EXTENDED/COMPLETED), enrolledAt, expiresAt |
| **UserProgress** | id, enrollmentId, taskId, status (NOT_STARTED/IN_PROGRESS/COMPLETED), completedAt, submissionUrl, grade |
| **InviteCode** | id, code (unique 6-char), programId, expiresAt, used |
| **Resource** | id, title, url, description, category |

### Switching to PostgreSQL

If you want to use PostgreSQL instead:

1. Update `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/internlab?schema=public"
   ```

3. Run migration:
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```

---

## 📂 Project Structure

```
Intern Lab/
├── client/                          # React Frontend
│   ├── index.html                   # Entry HTML (viewport, fonts, SEO)
│   ├── vite.config.js               # Vite config (proxy /api → backend)
│   ├── package.json
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Routes and layout
│       ├── index.css                # All styles (2000+ lines, responsive)
│       ├── components/
│       │   └── Navbar.jsx           # Navigation bar (responsive hamburger)
│       ├── context/
│       │   └── AuthContext.jsx      # Auth state management
│       ├── pages/
│       │   ├── Login.jsx            # Login page
│       │   ├── Register.jsx         # Registration page
│       │   ├── Dashboard.jsx        # Main dashboard (role-based views)
│       │   ├── Programs.jsx         # Programs listing
│       │   ├── ProgramDetail.jsx    # Program tasks + submission UI
│       │   ├── AdminStudents.jsx    # Admin: student list
│       │   ├── StudentDetail.jsx    # Admin: individual student details
│       │   └── AdminResources.jsx   # Admin: manage resources
│       └── services/
│           └── api.js               # API client (all HTTP calls)
│
├── server/                          # Node.js Backend
│   ├── server.js                    # Server entry point (listens on PORT)
│   ├── package.json
│   ├── .env                         # Environment variables
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── dev.db                   # SQLite database file
│   └── src/
│       ├── app.js                   # Express app config + route mounting
│       ├── config/
│       │   ├── db.js                # Prisma client instance
│       │   └── auth.js              # JWT config
│       ├── middleware/
│       │   └── auth.js              # JWT verify + role authorization
│       ├── controllers/
│       │   ├── authController.js    # Login, register, invite generation
│       │   ├── programController.js # CRUD programs (filtered for interns)
│       │   ├── taskController.js    # CRUD tasks + progress sync
│       │   ├── enrollmentController.js  # Enroll, extend, list
│       │   ├── progressController.js    # Mark complete, submit work, grade
│       │   ├── adminController.js   # Admin stats, student details
│       │   └── resourceController.js    # CRUD resources
│       └── routes/
│           ├── authRoutes.js
│           ├── programRoutes.js
│           ├── taskRoutes.js
│           ├── enrollmentRoutes.js
│           ├── progressRoutes.js
│           ├── adminRoutes.js
│           ├── resourceRoutes.js
│           └── certificateRoutes.js
│
├── Dockerfile                       # Docker image for server
├── docker-compose.yml               # Docker Compose (PostgreSQL)
└── .gitignore
```

---

## 🏃 Running Locally

### Prerequisites
- **Node.js** 18+ installed
- **npm** (comes with Node.js)

### Steps

1. **Clone and install dependencies**:
   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # In server/ directory, create .env file:
   DATABASE_URL="file:./dev.db"
   PORT=5000
   JWT_SECRET="your_secret_key_here"
   JWT_EXPIRES_IN="7d"
   ```

3. **Set up the database**:
   ```bash
   cd server
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Seed the admin account** (if you have a seed script, otherwise create via Prisma Studio):
   ```bash
   npx prisma db seed
   ```

5. **Start both servers**:
   ```bash
   # Terminal 1 — Backend
   cd server
   npm run dev

   # Terminal 2 — Frontend
   cd client
   npm run dev
   ```

6. **Open**: http://localhost:3000

---

## 🚀 Deployment Guide

### Option 1: Render (Recommended — Free Tier Available)

#### Backend (Web Service)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     DATABASE_URL=<your_postgresql_connection_string>
     JWT_SECRET=<strong_random_secret>
     JWT_EXPIRES_IN=7d
     NODE_ENV=production
     ```
5. For the database, use Render's free PostgreSQL add-on or [Neon](https://neon.tech) (free PostgreSQL)

> ⚠️ **Important**: For production, switch from SQLite to PostgreSQL. Update `schema.prisma` provider to `"postgresql"`.

#### Frontend (Static Site)

1. Go to Render → New → Static Site
2. Connect the same repo
3. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variable**:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```
4. Add a **Rewrite Rule**: `/*` → `/index.html` (for SPA routing)

> You'll need to update `client/src/services/api.js` to use `VITE_API_URL` as the API base instead of the Vite proxy.

---

### Option 2: Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a PostgreSQL plugin (free trial available)
4. Set environment variables (same as Render)
5. Railway auto-detects Node.js and deploys both services

---

### Option 3: VPS (DigitalOcean, AWS EC2, etc.)

1. SSH into your server
2. Install Node.js 20, nginx, and certbot
3. Clone the repo and install dependencies
4. Set up PostgreSQL database
5. Build the frontend:
   ```bash
   cd client
   npm run build
   ```
6. Configure nginx:
   ```nginx
   server {
       server_name yourdomain.com;

       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location / {
           root /path/to/client/dist;
           try_files $uri /index.html;
       }
   }
   ```
7. Use PM2 to keep the server running:
   ```bash
   cd server
   pm2 start server.js --name internlab
   ```
8. Set up SSL with certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

### Option 4: Docker

The project includes a `Dockerfile` and `docker-compose.yml`:

```bash
# Start PostgreSQL
docker-compose up -d

# Build and run the server
docker build -t internlab-server .
docker run -p 5000:5000 --env-file server/.env internlab-server
```

For production, build the client and serve static files from nginx or the Express server.

---

## 🔑 API Endpoints Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new intern |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Get current user |
| POST | `/api/auth/invite` | Admin | Generate invite code |
| GET | `/api/programs` | Auth | List programs (filtered for interns) |
| GET | `/api/programs/:id` | Auth | Get program details |
| POST | `/api/programs` | Admin | Create program |
| PUT | `/api/programs/:id` | Admin | Update program |
| DELETE | `/api/programs/:id` | Admin | Delete program |
| GET | `/api/programs/:pid/tasks` | Auth | List tasks for program |
| POST | `/api/programs/:pid/tasks` | Admin/Mentor | Create task |
| PUT | `/api/tasks/:id` | Admin/Mentor | Update task |
| DELETE | `/api/tasks/:id` | Admin/Mentor | Delete task |
| GET | `/api/enrollments/my` | Auth | Get own enrollments |
| GET | `/api/enrollments` | Admin | Get all enrollments |
| POST | `/api/enrollments` | Auth | Enroll via invite code |
| PUT | `/api/enrollments/:id/extend` | Admin | Extend enrollment |
| POST | `/api/progress/:taskId/complete` | Auth | Mark task complete |
| POST | `/api/progress/:taskId/submit` | Auth | Submit work link |
| GET | `/api/progress/enrollment/:id` | Auth | Get enrollment progress |
| PUT | `/api/progress/:id/grade` | Admin/Mentor | Grade submission |
| GET | `/api/progress/stats` | Admin | Aggregate stats |
| GET | `/api/resources` | Auth | List resources |
| POST | `/api/resources` | Admin | Create resource |
| DELETE | `/api/resources/:id` | Admin | Delete resource |
| GET | `/api/admin/interns` | Admin | List all interns |
| GET | `/api/admin/interns/:id` | Admin | Get intern details |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/health` | Public | Health check |

---

## 📝 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | Database connection string |
| `PORT` | ❌ | 5000 | Server port |
| `JWT_SECRET` | ✅ | — | Secret key for JWT tokens |
| `JWT_EXPIRES_IN` | ❌ | 7d | JWT expiration duration |
| `NODE_ENV` | ❌ | development | Set to `production` for deployment |
