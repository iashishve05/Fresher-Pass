const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Helper wrappers for sqlite async/await style
function runAsync(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function (err) {
			if (err) return reject(err);
			resolve(this);
		});
	});
}

function getAsync(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) return reject(err);
			resolve(row);
		});
	});
}

function allAsync(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) return reject(err);
			resolve(rows);
		});
	});
}

// Ensure a default admin user exists (demo)
async function ensureDefaultAdmin() {
	try {
		const row = await getAsync('SELECT * FROM admin WHERE email = ?', ['admin@college.edu']);
		if (!row) {
			const hash = bcrypt.hashSync('admin123', 10);
			await runAsync('INSERT INTO admin (email, passwordHash) VALUES (?, ?)', ['admin@college.edu', hash]);
			console.log('Default admin user created: admin@college.edu / admin123');
		}
	} catch (e) {
		console.error('Failed to ensure default admin', e);
	}
}

ensureDefaultAdmin();

// Health
app.get('/api/health', (req, res) => {
	res.json({ ok: true, time: Date.now() });
});

// Get all students
app.get('/api/students', async (req, res) => {
	try {
		const rows = await allAsync('SELECT * FROM students ORDER BY createdAt DESC', []);
		// parse participationInterests JSON
		const mapped = rows.map(r => ({ ...r, participationInterests: r.participationInterests ? JSON.parse(r.participationInterests) : [] , checkedIn: !!r.checkedIn }));
		res.json(mapped);
	} catch (e) {
		res.status(500).json({ error: 'Server error' });
	}
});

// Get student by serial
app.get('/api/student/:serial', async (req, res) => {
	try {
		const serial = req.params.serial;
		const row = await getAsync('SELECT * FROM students WHERE serialId = ?', [serial]);
		if (!row) return res.status(404).json({ error: 'Not found' });
		row.participationInterests = row.participationInterests ? JSON.parse(row.participationInterests) : [];
		row.checkedIn = !!row.checkedIn;
		res.json(row);
	} catch (e) {
		res.status(500).json({ error: 'Server error' });
	}
});

// Register new student
app.post('/api/register', async (req, res) => {
	try {
		const payload = req.body || {};
		const serialId = `AUR-${Date.now().toString(36)}-${Math.floor(Math.random()*900+100)}`;
		const now = new Date().toISOString();
		const interests = JSON.stringify(payload.participationInterests || []);
		await runAsync(`INSERT INTO students (serialId,enrollmentNo,fullName,fatherName,dob,email,year,course,branch,photoUrl,participationInterests,feeAmount,verificationStatus,checkedIn,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,?)`, [
			serialId,
			payload.enrollmentNo || '',
			payload.fullName || '',
			payload.fatherName || '',
			payload.dob || '',
			payload.email || '',
			payload.year || '1',
			payload.course || 'BTech',
			payload.branch || '',
			payload.photoUrl || '',
			interests,
			payload.feeAmount || '0',
			'Pending',
			now
		]);
		const row = await getAsync('SELECT * FROM students WHERE serialId = ?', [serialId]);
		row.participationInterests = JSON.parse(row.participationInterests || '[]');
		row.checkedIn = !!row.checkedIn;
		res.status(201).json(row);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Server error' });
	}
});

// Update student
app.put('/api/student/:serial', async (req, res) => {
	try {
		const serial = req.params.serial;
		const updates = req.body || {};
		const row = await getAsync('SELECT * FROM students WHERE serialId = ?', [serial]);
		if (!row) return res.status(404).json({ error: 'Not found' });
		// Build update statement dynamically for allowed fields
		const allowed = ['enrollmentNo','fullName','fatherName','dob','email','year','course','branch','photoUrl','participationInterests','feeAmount','verificationStatus','checkedIn'];
		const set = [];
		const params = [];
		for (const k of allowed) {
			if (typeof updates[k] !== 'undefined') {
				if (k === 'participationInterests') {
					set.push('participationInterests = ?');
					params.push(JSON.stringify(updates[k]));
				} else if (k === 'checkedIn') {
					set.push('checkedIn = ?');
					params.push(updates[k] ? 1 : 0);
				} else {
					set.push(`${k} = ?`);
					params.push(updates[k]);
				}
			}
		}
		if (set.length === 0) return res.json(row);
		params.push(serial);
		await runAsync(`UPDATE students SET ${set.join(', ')} WHERE serialId = ?`, params);
		const updated = await getAsync('SELECT * FROM students WHERE serialId = ?', [serial]);
		updated.participationInterests = updated.participationInterests ? JSON.parse(updated.participationInterests) : [];
		updated.checkedIn = !!updated.checkedIn;
		res.json(updated);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Server error' });
	}
});

