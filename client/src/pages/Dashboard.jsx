import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);

    const loadData = useCallback(async () => {
        try {
            if (user.role === 'ADMIN' || user.role === 'MENTOR') {
                const progs = await api.getPrograms();
                setPrograms(progs);
            }

            if (user.role === 'ADMIN') {
                try {
                    const s = await api.getAdminStats();
                    setStats(s);
                } catch (e) {
                    console.error('Failed to load admin stats:', e);
                }
            }
            if (user.role === 'INTERN') {
                try {
                    const enr = await api.getMyEnrollments();
                    setEnrollments(enr);
                } catch (e) {
                    console.error('Failed to load enrollments:', e);
                }
            }
        } catch (e) {
            console.error('Failed to load dashboard data:', e);
        }
    }, [user.role]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEnroll = async () => {
        if (!joinCode.trim()) return;
        setJoinError('');
        setJoining(true);
        try {
            await api.enroll(joinCode.trim());
            setShowJoinModal(false);
            setJoinCode('');
            loadData();
        } catch (e) {
            setJoinError(e.message || 'Enrollment failed. Please check your code and try again.');
        } finally {
            setJoining(false);
        }
    };

    const isAdmin = user.role === 'ADMIN';
    const isIntern = user.role === 'INTERN';

    return (
        <div>
            {/* Welcome Banner */}
            <div className="dashboard-welcome fade-in-up">
                <h1>Welcome, <span className="greeting-name">{user.name}</span> 👋</h1>
                <p>Here's your InternLab overview</p>
                {isIntern && (
                    <div className="welcome-meta">
                        {user.college && <span>🏫 {user.college}</span>}
                        {user.duration && <span>📅 {user.duration} day internship</span>}
                        {user.interests && <span>💡 {user.interests}</span>}
                    </div>
                )}
            </div>

            {/* Admin Stats — Expanded 6-card layout */}
            {isAdmin && stats && (
                <div className="stats-grid stats-grid-6 fade-in-up fade-in-up-1">
                    <div className="stat-card accent-bar">
                        <div className="stat-icon accent">👥</div>
                        <div className="stat-label">Total Learners</div>
                        <div className="stat-value accent">{stats.totalLearners}</div>
                    </div>
                    <div className="stat-card blue-bar">
                        <div className="stat-icon blue">⏳</div>
                        <div className="stat-label">Yet to Start</div>
                        <div className="stat-value blue">{stats.yetToStart}</div>
                    </div>
                    <div className="stat-card warning-bar">
                        <div className="stat-icon warning">🔄</div>
                        <div className="stat-label">In Progress</div>
                        <div className="stat-value warning">{stats.inProgress}</div>
                    </div>
                    <div className="stat-card success-bar">
                        <div className="stat-icon success">✅</div>
                        <div className="stat-label">Completed</div>
                        <div className="stat-value success">{stats.completed}</div>
                    </div>
                    <div className="stat-card accent-bar">
                        <div className="stat-icon accent">📊</div>
                        <div className="stat-label">Avg. Progress</div>
                        <div className="stat-value accent">{stats.avgProgress}%</div>
                    </div>
                    <div className="stat-card blue-bar">
                        <div className="stat-icon blue">⚡</div>
                        <div className="stat-label">Avg. Time Spent</div>
                        <div className="stat-value blue">{stats.avgTimeSpent}d</div>
                    </div>
                </div>
            )}

            {/* Intern Enrollments */}
            {isIntern && (
                <div className="fade-in-up fade-in-up-2">
                    <div className="section-header">
                        <h2>
                            <span className="section-icon">📋</span>
                            My Enrollments
                        </h2>
                        <button className="btn btn-primary btn-sm" onClick={() => { setShowJoinModal(true); setJoinCode(''); setJoinError(''); }}>
                            + Join Program
                        </button>
                    </div>
                    {enrollments.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">📋</div>
                            <h3>No enrollments yet</h3>
                            <p>Use an invite code to join a program and start your journey</p>
                        </div>
                    ) : (
                        <div className="card-grid">
                            {enrollments.map(enr => {
                                const completed = enr.UserProgress?.filter(p => p.status === 'COMPLETED').length || 0;
                                const total = enr.program?._count?.Task || enr.UserProgress?.length || 0;
                                const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
                                return (
                                    <div key={enr.id} className="card" onClick={() => navigate(`/programs/${enr.programId}`)}>
                                        <h3>📚 {enr.program?.title}</h3>
                                        <p>Status: <strong style={{ color: enr.status === 'ACTIVE' ? 'var(--success-light)' : 'var(--text-muted)' }}>{enr.status}</strong></p>
                                        <div className="progress-bar-wrap">
                                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="card-meta">
                                            <span>✅ {completed}/{total} tasks</span>
                                            <span>📊 {pct}% complete</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Programs Overview for Admin/Mentor */}
            {(isAdmin || user.role === 'MENTOR') && (
                <div className="fade-in-up fade-in-up-4" style={{ marginTop: 28 }}>
                    <div className="section-header">
                        <h2>
                            <span className="section-icon">🎓</span>
                            Programs
                        </h2>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/programs')}>
                            View All →
                        </button>
                    </div>
                    {programs.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">🎓</div>
                            <h3>No programs yet</h3>
                            <p>Create your first internship program</p>
                        </div>
                    ) : (
                        <div className="card-grid">
                            {programs.slice(0, 4).map(p => (
                                <div key={p.id} className="card" onClick={() => navigate(`/programs/${p.id}`)}>
                                    <h3>📚 {p.title}</h3>
                                    <p>{p.description || 'No description'}</p>
                                    <div className="card-meta">
                                        {p.domain && <span>🏷️ {p.domain}</span>}
                                        <span>📅 {p.durationDays} days</span>
                                        <span>📝 {p._count?.Task || 0} tasks</span>
                                        <span>👥 {p._count?.Enrollment || 0} enrolled</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Join Program Modal */}
            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal join-modal" onClick={e => e.stopPropagation()}>
                        <h2>🎓 Join a Program</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                            Enter the invite code shared by your admin to enroll in a program.
                        </p>
                        {joinError && (
                            <div className="error-msg" style={{ marginBottom: 16 }}>
                                {joinError}
                            </div>
                        )}
                        <div className="form-group">
                            <label>Invite Code</label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="e.g. AB3K7X"
                                maxLength={8}
                                autoFocus
                                className="invite-code-input"
                                onKeyDown={e => e.key === 'Enter' && handleEnroll()}
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowJoinModal(false)}>Cancel</button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleEnroll}
                                disabled={!joinCode.trim() || joining}
                            >
                                {joining ? 'Joining...' : 'Join Program'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
