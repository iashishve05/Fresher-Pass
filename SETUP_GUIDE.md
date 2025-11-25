# Fresher Pass - Complete Setup & Run Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js v16+ ([Download](https://nodejs.org))
- Git

### Setup

#### 1. Clone & Install

```powershell
git clone https://github.com/iashishve05/Fresher-Pass.git
cd Fresher-Pass
npm install
```

#### 2. Install Backend Dependencies

```powershell
cd server
npm install
cd ..
```

#### 3. Start Backend (Terminal 1)

```powershell
cd server
npm start
```

**Expected Output:**
```
Server listening on http://localhost:4000
Default admin user created: admin@college.edu / admin123
```

#### 4. Start Frontend (Terminal 2)

```powershell
npm run dev
```

**Expected Output:**
```
VITE v6.x.x ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

#### 5. Access the App

Open your browser and go to:
- **Public**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/#/admin

---

## Detailed Setup Instructions

### Backend Setup

```bash
cd server
npm install
npm start
```

This will:
1. Start Express server on port 4000
2. Initialize SQLite database (`server/data.sqlite`)
3. Create default admin user: `admin@college.edu / admin123`
4. Listen for API requests

### Frontend Setup

```bash
npm install
npm run dev
```

This will:
1. Start Vite dev server (typically port 5173)
2. Enable hot module reloading
3. Proxy `/api` requests to `http://localhost:4000`

---

## Project Structure

```
Fresher-Pass/
├── public/                 # Static assets
├── src/
│   ├── pages/
│   │   ├── Home.tsx       # Landing page
│   │   ├── Register.tsx   # Registration form (multi-step)
│   │   ├── Pass.tsx       # Digital pass display with QR
│   │   └── admin/
│   │       ├── Login.tsx  # Admin login
│   │       ├── Dashboard.tsx  # Admin dashboard (view/edit students)
│   │       └── Scanner.tsx    # QR scanner for check-ins
│   ├── components/
│   │   ├── Layout.tsx     # App wrapper
│   │   └── ui/Toast.tsx   # Toast notifications
│   ├── services/
│   │   └── mockBackend.ts # API layer (handles all backend calls)
│   ├── App.tsx            # Main app component with routing
│   ├── index.tsx          # React entry point
│   └── index.css          # Global styles (Tailwind)
├── server/
│   ├── index.js           # Express server & endpoints
│   ├── db.js              # SQLite database initialization
│   ├── package.json       # Backend dependencies
│   └── data.sqlite        # Database file (auto-created)
├── vite.config.ts         # Vite config (dev proxy setup)
├── tailwind.config.cjs    # Tailwind CSS config
├── postcss.config.cjs     # PostCSS config
└── package.json           # Frontend dependencies
```

---

## Available Scripts

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

### Backend

```bash
# From server/ directory
npm start        # Start Express server on port 4000
```

---

## API Overview

All endpoints are prefixed with `/api`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/register` | Register new student |
| GET | `/students` | Get all students |
| GET | `/student/:serial` | Get student by ID |
| PUT | `/student/:serial` | Update student |
| DELETE | `/student/:serial` | Delete student |
| POST | `/checkin/:serial` | Check-in student (QR scan) |
| POST | `/admin/login` | Authenticate admin |
| GET | `/search` | Search/filter students |
| GET | `/export` | Export students as CSV |
| GET | `/stats` | Get event statistics |

See `API_DOCUMENTATION.md` for detailed endpoint reference.

---

## Data Flow

### Registration → Pass → Check-in

1. **Registration Page** (`/register`)
   - Multi-step form (identity → academics & vibe)
   - Uploads photo (base64)
   - Calls `POST /api/register`
   - Redirects to pass page with `serialId`

2. **Digital Pass** (`/pass/:serialId`)
   - Displays student info
   - Shows QR code (contains serialId, year, status, fee)
   - Calls `GET /api/student/:serialId` on load

3. **Admin Check-in** (`/admin/scan`)
   - Uses HTML5 QRCode scanner
   - Scans QR code
   - Calls `POST /api/checkin/:serial`
   - Shows check-in status and student details

### Admin Panel

1. **Login** (`/admin`)
   - Email: `admin@college.edu`
   - Password: `admin123`
   - Calls `POST /api/admin/login`

2. **Dashboard** (`/admin/dashboard`)
   - View all students
   - Search/filter by name, year, status
   - Edit student details (verification status, fee)
   - Export as CSV
   - Calls `GET /api/students`, `PUT /api/student/:serial`, `GET /api/export`

3. **Scanner** (`/admin/scan`)
   - Scan QR codes for check-ins
   - Shows pending verification warning
   - Real-time feedback

---

## Common Issues & Solutions

### Port 4000 Already in Use

```powershell
# Find process using port 4000
netstat -ano | findstr :4000

