// Django REST API client – falls back to localhost in development
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000') + '/api';

let csrfToken: string | null = null;

async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const method = (options.method ?? 'GET').toUpperCase();
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    headers.set('X-CSRFToken', csrfToken);
  }

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Auth
export const authApi = {
  me: () => fetchApi('/auth/me/'),
  login: async (username: string, password: string) => {
    const res = await fetchApi('/auth/login/', { method: 'POST', body: JSON.stringify({ username, password }) });
    if (res && res.token) {
      localStorage.setItem('auth_token', res.token);
    }
    return res;
  },
  register: async (data: Record<string, unknown>) => {
    const res = await fetchApi('/auth/register/', { method: 'POST', body: JSON.stringify(data) });
    if (res && res.token) {
      localStorage.setItem('auth_token', res.token);
    }
    return res;
  },
  logout: async () => {
    try {
      await fetchApi('/auth/logout/', { method: 'POST' });
    } finally {
      localStorage.removeItem('auth_token');
    }
  },
  upgrade: (plan: 'free' | 'regular' | 'premium') => fetchApi('/users/upgrade/', { method: 'POST', body: JSON.stringify({ plan }) }),
  googleAuth: async (credential: string) => {
    const res = await fetchApi('/auth/google/', { method: 'POST', body: JSON.stringify({ credential }) });
    if (res && res.token) {
      localStorage.setItem('auth_token', res.token);
    }
    return res;
  },
  verifyPayment: (transactionId: string, plan: 'regular' | 'premium') => fetchApi('/users/verify-payment/', { method: 'POST', body: JSON.stringify({ transaction_id: transactionId, plan }) }),
  cancelSubscription: () => fetchApi('/users/cancel-subscription/', { method: 'POST' }),
  updateProfile: (data: Record<string, unknown>) => fetchApi('/users/update/', { method: 'PATCH', body: JSON.stringify(data) }),
  fetchCsrfToken: async () => {
    try {
      const data = await fetchApi('/auth/csrf/');
      csrfToken = data.csrfToken;
      return csrfToken;
    } catch (e) {
      console.error('Failed to fetch CSRF token', e);
      return null;
    }
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    const res = await fetch(`${API_BASE}/users/upload/`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },
};

// Testimonies
export const testimonyApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/testimonies/${qs}`);
  },
  getById: (id: number) => fetchApi(`/testimonies/${id}/`),
  create: (data: Record<string, unknown>) => fetchApi('/testimonies/', { method: 'POST', body: JSON.stringify(data) }),
  amen: (id: number) => fetchApi(`/testimonies/${id}/amen/`, { method: 'POST' }),
  incrementView: (id: number) => fetchApi(`/testimonies/${id}/increment_view/`, { method: 'POST' }),
  pending: () => fetchApi('/testimonies/pending/'),
  approve: (id: number) => fetchApi(`/testimonies/${id}/approve/`, { method: 'POST' }),
  decline: (id: number) => fetchApi(`/testimonies/${id}/decline/`, { method: 'POST' }),
  stats: () => fetchApi('/testimonies/stats/'),
};

// Prayers
export const prayerApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/prayers/${qs}`);
  },
  answered: () => fetchApi('/prayers/answered/'),
  create: (data: Record<string, unknown>) => fetchApi('/prayers/', { method: 'POST', body: JSON.stringify(data) }),
  prayFor: (id: number) => fetchApi(`/prayers/${id}/pray_for/`, { method: 'POST' }),
  checkPrayed: (id: number) => fetchApi(`/prayers/${id}/check_prayed/`),
  markAnswered: (id: number) => fetchApi(`/prayers/${id}/mark_answered/`, { method: 'POST' }),
  stats: () => fetchApi('/prayers/stats/'),
};