// Delete student
app.delete('/api/student/:serial', async (req, res) => {
	try {
		const serial = req.params.serial;
		const row = await getAsync('SELECT * FROM students WHERE serialId = ?', [serial]);
		if (!row) return res.status(404).json({ success: false, message: 'Not found' });
		await runAsync('DELETE FROM students WHERE serialId = ?', [serial]);
		res.json({ success: true, student: row });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Server error' });
	}
});

// Search students with optional filters: term (name/enrollment/serial), year, status
app.get('/api/search', async (req, res) => {
	try {
		const { term = '', year = 'all', status = 'all' } = req.query || {};
		const q = String(term).toLowerCase();
		const rows = await allAsync('SELECT * FROM students', []);
		const results = rows.filter(s => {
			const matchesTerm = !q || [s.fullName, s.enrollmentNo, s.serialId].some(field => String(field || '').toLowerCase().includes(q));
			const matchesYear = year === 'all' || String(s.year) === String(year);
			const matchesStatus = status === 'all' || String(s.verificationStatus) === String(status);
			return matchesTerm && matchesYear && matchesStatus;
		}).map(r => ({ ...r, participationInterests: r.participationInterests ? JSON.parse(r.participationInterests) : [], checkedIn: !!r.checkedIn }));
		res.json(results);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Server error' });
	}
});

// Export CSV of current filtered students (same filters as /api/search)
app.get('/api/export', async (req, res) => {
	try {
		const { term = '', year = 'all', status = 'all' } = req.query || {};
		const q = String(term).toLowerCase();
		const rows = await allAsync('SELECT * FROM students', []);
		const filtered = rows.filter(s => {
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
			...filtered.map(s => [s.serialId, s.fullName, s.enrollmentNo, s.year, s.course, s.email, s.feeAmount, s.verificationStatus, (s.participationInterests ? JSON.parse(s.participationInterests) : []).join('; '), s.checkedIn ? 'Yes' : 'No'].map(escape).join(','))
		].join('\n');

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="aurora_registrations.csv"');
		res.send(csv);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Server error' });
	}
});

// Admin stats
app.get('/api/stats', async (req, res) => {
	try {
		const rows = await allAsync('SELECT * FROM students', []);
		const total = rows.length;
		const checkedIn = rows.filter(s => s.checkedIn).length;
		const pending = rows.filter(s => s.verificationStatus === 'Pending').length;
		const byYear = rows.reduce((acc, s) => {
			acc[s.year] = (acc[s.year] || 0) + 1;
			return acc;
		}, {});
		res.json({ total, checkedIn, pending, byYear });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Server error' });
	}
});

// Checkin toggle
app.post('/api/checkin/:serial', async (req, res) => {
	try {
		const serial = req.params.serial;
		const row = await getAsync('SELECT * FROM students WHERE serialId = ?', [serial]);
		if (!row) return res.status(200).json({ success: false, message: 'Not found' });
		const student = row;
		if (student.checkedIn) {
			return res.json({ success: false, message: 'Already checked in', student });
		}
		if (student.verificationStatus === 'Pending') {
			return res.json({ success: true, warning: true, message: 'Warning: Verification is PENDING!', student });
		}
		const now = new Date().toISOString();
		await runAsync('UPDATE students SET checkedIn = 1, checkedInAt = ? WHERE serialId = ?', [now, serial]);
		const updated = await getAsync('SELECT * FROM students WHERE serialId = ?', [serial]);
		updated.participationInterests = updated.participationInterests ? JSON.parse(updated.participationInterests) : [];
		updated.checkedIn = !!updated.checkedIn;
		res.json({ success: true, student: updated });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: 'Server error' });
	}
});

// Admin login (uses sqlite admin table)
app.post('/api/admin/login', async (req, res) => {
	try {
		const { email, password } = req.body || {};
		if (!email || !password) return res.status(400).json({ success: false });
		const row = await getAsync('SELECT * FROM admin WHERE email = ?', [email]);
		if (!row) return res.status(401).json({ success: false });
		const ok = bcrypt.compareSync(password, row.passwordHash);
		if (ok) return res.json({ success: true });
		return res.status(401).json({ success: false });
	} catch (e) {
		console.error(e);
		res.status(500).json({ success: false });
	}
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
