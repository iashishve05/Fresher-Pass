// Lightweight API layer that calls the backend server at /api.
// If the backend is not available, some functions will fallback to localStorage to keep the app usable.

// Use Vite env if provided; keep TS happy by casting import.meta to any
const API_BASE = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_API_BASE : '') || '';

async function safeFetch(path: string, opts: RequestInit = {}) {
	const url = `${API_BASE}/api${path}`;
	try {
		const res = await fetch(url, {
			headers: { 'Content-Type': 'application/json' },
			...opts,
		});
		if (!res.ok) {
			const text = await res.text();
			throw new Error(text || res.statusText || 'Request failed');
		}
		return await res.json();
	} catch (e) {
		// Re-throw for now, frontend will handle errors
		throw e;
	}
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
