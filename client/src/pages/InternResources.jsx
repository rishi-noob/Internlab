import { useState, useEffect } from 'react';
import api from '../services/api';

export default function InternResources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResources();
    }, []);

    async function loadResources() {
        try {
            const data = await api.getResources();
            setResources(data);
        } catch (e) {
            console.error('Failed to load resources:', e);
        } finally {
            setLoading(false);
        }
    }

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
                    <h1>📖 Resources & Articles</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                        Helpful resources and articles shared by your admin
                    </p>
                </div>
                <span className="count-badge">{resources.length}</span>
            </div>

            {resources.length === 0 ? (
                <div className="empty-state fade-in-up fade-in-up-1">
                    <div className="icon">📖</div>
                    <h3>No resources yet</h3>
                    <p>Check back later for helpful resources from your admin</p>
                </div>
            ) : (
                <div className="resources-grid fade-in-up fade-in-up-1">
                    {resources.map(r => (
                        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="resource-card">
                            <div className="resource-icon">
                                {r.category === 'Video' ? '🎬' : r.category === 'Tool' ? '🛠️' : '📄'}
                            </div>
                            <div className="resource-info">
                                <div className="resource-title">{r.title}</div>
                                {r.description && <div className="resource-desc">{r.description}</div>}
                                {r.category && <div className="resource-category">{r.category}</div>}
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