# Kill process by PID
taskkill /PID <pid> /F

# Restart server
cd server; npm start
```

### Frontend 404 on `/api/*`

The Vite dev proxy should handle this automatically. If you still see 404:

1. Restart Vite dev server (`Ctrl+C`, then `npm run dev`)
2. Check `vite.config.ts` has the proxy configuration
3. Ensure backend is running on port 4000

### "Cannot find module" errors

Run `npm install` in both root and `server/` directories:

```powershell
npm install
cd server; npm install; cd ..
```

### Database locked or corrupted

Delete `server/data.sqlite` and restart:

```powershell
Remove-Item server/data.sqlite
cd server; npm start
```

A fresh database will be created automatically.

---

## Environment Variables (Optional)

### Frontend

Create a `.env` file in root:

```env
VITE_API_BASE=http://localhost:4000
```

This overrides the default fallback behavior (useful for non-standard setups).

### Backend

Create a `.env` file in `server/`:

```env
PORT=4000
NODE_ENV=development
```

---

## Production Deployment

### Before Deploying

1. **Change admin credentials**:
   - Update `server/index.js` ensureDefaultAdmin() with a strong password
   - Or use environment variable: `process.env.ADMIN_PASSWORD`

2. **Build frontend**:
   ```bash
   npm run build
   ```
   Creates `dist/` folder for deployment.

3. **Prepare backend**:
   - Use managed database (Postgres) instead of SQLite
   - Add session/JWT authentication
   - Configure CORS for your domain
   - Use HTTPS

### Docker Deployment

See `README_DEPLOY.md` for Docker setup with docker-compose.

```bash
docker-compose up --build
```

---

## Development Workflow

### Making Changes

1. **Frontend**: Edit files in `src/`, auto-reload in browser
2. **Backend**: Edit `server/index.js`, restart with `npm start`
3. **Styles**: Edit `src/index.css`, Tailwind utilities auto-compile

### Testing Locally

```powershell
# Terminal 1: Backend
cd server; npm start

# Terminal 2: Frontend
npm run dev

# Terminal 3: Test endpoints
# Register
$payload = @{ enrollmentNo='UNIV001'; fullName='Test'; ... }
Invoke-RestMethod -Method POST -ContentType 'application/json' `
  -Body ($payload | ConvertTo-Json -Depth 5) `
  http://localhost:4000/api/register

# Check admin login
Invoke-RestMethod -Method POST `
  -Body (@{ email='admin@college.edu'; password='admin123' } | ConvertTo-Json) `
  -ContentType 'application/json' `
  http://localhost:4000/api/admin/login
```

---

## File Reference

### Key Frontend Files

- **`src/pages/Register.tsx`**: Registration form (2-step, photo upload)
- **`src/pages/Pass.tsx`**: Digital pass with QR code
- **`src/pages/admin/Login.tsx`**: Admin authentication
- **`src/pages/admin/Dashboard.tsx`**: Student management table
- **`src/pages/admin/Scanner.tsx`**: QR code scanner for check-ins
- **`src/services/mockBackend.ts`**: API client with fallback logic
- **`src/types.ts`**: TypeScript interfaces and enums

### Key Backend Files

- **`server/index.js`**: Express server with all API endpoints
- **`server/db.js`**: SQLite database setup
- **`server/data.sqlite`**: Database file (auto-created)

### Config Files

- **`vite.config.ts`**: Vite dev server config (includes `/api` proxy)
- **`tailwind.config.cjs`**: Tailwind CSS customization
- **`tsconfig.json`**: TypeScript configuration

---

## Support & Documentation

- **API Endpoints**: See `API_DOCUMENTATION.md`
- **Deployment**: See `README_DEPLOY.md`
- **Original README**: See `README.md`

---

## Summary

✅ Fresher Pass is a full-stack event registration system with:
- Multi-step registration form with photo upload
- Digital pass generation with QR codes
- Admin dashboard for verification and check-in
- QR scanner for real-time check-ins
- CSV export for reporting
- SQLite persistent storage
- Responsive design (mobile-first)

The app is ready to deploy locally or to production with minimal configuration changes.

**Happy event planning! 🎉**
