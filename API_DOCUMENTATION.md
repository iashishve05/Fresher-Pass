# Fresher Pass - API Documentation

This document provides a complete reference for all backend API endpoints and their usage.

## Backend Setup

### Installation

```bash
cd server
npm install
```

### Start Server

```bash
npm start
```

The server will start on `http://localhost:4000` and initialize the SQLite database (`data.sqlite`) with default tables.

**Default Admin Credentials:**
- Email: `admin@college.edu`
- Password: `admin123`

---

## API Endpoints

### Health Check

**GET** `/api/health`

Check if the backend is running.

```bash
curl http://localhost:4000/api/health
```

**Response:**
```json
{
  "ok": true,
  "time": 1704067200000
}
```

---

### Student Registration

**POST** `/api/register`

Register a new student for the event.

**Request Body:**
```json
{
  "enrollmentNo": "UNIV123456",
  "fullName": "John Doe",
  "fatherName": "Robert Doe",
  "dob": "2000-01-15",
  "email": "john@college.edu",
  "year": "1",
  "course": "B.Tech",
  "branch": "CSE",
  "photoUrl": "data:image/jpeg;base64,...",
  "participationInterests": ["Music", "Dance"],
  "feeAmount": "500"
}
```

**Response (201 Created):**
```json
{
  "serialId": "AUR-h8x2k-342",
  "enrollmentNo": "UNIV123456",
  "fullName": "John Doe",
  "verificationStatus": "Pending",
  "checkedIn": false,
  "year": "1",
  "course": "B.Tech",
  "branch": "CSE",
  "email": "john@college.edu",
  "feeAmount": "500",
  "participationInterests": ["Music", "Dance"],
  "createdAt": "2024-01-01T10:30:00.000Z"
}
```

---

### Get All Students

**GET** `/api/students`

Retrieve all registered students (requires admin authentication in production).

**Response:**
```json
[
  {
    "serialId": "AUR-h8x2k-342",
    "enrollmentNo": "UNIV123456",
    "fullName": "John Doe",
    "year": "1",
    "course": "B.Tech",
    "branch": "CSE",
    "email": "john@college.edu",
    "verificationStatus": "Verified",
    "feeAmount": "500",
    "checkedIn": true,
    "checkedInAt": "2024-01-05T18:45:00.000Z",
    "participationInterests": ["Music"]
  }
]
```

---

### Get Student by Serial ID

**GET** `/api/student/:serial`

Retrieve a specific student's details using their serial ID (from QR code).

**Example:**
```bash
curl http://localhost:4000/api/student/AUR-h8x2k-342
```

**Response:**
```json
{
  "serialId": "AUR-h8x2k-342",
  "enrollmentNo": "UNIV123456",
  "fullName": "John Doe",
  "fatherName": "Robert Doe",
  "dob": "2000-01-15",
  "email": "john@college.edu",
  "year": "1",
  "course": "B.Tech",
  "branch": "CSE",
  "photoUrl": "data:image/jpeg;base64,...",
  "verificationStatus": "Verified",
  "feeAmount": "500",
  "checkedIn": true,
  "checkedInAt": "2024-01-05T18:45:00.000Z",
  "participationInterests": ["Music"]
}
```

---

### Update Student

**PUT** `/api/student/:serial`

Update student details (admin only).

**Request Body:**
```json
{
  "verificationStatus": "Verified",
  "feeAmount": "500",
  "checkedIn": false
}
```

**Response:**
```json
{
  "serialId": "AUR-h8x2k-342",
  "enrollmentNo": "UNIV123456",
  "fullName": "John Doe",
  "verificationStatus": "Verified",
  "feeAmount": "500",
  "checkedIn": false,
  "...": "other fields"
}
```

---

### Delete Student

**DELETE** `/api/student/:serial`

Remove a student from the database.

**Response:**
```json
{
  "success": true,
  "student": {
    "serialId": "AUR-h8x2k-342",
    "...": "deleted student data"
  }
}
```

---

### Check-in Student

**POST** `/api/checkin/:serial`

Mark a student as checked in (scanned at event).

**Request Body:**
```json
{
  "checkedIn": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "student": {
    "serialId": "AUR-h8x2k-342",
    "fullName": "John Doe",
    "checkedIn": true,
    "checkedInAt": "2024-01-05T18:45:00.000Z"
  }
}
```

**Response (Warning - Already Checked In):**
```json
{
  "success": false,
  "message": "Already checked in",
  "student": { "..." }
}
```

**Response (Warning - Verification Pending):**
```json
{
  "success": true,
  "warning": true,
  "message": "Warning: Verification is PENDING!",
  "student": { "..." }
}
```

---

### Admin Login

**POST** `/api/admin/login`

