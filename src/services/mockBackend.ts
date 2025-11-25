// Lightweight API layer that calls the backend server at /api.
// If the backend is not available, some functions will fallback to localStorage to keep the app usable.

// Use Vite env if provided; keep TS happy by casting import.meta to any
// Resolve API base order:
// 1. If VITE_API_BASE is set, use that.
// 2. Try relative `/api` (works when backend is proxied or served from same origin).
// 3. Fallback to http://localhost:4000 for local development.
const ENV_API_BASE = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_BASE : '') || '';
const FALLBACK_LOCAL = 'http://localhost:4000';

async function safeFetch(path: string, opts: RequestInit = {}) {
	const candidates: string[] = [];
	if (ENV_API_BASE) candidates.push(`${ENV_API_BASE}/api`);
	// try relative first so deployed builds that serve API under same origin work
	candidates.push('');
	candidates.push(`${FALLBACK_LOCAL}/api`);

	let lastErr: any = null;
	for (const base of candidates) {
		const url = base ? `${base}${path}` : `/api${path}`;
		try {
			const res = await fetch(url, {
				headers: { 'Content-Type': 'application/json' },
				...opts,
			});
				if (!res.ok) {
					// If this was the relative `/api` attempt and it returned a client error (like 404),
					// it often means the dev server isn't proxying /api — try the next candidate instead
					if (base === '' && res.status >= 400 && res.status < 500) {
						lastErr = new Error(`Candidate ${url} returned ${res.status}`);
						// try next candidate
						await new Promise((r) => setTimeout(r, 100));
						continue;
					}
					const text = await res.text();
					// Return structured error to caller for non-recoverable responses
					throw new Error(text || res.statusText || `Request failed: ${res.status}`);
				}
			return await res.json();
		} catch (err) {
			// If it's a network error (connection refused), try next candidate.
			lastErr = err;
			// small delay for transient errors when trying next candidate
			await new Promise((r) => setTimeout(r, 150));
			continue;
		}
	}
	// After trying all candidates, throw the last error so UI can show a friendly message
	throw lastErr || new Error('Network request failed');
}

export async function getStudents() {
	return await safeFetch('/students');
}

export async function getStudentBySerial(serial: string) {
	return await safeFetch(`/student/${encodeURIComponent(serial)}`);
}

export async function registerStudent(payload: any) {
	return await safeFetch('/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateStudent(serial: string, updates: any) {
	return await safeFetch(`/student/${encodeURIComponent(serial)}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function checkInStudent(serial: string, checkedIn?: boolean) {
	return await safeFetch(`/checkin/${encodeURIComponent(serial)}`, { method: 'POST', body: JSON.stringify({ checkedIn }) });
}

export async function adminLogin(email: string, password: string) {
	try {
		const res = await safeFetch('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
		if (res && res.success) {
			localStorage.setItem('aurora_admin', '1');
			return true;
		}
		return false;
	} catch (e) {
		return false;
	}
}

export function isAdminLoggedIn() {
	return !!localStorage.getItem('aurora_admin');
}

export function adminLogout() {
	localStorage.removeItem('aurora_admin');
}

export function notifyAdminPendingScan(student?: any) {
	// No-op for now. Keep as an async function to match callers that expect a Promise
	// `student` is accepted so callers can pass context; we might later send emails/webhooks.
	return Promise.resolve();
}

// Keep backwards-compatible exports (some files import checkInStudent, etc.)
export default {
	getStudents,
	getStudentBySerial,
	registerStudent,
	updateStudent,
	checkInStudent,
	adminLogin,
	isAdminLoggedIn,
	adminLogout,
	notifyAdminPendingScan,
};
