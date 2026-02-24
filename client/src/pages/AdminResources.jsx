import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminResources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', url: '', description: '', category: 'Article' });

    useEffect(() => {
        loadResources();
    }, []);

    async function loadResources() {
        try {
            const data = await api.getResources();
            setResources(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.createResource(form);
            setShowModal(false);
            setForm({ title: '', url: '', description: '', category: 'Article' });
            loadResources();
        } catch (err) { alert(err.message || 'Failed to create resource'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this resource?')) return;
        try {
            await api.deleteResource(id);
            loadResources();
        } catch (err) { alert(err.message || 'Failed to delete'); }
    };

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header fade-in-up">
                <h1>📖 Resources & Links</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Resource
                </button>
            </div>

            {resources.length === 0 ? (
                <div className="empty-state fade-in-up">
                    <div className="icon">📖</div>
                    <h3>No resources yet</h3>
                    <p>Add articles, videos, and links for interns to explore</p>
                </div>
            ) : (
                <div className="resources-grid fade-in-up fade-in-up-1">
                    {resources.map(r => (
                        <div key={r.id} className="resource-card" style={{ cursor: 'default', position: 'relative' }}>
                            <div className="resource-icon">
                                {r.category === 'Video' ? '🎬' : r.category === 'Tool' ? '🛠️' : r.category === 'Course' ? '🎓' : '📄'}
                            </div>
                            <div className="resource-info">
                                <a href={r.url} target="_blank" rel="noopener noreferrer" className="resource-title" style={{ color: 'var(--text-primary)' }}>
                                    {r.title} ↗
                                </a>
                                {r.description && <div className="resource-desc">{r.description}</div>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                    {r.category && <span className="resource-category">{r.category}</span>}
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        by {r.createdBy?.name} • {new Date(r.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="btn btn-danger btn-icon btn-sm"
                                onClick={() => handleDelete(r.id)}
                                title="Delete"
                                style={{ flexShrink: 0, alignSelf: 'flex-start' }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Resource Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>📎 Add Resource</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Title</label>
                                <input value={form.title} onChange={update('title')} required placeholder="e.g. Introduction to React" />
                            </div>
                            <div className="form-group">
                                <label>URL</label>
                                <input value={form.url} onChange={update('url')} required placeholder="https://..." type="url" />
                            </div>
                            <div className="form-group">
                                <label>Description (optional)</label>
                                <textarea value={form.description} onChange={update('description')} placeholder="Brief description of this resource..." />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={form.category} onChange={update('category')}>
                                    <option value="Article">Article</option>
                                    <option value="Video">Video</option>
                                    <option value="Course">Course</option>
                                    <option value="Tool">Tool</option>
                                    <option value="Documentation">Documentation</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Resource</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
