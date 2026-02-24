import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminStudents() {
    const navigate = useNavigate();
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadInterns();
    }, []);

    async function loadInterns() {
        try {
            const data = await api.getInterns();
            setInterns(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    const filtered = interns.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.email.toLowerCase().includes(search.toLowerCase()) ||
        (i.college || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

    return (
        <div>
            <div className="page-header fade-in-up">
                <h1>👥 Registered Students</h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="count-badge" style={{ fontSize: 13, padding: '4px 12px' }}>
                        {interns.length} interns
                    </span>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ padding: '8px 14px', minWidth: 220 }}
                        />
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state fade-in-up">
                    <div className="icon">👥</div>
                    <h3>{search ? 'No matching students' : 'No interns registered yet'}</h3>
                    <p>Students will appear here once they register</p>
                </div>
            ) : (
                <div className="data-table-wrap fade-in-up fade-in-up-1">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>College</th>
                                <th>Duration</th>
                                <th>Interests</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(intern => (
                                <tr
                                    key={intern.id}
                                    className="clickable-row"
                                    onClick={() => navigate(`/admin/students/${intern.id}`)}
                                    title="Click to view student details"
                                >
                                    <td className="cell-primary">{intern.name}</td>
                                    <td className="cell-email">{intern.email}</td>
                                    <td>{intern.phone || '—'}</td>
                                    <td>{intern.college || '—'}</td>
                                    <td>{intern.duration ? `${intern.duration}d` : '—'}</td>
                                    <td>
                                        {intern.interests ? (
                                            <div className="interests-list">
                                                {intern.interests.split(',').map((interest, idx) => (
                                                    <span key={idx} className="interest-tag">{interest.trim()}</span>
                                                ))}
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {new Date(intern.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
