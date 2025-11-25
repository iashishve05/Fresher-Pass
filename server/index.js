const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
	try {
		const raw = fs.readFileSync(DATA_FILE, 'utf8');
		if (!raw) return [];
		return JSON.parse(raw);
	} catch (e) {
		return [];
	}
}

function writeData(data) {
	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Health
app.get('/api/health', (req, res) => {
	res.json({ ok: true, time: Date.now() });
});

// Get all students
app.get('/api/students', (req, res) => {
	const data = readData();
	res.json(data);
});

// Get student by serial
app.get('/api/student/:serial', (req, res) => {
	const serial = req.params.serial;
	const data = readData();
	const student = data.find(s => s.serialId === serial);
	if (!student) return res.status(404).json({ error: 'Not found' });
	res.json(student);
});

// Register new student
app.post('/api/register', (req, res) => {
	const payload = req.body || {};
	const data = readData();
	const serialId = `AUR-${Date.now().toString(36)}-${Math.floor(Math.random()*900+100)}`;
	const newStudent = {
		serialId,
		enrollmentNo: payload.enrollmentNo || '',
		fullName: payload.fullName || '',
		fatherName: payload.fatherName || '',
		dob: payload.dob || '',
		email: payload.email || '',
		year: payload.year || '1',
		course: payload.course || 'BTech',
		branch: payload.branch || '',
		photoUrl: payload.photoUrl || '',
		participationInterests: payload.participationInterests || [],
		feeAmount: payload.feeAmount || '0',
		verificationStatus: 'Pending',
		checkedIn: false,
		createdAt: new Date().toISOString()
	};
	data.push(newStudent);
	writeData(data);
	res.status(201).json(newStudent);
});

// Update student
app.put('/api/student/:serial', (req, res) => {
	const serial = req.params.serial;
	const updates = req.body || {};
	const data = readData();
	const idx = data.findIndex(s => s.serialId === serial);
	if (idx === -1) return res.status(404).json({ error: 'Not found' });
	data[idx] = { ...data[idx], ...updates };
	writeData(data);
	res.json(data[idx]);
});

// Delete student
app.delete('/api/student/:serial', (req, res) => {
	const serial = req.params.serial;
	const data = readData();
	const idx = data.findIndex(s => s.serialId === serial);
	if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
	const removed = data.splice(idx, 1)[0];
	writeData(data);
	res.json({ success: true, student: removed });
});

// Search students with optional filters: term (name/enrollment/serial), year, status
app.get('/api/search', (req, res) => {
	const { term = '', year = 'all', status = 'all' } = req.query || {};
	const q = String(term).toLowerCase();
	const data = readData();
	const results = data.filter(s => {
		const matchesTerm = !q || [s.fullName, s.enrollmentNo, s.serialId].some(field => String(field || '').toLowerCase().includes(q));
		const matchesYear = year === 'all' || String(s.year) === String(year);
		const matchesStatus = status === 'all' || String(s.verificationStatus) === String(status);
		return matchesTerm && matchesYear && matchesStatus;
	});
	res.json(results);
});

// Export CSV of current filtered students (same filters as /api/search)
app.get('/api/export', (req, res) => {
	const { term = '', year = 'all', status = 'all' } = req.query || {};
	const q = String(term).toLowerCase();
	const data = readData();
	const filtered = data.filter(s => {
		const matchesTerm = !q || [s.fullName, s.enrollmentNo, s.serialId].some(field => String(field || '').toLowerCase().includes(q));
		const matchesYear = year === 'all' || String(s.year) === String(year);
		const matchesStatus = status === 'all' || String(s.verificationStatus) === String(status);
		return matchesTerm && matchesYear && matchesStatus;
	});

	const headers = ['Serial ID', 'Name', 'Enrollment', 'Year', 'Course', 'Email', 'Fee', 'Status', 'Interests', 'Checked In'];
	const escape = (val) => {
		const str = String(val ?? '');
		if (str.includes(',') || str.includes('"') || str.includes('\n')) {
			return '"' + str.replace(/"/g, '""') + '"';
		}
		return str;
	};

	const csv = [
		headers.join(','),
		...filtered.map(s => [s.serialId, s.fullName, s.enrollmentNo, s.year, s.course, s.email, s.feeAmount, s.verificationStatus, (s.participationInterests || []).join('; '), s.checkedIn ? 'Yes' : 'No'].map(escape).join(','))
	].join('\n');

	res.setHeader('Content-Type', 'text/csv');
	res.setHeader('Content-Disposition', 'attachment; filename="aurora_registrations.csv"');
	res.send(csv);
});

// Admin stats
app.get('/api/stats', (req, res) => {
	const data = readData();
	const total = data.length;
	const checkedIn = data.filter(s => s.checkedIn).length;
	const pending = data.filter(s => s.verificationStatus === 'Pending').length;
	const byYear = data.reduce((acc, s) => {
		acc[s.year] = (acc[s.year] || 0) + 1;
		return acc;
	}, {});
	res.json({ total, checkedIn, pending, byYear });
});

// Checkin toggle
app.post('/api/checkin/:serial', (req, res) => {
	const serial = req.params.serial;
	const data = readData();
	const idx = data.findIndex(s => s.serialId === serial);
	if (idx === -1) return res.status(200).json({ success: false, message: 'Not found' });

	const student = data[idx];
	// If already checked in
	if (student.checkedIn) {
		return res.json({ success: false, message: 'Already checked in', student });
	}

	// If verification pending, return a warning but do not mark checked in
	if (student.verificationStatus === 'Pending') {
		return res.json({ success: true, warning: true, message: 'Warning: Verification is PENDING!', student });
	}

	// Normal flow: mark checked in
	student.checkedIn = true;
	student.checkedInAt = new Date().toISOString();
	data[idx] = student;
	writeData(data);
	res.json({ success: true, student });
});

// Admin login (demo only)
app.post('/api/admin/login', (req, res) => {
	const { email, password } = req.body || {};
	// Demo credentials
	if (email === 'admin@college.edu' && password === 'admin123') {
		return res.json({ success: true });
	}
	res.status(401).json({ success: false });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
