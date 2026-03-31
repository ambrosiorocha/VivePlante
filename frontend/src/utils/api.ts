/**
 * Authenticated fetch utility for admin API calls.
 * Automatically injects the JWT Bearer token from localStorage.
 * Redirects to /admin login page on 401/403.
 */

export const API_BASE = 'http://localhost:8000';

export function getAdminToken(): string | null {
    return localStorage.getItem('admin_token');
}

export function clearAdminSession(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
}

/**
 * Drop-in replacement for fetch() for admin API calls.
 * Automatically sends Authorization: Bearer <token> header.
 * Redirects to /admin if the server responds with 401 or 403.
 */
export async function authFetch(
    path: string,
    options: RequestInit = {},
): Promise<Response> {
    const token = getAdminToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
        clearAdminSession();
        // Use replace so the browser back button doesn't loop
        window.location.replace('/admin');
    }

    return res;
}
