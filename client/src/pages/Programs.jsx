import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Programs() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', domain: '', durationDays: 30, startDate: '', endDate: '' });

    useEffect(() => { loadPrograms(); }, []);

    async function loadPrograms() {
        try {
            const data = await api.getPrograms();
            setPrograms(data);
        } catch (e) { console.error(e); }
    }

    const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.createProgram(form);
            setShowModal(false);
            setForm({ title: '', description: '', domain: '', durationDays: 30, startDate: '', endDate: '' });
            loadPrograms();
        } catch (err) { alert(err.message || 'Failed to create program'); }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this program?')) return;
        try {
            await api.deleteProgram(id);
            loadPrograms();
        } catch (err) { alert(err.message || 'Failed to delete'); }
    };

    return (
        <div>
            <div className="page-header fade-in-up">
                <h1>🎓 Programs</h1>
                {user.role === 'ADMIN' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        + New Program
                    </button>
                )}
            </div>

            {programs.length === 0 ? (
                <div className="empty-state fade-in-up">
                    <div className="icon">🎓</div>
                    <h3>No programs yet</h3>
                    <p>Create your first internship program to get started</p>
                </div>
            ) : (
                <div className="card-grid fade-in-up fade-in-up-1">
                    {programs.map(p => (
                        <div key={p.id} className="card" onClick={() => navigate(`/programs/${p.id}`)}>
                            <h3>📚 {p.title}</h3>
                            <p>{p.description || 'No description provided'}</p>
                            <div className="card-meta">
                                {p.domain && <span>🏷️ {p.domain}</span>}
                                <span>📅 {p.durationDays} days</span>
                                <span>📝 {p._count?.Task || 0} tasks</span>
                                <span>👥 {p._count?.Enrollment || 0} enrolled</span>
                            </div>
                            {user.role === 'ADMIN' && (
                                <div style={{ marginTop: 14 }}>
                                    <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(p.id, e)}>Delete</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Program Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>🎓 Create New Program</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Title</label>
                                <input value={form.title} onChange={update('title')} required placeholder="Web Development Internship" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={form.description} onChange={update('description')} placeholder="Program description..." />
                            </div>
                            <div className="form-group">
                                <label>Domain</label>
                                <input value={form.domain} onChange={update('domain')} placeholder="e.g. Frontend, Backend, Design" />
                            </div>
                            <div className="form-group">
                                <label>Duration (days)</label>
                                <input type="number" value={form.durationDays} onChange={update('durationDays')} min="1" required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input type="date" value={form.startDate} onChange={update('startDate')} required />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input type="date" value={form.endDate} onChange={update('endDate')} required />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Program</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