Authenticate admin user.

**Request Body:**
```json
{
  "email": "admin@college.edu",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true
}
```

**Response (Failure):**
```json
{
  "success": false
}
```

---

### Search Students

**GET** `/api/search?term=&year=all&status=all`

Search and filter students by name, enrollment, serial ID, year, and verification status.

**Query Parameters:**
- `term` (optional): Search term (name, enrollment, serial ID)
- `year` (optional): Filter by year (1, 2, 3, 4, or 'all')
- `status` (optional): Filter by status ('Pending', 'Verified', or 'all')

**Example:**
```bash
curl "http://localhost:4000/api/search?term=John&year=1&status=Verified"
```

**Response:**
```json
[
  {
    "serialId": "AUR-h8x2k-342",
    "fullName": "John Doe",
    "enrollmentNo": "UNIV123456",
    "year": "1",
    "verificationStatus": "Verified",
    "...": "other fields"
  }
]
```

---

### Export Students as CSV

**GET** `/api/export?term=&year=all&status=all`

Export filtered student records as CSV file.

**Query Parameters:** Same as `/api/search`

**Example:**
```bash
curl "http://localhost:4000/api/export?year=1" -o registrations.csv
```

---

### Get Event Statistics

**GET** `/api/stats`

Get summary statistics about registrations.

**Response:**
```json
{
  "total": 42,
  "checkedIn": 28,
  "pending": 5,
  "byYear": {
    "1": 15,
    "2": 12,
    "3": 10,
    "4": 5
  }
}
```

---

## Frontend Integration

The frontend uses `src/services/mockBackend.ts` to call these endpoints.

### API Candidates (in order of priority)

During development, the frontend tries to reach the API via:

1. **Vite Dev Proxy**: `/api/*` → `http://localhost:4000/api/*` (via `vite.config.ts`)
2. **VITE_API_BASE environment variable**: `${VITE_API_BASE}/api/*`
3. **Fallback**: `http://localhost:4000/api/*` (for production builds)

### Running Frontend with Backend

```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend (dev mode)
cd ..
npm install
npm run dev
```

The Vite dev server (typically on `http://localhost:5173` or `http://localhost:5174`) will proxy `/api/*` requests to the backend automatically.

---

## Error Handling

All endpoints return meaningful error messages. Common error codes:

- **400**: Bad request (missing required fields)
- **401**: Unauthorized (invalid admin credentials)
- **404**: Not found (student not found by serial ID)
- **500**: Server error (database issue, etc.)

**Example Error Response:**
```json
{
  "success": false,
  "error": "Student not found"
}
```

---

## Data Persistence

All data is stored in `server/data.sqlite` (SQLite database).

- **students** table: Stores registration data
- **admin** table: Stores admin credentials (bcrypt hashed)

The database is initialized automatically on server startup.

---

## Security Notes

⚠️ **For Production:**

1. **Change default admin credentials** before deploying
2. **Use environment variables** for sensitive data:
   ```bash
   export ADMIN_PASSWORD="your-strong-password"
   ```
3. **Implement JWT or session-based auth** (currently localStorage-based)
4. **Use HTTPS** for all API calls
5. **Add CORS restrictions** for known frontend domains
6. **Validate file uploads** (currently base64 photos)
7. **Backup the SQLite database** regularly or migrate to Postgres

---

## Testing Endpoints

### Using PowerShell

```powershell
# Health check
Invoke-RestMethod http://localhost:4000/api/health

# Register student
$payload = @{
  enrollmentNo = 'UNIV123456'
  fullName = 'Test User'
  fatherName = 'Father'
  dob = '2000-01-01'
  email = 'test@college.edu'
  year = '1'
  course = 'B.Tech'
  branch = 'CSE'
  participationInterests = @('Music')
  feeAmount = '500'
  photoUrl = ''
}

Invoke-RestMethod -Method POST `
  -Body ($payload | ConvertTo-Json -Depth 5) `
  -ContentType 'application/json' `
  http://localhost:4000/api/register

# Admin login
$creds = @{ email = 'admin@college.edu'; password = 'admin123' }

Invoke-RestMethod -Method POST `
  -Body ($creds | ConvertTo-Json) `
  -ContentType 'application/json' `
  http://localhost:4000/api/admin/login
```

---

## Summary of Changes

- ✅ All registration and login endpoints fully functional
- ✅ SQLite database for persistent storage
- ✅ Vite dev proxy for seamless frontend-backend communication
- ✅ Resilient fetch with fallback candidates
- ✅ Admin dashboard with CRUD operations
- ✅ QR code scanning for check-ins
- ✅ CSV export functionality
- ✅ Real-time statistics

For more details, see the full project README and deployment guide in `README_DEPLOY.md`.
