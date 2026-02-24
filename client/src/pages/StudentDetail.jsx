import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudent();
    }, [id]);

    async function loadStudent() {
        try {
            const data = await api.getIntern(id);
            setStudent(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
    if (!student) return (
        <div className="empty-state">
            <div className="icon">❌</div>
            <h3>Student not found</h3>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/students')}>← Back to Students</button>
        </div>
    );

    return (
        <div>
            <div className="page-header fade-in-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/students')}>← Back</button>
                    <h1>👤 {student.name}</h1>
                </div>
            </div>

            {/* Student Profile Card */}
            <div className="student-profile-card fade-in-up fade-in-up-1">
                <div className="student-profile-grid">
                    <div className="profile-field">
                        <span className="profile-label">📧 Email</span>
                        <span className="profile-value">{student.email}</span>
                    </div>
                    <div className="profile-field">
                        <span className="profile-label">📱 Phone</span>
                        <span className="profile-value">{student.phone || '—'}</span>
                    </div>
                    <div className="profile-field">
                        <span className="profile-label">🏫 College</span>
                        <span className="profile-value">{student.college || '—'}</span>
                    </div>
                    <div className="profile-field">
                        <span className="profile-label">📅 Duration</span>
                        <span className="profile-value">{student.duration ? `${student.duration} days` : '—'}</span>
                    </div>
                    <div className="profile-field">
                        <span className="profile-label">💡 Interests</span>
                        <span className="profile-value">
                            {student.interests ? (
                                <span className="interests-inline">
                                    {student.interests.split(',').map((i, idx) => (
                                        <span key={idx} className="interest-tag">{i.trim()}</span>
                                    ))}
                                </span>
                            ) : '—'}
                        </span>
                    </div>
                    <div className="profile-field">
                        <span className="profile-label">📆 Joined</span>
                        <span className="profile-value">{new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Enrolled Programs */}
            <div className="fade-in-up fade-in-up-2" style={{ marginTop: 28 }}>
                <div className="section-header">
                    <h2>
                        <span className="section-icon">🎓</span>
                        Enrolled Programs
                    </h2>
                    <span className="count-badge">{student.Enrollment?.length || 0}</span>
                </div>

                {(!student.Enrollment || student.Enrollment.length === 0) ? (
                    <div className="empty-state">
                        <div className="icon">📋</div>
                        <h3>No enrollments yet</h3>
                        <p>This student hasn't enrolled in any programs</p>
                    </div>
                ) : (
                    <div className="enrollment-detail-list">
                        {student.Enrollment.map(enr => {
                            const tasks = enr.UserProgress || [];
                            const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
                            const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
                            const totalTasks = tasks.length;
                            const pct = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

                            return (
                                <div key={enr.id} className="enrollment-detail-card">
                                    <div className="enrollment-detail-header">
                                        <div>
                                            <h3>📚 {enr.program?.title}</h3>
                                            <div className="enrollment-meta">
                                                {enr.program?.domain && <span>🏷️ {enr.program.domain}</span>}
                                                <span>📅 {enr.program?.durationDays} days</span>
                                                <span className={`status-chip ${enr.status.toLowerCase()}`}>{enr.status}</span>
                                            </div>
                                        </div>
                                        <div className="enrollment-pct">
                                            <span className="pct-value">{pct}%</span>
                                            <span className="pct-label">Complete</span>
                                        </div>
                                    </div>

                                    <div className="progress-bar-wrap" style={{ marginBottom: 16 }}>
                                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                                    </div>

                                    <div className="enrollment-task-summary">
                                        <span className="task-stat completed-stat">✅ {completedCount} Completed</span>
                                        <span className="task-stat progress-stat">🔄 {inProgressCount} In Progress</span>
                                        <span className="task-stat pending-stat">⏳ {totalTasks - completedCount - inProgressCount} Pending</span>
                                    </div>

                                    {/* Task list */}
                                    {totalTasks > 0 && (
                                        <div className="student-task-list">
                                            {tasks
                                                .sort((a, b) => (a.task?.orderIndex || 0) - (b.task?.orderIndex || 0))
                                                .map(tp => (
                                                    <div key={tp.id} className="student-task-row">
                                                        <div className={`task-status-dot ${tp.status.toLowerCase().replace('_', '-')}`} />
                                                        <div className="task-info">
                                                            <span className="task-title">{tp.task?.title}</span>
                                                            <span className="task-type">{tp.task?.type}</span>
                                                        </div>
                                                        <span className={`task-status-badge ${tp.status.toLowerCase().replace('_', '-')}`}>
                                                            {tp.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
