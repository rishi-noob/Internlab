const API_BASE =
    import.meta.env.VITE_API_URL ||
    // Fallback for deployed frontend if env var is missing
    (typeof window !== 'undefined' && window.location.hostname === 'internlabtoe.vercel.app'
        ? 'https://intern-lab-server1.onrender.com/api'
        : '/api');

function getHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function request(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: { ...getHeaders(), ...options.headers },
    });
    const text = await res.text();
    const contentType = res.headers.get('content-type') || '';
    let data = {};

    if (text) {
        if (contentType.includes('application/json')) {
            try {
                data = JSON.parse(text);
            } catch {
                throw {
                    status: res.status,
                    message: 'Server returned invalid JSON. Please try again or contact support.',
                };
            }
        } else {
            // Non‑JSON response (likely an HTML error page from the hosting provider)
            throw {
                status: res.status,
                message: text.slice(0, 200) || 'Server returned a non‑JSON response.',
            };
        }
    }

    if (!res.ok) throw { status: res.status, ...data };
    return data;
}

export const api = {
    // Auth
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => request('/auth/me'),

    // Programs
    getPrograms: () => request('/programs'),
    getProgram: (id) => request(`/programs/${id}`),
    createProgram: (body) => request('/programs', { method: 'POST', body: JSON.stringify(body) }),
    updateProgram: (id, body) => request(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteProgram: (id) => request(`/programs/${id}`, { method: 'DELETE' }),

    // Tasks
    getTasks: (programId) => request(`/programs/${programId}/tasks`),
    createTask: (programId, body) => request(`/programs/${programId}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
    updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

    // Enrollments
    getMyEnrollments: () => request('/enrollments/my'),
    getAllEnrollments: () => request('/enrollments'),
    enroll: (inviteToken) => request('/enrollments', { method: 'POST', body: JSON.stringify({ inviteToken }) }),
    extendEnrollment: (id, days) => request(`/enrollments/${id}/extend`, { method: 'PUT', body: JSON.stringify({ days }) }),

    // Progress
    markComplete: (taskId, submissionUrl) => request(`/progress/${taskId}/complete`, { method: 'POST', body: JSON.stringify({ submissionUrl }) }),
    submitWork: (taskId, submissionUrl) => request(`/progress/${taskId}/submit`, { method: 'POST', body: JSON.stringify({ submissionUrl }) }),
    getProgress: (enrollmentId) => request(`/progress/enrollment/${enrollmentId}`),
    getStats: () => request('/progress/stats'),

    // Invite
    generateInvite: (programId) => request('/auth/invite', { method: 'POST', body: JSON.stringify({ programId }) }),

    // Resources (NEW)
    getResources: () => request('/resources'),
    createResource: (body) => request('/resources', { method: 'POST', body: JSON.stringify(body) }),
    deleteResource: (id) => request(`/resources/${id}`, { method: 'DELETE' }),

    // Admin (NEW)
    getInterns: () => request('/admin/interns'),
    getIntern: (id) => request(`/admin/interns/${id}`),
    getAdminStats: () => request('/admin/stats'),
};

export default api;
