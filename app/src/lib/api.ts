// Django REST API client
const API_BASE = 'http://localhost:8000/api';

async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
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
  login: (username: string, password: string) => fetchApi('/auth/login/', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data: Record<string, unknown>) => fetchApi('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => fetchApi('/auth/logout/', { method: 'POST' }),
  upgrade: (plan: 'free' | 'regular' | 'premium') => fetchApi('/users/upgrade/', { method: 'POST', body: JSON.stringify({ plan }) }),
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
  getMembers: (id: number) => fetchApi(`/circles/${id}/members/`),
};

// Schedules
export const scheduleApi = {
  upcoming: () => fetchApi('/schedules/upcoming/'),
  live: () => fetchApi('/schedules/live/'),
  create: (data: Record<string, unknown>) => fetchApi('/schedules/', { method: 'POST', body: JSON.stringify(data) }),
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
};

// Slides
export const slideApi = {
  list: () => fetchApi('/slides/'),
  create: (data: Record<string, unknown>) => fetchApi('/slides/', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => fetchApi(`/slides/${id}/`, { method: 'DELETE' }),
};
