export const API_BASE =
   process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

const NGROK_HEADER: Record<string, string> = API_BASE.includes('ngrok')
   ? { 'ngrok-skip-browser-warning': 'true' }
   : {};

// ─── Token helpers ────────────────────────────────────────────────────────

export function getToken(): string | null {
   if (typeof window === 'undefined') return null;
   return localStorage.getItem('fgz_token');
}

export function setToken(token: string): void {
   localStorage.setItem('fgz_token', token);
}

export function clearToken(): void {
   localStorage.removeItem('fgz_token');
}

// ─── Response handler ─────────────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<T> {
   const contentType = response.headers.get('content-type');
   const isJson = contentType?.includes('application/json');

   if (!response.ok) {
      let errorMessage: string;
      if (isJson) {
         try {
            const errorData = await response.json();
            errorMessage =
               errorData.error || errorData.message || response.statusText;
         } catch {
            errorMessage = response.statusText;
         }
      } else {
         try {
            errorMessage = await response.text();
         } catch {
            errorMessage = response.statusText;
         }
      }
      throw new Error(errorMessage);
   }

   if (
      response.status === 204 ||
      response.headers.get('content-length') === '0'
   ) {
      return undefined as T;
   }

   if (!isJson) {
      const text = await response.text();
      return text as unknown as T;
   }

   return response.json();
}

function authHeaders(includeAuth = true): Record<string, string> {
   const token = includeAuth ? getToken() : null;
   return {
      'Content-Type': 'application/json',
      ...NGROK_HEADER,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
   };
}

// ─── HTTP methods ─────────────────────────────────────────────────────────

export async function apiGet<T>(
   url: string,
   options?: { signal?: AbortSignal }
): Promise<T> {
   const response = await fetch(`${API_BASE}${url}`, {
      method: 'GET',
      headers: authHeaders(),
      signal: options?.signal,
   });
   return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
   const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
   });
   return handleResponse<T>(response);
}

export async function apiAuthPost<T>(path: string, body: unknown): Promise<T> {
   const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(false),
      body: JSON.stringify(body),
   });
   return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
   const response = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
   });
   return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
   const response = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
   });
   return handleResponse<T>(response);
}
