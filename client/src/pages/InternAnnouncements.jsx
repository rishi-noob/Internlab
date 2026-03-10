import { useState, useEffect } from 'react';
import api from '../services/api';

export default function InternAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    async function loadAnnouncements() {
        try {
            const data = await api.getAnnouncements();
            setAnnouncements(data);
        } catch (e) {
            console.error('Failed to load announcements:', e);
        } finally {
            setLoading(false);
        }
    }

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

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header fade-in-up">
                <div>
                    <h1>📢 Announcements</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                        Stay updated with the latest announcements from your admin
                    </p>
                </div>
                <span className="count-badge">{announcements.length}</span>
            </div>

            {announcements.length === 0 ? (
                <div className="empty-state fade-in-up fade-in-up-1">
                    <div className="icon">📢</div>
                    <h3>No announcements yet</h3>
                    <p>Check back later for updates from your admin</p>
                </div>
            ) : (
                <div className="announcement-list fade-in-up fade-in-up-1">
                    {announcements.map(a => (
                        <div
                            key={a.id}
                            className={`announcement-card announcement-${a.type.toLowerCase()} announcement-clickable`}
                            onClick={() => setSelectedAnnouncement(a)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && setSelectedAnnouncement(a)}
                        >
                            <div className="announcement-header">
                                <div className="announcement-type-badge">
                                    {typeIcon(a.type)} {a.type}
                                </div>
                                <span className="announcement-time">{timeAgo(a.createdAt)}</span>
                            </div>
                            <h3 className="announcement-title">{a.title}</h3>
                            <p className="announcement-content announcement-preview">
                                {a.content.length > 120 ? a.content.slice(0, 120) + '...' : a.content}
                            </p>
                            <div className="announcement-footer">
                                <span className="announcement-author">By {a.createdBy?.name || 'Admin'}</span>
                                <span className="announcement-read-more">Click to read more →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Announcement Detail Popup Modal */}
            {selectedAnnouncement && (
                <div className="modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
                    <div className="modal announcement-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-close-btn" onClick={() => setSelectedAnnouncement(null)} title="Close">
                            ✕
                        </div>
                        <div className="announcement-detail-header">
                            <div className={`announcement-type-badge announcement-badge-${selectedAnnouncement.type.toLowerCase()}`}>
                                {typeIcon(selectedAnnouncement.type)} {selectedAnnouncement.type}
                            </div>
                        </div>
                        <h2 className="announcement-detail-title">{selectedAnnouncement.title}</h2>
                        <div className="announcement-detail-meta">
                            <span>👤 {selectedAnnouncement.createdBy?.name || 'Admin'}</span>
                            <span>🕐 {formatDate(selectedAnnouncement.createdAt)}</span>
                        </div>
                        <div className="announcement-detail-content">
                            {selectedAnnouncement.content}
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setSelectedAnnouncement(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
