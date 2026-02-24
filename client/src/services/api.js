const API_BASE = '/api';

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
    const data = await res.json();
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