// Circles
export const circleApi = {
  list: () => fetchApi('/circles/'),
  get: (id: number) => fetchApi(`/circles/${id}/`),
  join: (id: number) => fetchApi(`/circles/${id}/join/`, { method: 'POST' }),
  leave: (id: number) => fetchApi(`/circles/${id}/leave/`, { method: 'POST' }),
  checkMembership: (id: number) => fetchApi(`/circles/${id}/check_membership/`),
  create: (data: Record<string, unknown>) => fetchApi('/circles/', { method: 'POST', body: JSON.stringify(data) }),
  getMessages: (id: number) => fetchApi(`/circles/${id}/messages/`),
  postMessage: (id: number, content: string) => fetchApi(`/circles/${id}/messages/`, { method: 'POST', body: JSON.stringify({ content }) }),
  postMessageWithImage: async (id: number, content: string, image: File) => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('image', image);
    const headers: Record<string, string> = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    const res = await fetch(`${API_BASE}/circles/${id}/messages/`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  },
  reactToMessage: (circleId: number, messageId: number, reactionType: string) =>
    fetchApi(`/circles/${circleId}/messages/${messageId}/react/`, { method: 'POST', body: JSON.stringify({ reaction_type: reactionType }) }),
  getMembers: (id: number) => fetchApi(`/circles/${id}/members/`),
};

// Schedules
export const scheduleApi = {
  upcoming: () => fetchApi('/schedules/upcoming/'),
  live: () => fetchApi('/schedules/live/'),
  past: () => fetchApi('/schedules/past/'),
  get: (id: number | string) => fetchApi(`/schedules/${id}/`),
  create: (data: Record<string, unknown>) => fetchApi('/schedules/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => fetchApi(`/schedules/${id}/`, { method: 'DELETE' }),
  joinRoom: (id: number | string, peerId?: string) => fetchApi(`/schedules/${id}/join/`, { method: 'POST', body: JSON.stringify({ peer_id: peerId }) }),
  leaveRoom: (id: number | string) => fetchApi(`/schedules/${id}/leave/`, { method: 'POST' }),
  sendHeartbeat: (id: number | string, peerId?: string) => fetchApi(`/schedules/${id}/heartbeat/`, { method: 'POST', body: JSON.stringify({ peer_id: peerId }) }),
  syncRoom: (id: number | string, lastMsgId?: string | number, lastReactId?: string | number, lastSequence?: number) => 
    fetchApi(`/schedules/${id}/sync/?last_message_id=${lastMsgId || ''}&last_reaction_id=${lastReactId || ''}&last_sequence=${lastSequence !== undefined ? lastSequence : ''}`),
  sendLiveMessage: (id: number | string, text: string) => 
    fetchApi(`/schedules/${id}/send_message/`, { method: 'POST', body: JSON.stringify({ text }) }),
  sendLiveReaction: (id: number | string, emoji: string, label: string) => 
    fetchApi(`/schedules/${id}/send_reaction/`, { method: 'POST', body: JSON.stringify({ emoji, label }) }),
  toggleCoModerator: (id: number | string, userId: number | string) => 
    fetchApi(`/schedules/${id}/toggle_co_moderator/`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
  uploadAudio: async (id: number | string, sequence: number, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('sequence', sequence.toString());
    formData.append('audio', audioBlob, 'audio.webm');
    
    const headers: Record<string, string> = {};
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    const res = await fetch(`${API_BASE}/schedules/${id}/upload_audio/`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload error' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  },
};

// Forum
export const forumApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/forum/${qs}`);
  },
  getTopic: (id: number) => fetchApi(`/forum/${id}/`),
  createTopic: (data: Record<string, unknown>) => fetchApi('/forum/', { method: 'POST', body: JSON.stringify(data) }),
  getReplies: (id: number) => fetchApi(`/forum/${id}/replies/`),
  addReply: (id: number, content: string) => fetchApi(`/forum/${id}/add_reply/`, { method: 'POST', body: JSON.stringify({ content }) }),
};

// Comments
export const commentApi = {
  list: (targetType: string, targetId: number) =>
    fetchApi(`/comments/?target_type=${targetType}&target_id=${targetId}`),
  create: (data: Record<string, unknown>) => fetchApi('/comments/', { method: 'POST', body: JSON.stringify(data) }),
};

// Admin
export const adminApi = {
  stats: () => fetchApi('/admin/stats/'),
  users: () => fetchApi('/admin/users/'),
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    const res = await fetch(`${API_BASE}/admin/upload/`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  }
};

// Slides
export const slideApi = {
  list: () => fetchApi('/slides/'),
  create: (data: Record<string, unknown>) => fetchApi('/slides/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => fetchApi(`/slides/${id}/`, { method: 'DELETE' }),
};
