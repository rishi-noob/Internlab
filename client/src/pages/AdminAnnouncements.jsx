import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ANNOUNCEMENT_TYPES = ['GENERAL', 'EVENT', 'MEETING', 'URGENT'];

export default function AdminAnnouncements() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', type: 'GENERAL' });
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadAnnouncements(); }, []);

    async function loadAnnouncements() {
        try {
            const data = await api.getAnnouncements();
            setAnnouncements(data);
        } catch (e) { console.error(e); }
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;
        setLoading(true);
        try {
            await api.createAnnouncement(form);
            setShowModal(false);
            setForm({ title: '', content: '', type: 'GENERAL' });
            loadAnnouncements();
        } catch (err) {
            alert(err.message || 'Failed to create announcement');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await api.deleteAnnouncement(id);
            loadAnnouncements();
        } catch (err) {
            alert(err.message || 'Failed to delete');
        }
    };

    const typeIcon = (type) => {
        switch (type) {
            case 'EVENT': return '🎉';
            case 'MEETING': return '📅';
            case 'URGENT': return '🚨';
            default: return '📢';
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div>
            <div className="page-header fade-in-up">
                <div>
                    <h1>📢 Announcements</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                        Broadcast announcements to all interns on the platform
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Announcement
                </button>
            </div>

            {announcements.length === 0 ? (
                <div className="empty-state fade-in-up fade-in-up-1">
                    <div className="icon">📢</div>
                    <h3>No announcements yet</h3>
                    <p>Create your first announcement to broadcast to all interns</p>
                </div>
            ) : (
                <div className="announcement-list fade-in-up fade-in-up-1">
                    {announcements.map(a => (
                        <div key={a.id} className={`announcement-card announcement-${a.type.toLowerCase()}`}>
                            <div className="announcement-header">
                                <div className="announcement-type-badge">
                                    {typeIcon(a.type)} {a.type}
                                </div>
                                <span className="announcement-time">{timeAgo(a.createdAt)}</span>
                            </div>
                            <h3 className="announcement-title">{a.title}</h3>
                            <p className="announcement-content">{a.content}</p>
                            <div className="announcement-footer">
                                <span className="announcement-author">By {a.createdBy?.name || 'Admin'}</span>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(a.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Announcement Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>📢 New Announcement</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    required
                                    placeholder="Announcement title"
                                />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    required
                                    placeholder="Write your announcement here..."
                                    rows={4}
                                />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                >
                                    {ANNOUNCEMENT_TYPES.map(t => (
                                        <option key={t} value={t}>
                                            {typeIcon(t)} {t.charAt(0) + t.slice(1).toLowerCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Publishing...' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
