import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProgramDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [program, setProgram] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [enrollment, setEnrollment] = useState(null);
    const [progress, setProgress] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [inviteToken, setInviteToken] = useState('');
    const [taskForm, setTaskForm] = useState({ title: '', description: '', type: 'READING', contentUrl: '', mandatory: true, orderIndex: 0 });

    useEffect(() => { loadProgram(); }, [id]);

    async function loadProgram() {
        try {
            const p = await api.getProgram(id);
            setProgram(p);
            setTasks(p.Task || []);

            if (user.role === 'INTERN') {
                const enrollments = await api.getMyEnrollments();
                const matching = enrollments.find(e => e.programId === id);
                if (matching) {
                    setEnrollment(matching);
                    const prog = await api.getProgress(matching.id);
                    setProgress(prog);
                }
            }
        } catch (e) { console.error(e); }
    }

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.createTask(id, taskForm);
            setShowTaskModal(false);
            setTaskForm({ title: '', description: '', type: 'READING', contentUrl: '', mandatory: true, orderIndex: 0 });
            loadProgram();
        } catch (err) { alert(err.message || 'Failed to create task'); }
    };

    const handleMarkComplete = async (taskId) => {
        try {
            await api.markComplete(taskId);
            loadProgram();
        } catch (err) { alert(err.message || 'Failed to mark complete'); }
    };

    const handleGenerateInvite = async () => {
        try {
            const data = await api.generateInvite(id);
            setInviteToken(data.inviteToken);
        } catch (err) { alert(err.message || 'Failed to generate invite'); }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            await api.deleteTask(taskId);
            loadProgram();
        } catch (err) { alert(err.message || 'Failed to delete'); }
    };

    if (!program) return <div className="loading-screen"><div className="spinner" /></div>;

    const isAdmin = user.role === 'ADMIN';
    const isMentor = user.role === 'MENTOR';
    const canManage = isAdmin || isMentor;

    return (
        <div>
            <div className="page-header fade-in-up">
                <div>
                    <h1>📚 {program.title}</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                        {program.description || 'No description'} • {program.domain && `${program.domain} • `}{program.durationDays} days
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {canManage && <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>+ Add Task</button>}
                    {isAdmin && <button className="btn btn-secondary btn-sm" onClick={handleGenerateInvite}>Generate Invite</button>}
                </div>
            </div>

            {inviteToken && (
                <div className="fade-in-up" style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Share this invite token with interns:</p>
                    <div className="invite-box">{inviteToken}</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(inviteToken); }}>
                        📋 Copy Token
                    </button>
                </div>
            )}

            {/* Progress bar for interns */}
            {progress && (
                <div className="fade-in-up fade-in-up-1" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                        <span>Your Progress</span>
                        <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{progress.percentage}%</span>
                    </div>
                    <div className="progress-bar-wrap" style={{ height: 12 }}>
                        <div className="progress-bar-fill" style={{ width: `${progress.percentage}%` }} />
                    </div>
                </div>
            )}

            {/* Tasks */}
            <div className="fade-in-up fade-in-up-2">
                <div className="section-header">
                    <h2>
                        <span className="section-icon">📝</span>
                        Tasks
                    </h2>
                    <span className="count-badge">{tasks.length}</span>
                </div>

                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📝</div>
                        <h3>No tasks yet</h3>
                        <p>{canManage ? 'Add tasks to this program' : 'Tasks will appear here once added'}</p>
                    </div>
                ) : (
                    <div className="task-list">
                        {tasks.map(task => {
                            const taskProgress = progress?.tasks?.find(t => t.id === task.id)?.progress;
                            const isCompleted = taskProgress?.status === 'COMPLETED';
                            return (
                                <div key={task.id} className="task-item">
                                    {user.role === 'INTERN' && enrollment && (
                                        <div
                                            className={`task-check ${isCompleted ? 'completed' : ''}`}
                                            onClick={() => !isCompleted && handleMarkComplete(task.id)}
                                        />
                                    )}
                                    <div className="task-info">
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-type">{task.type}{task.contentUrl && ' • 🔗 Resource'}</div>
                                        {task.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{task.description}</p>}
                                    </div>
                                    {task.contentUrl && (
                                        <a href={task.contentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" onClick={e => e.stopPropagation()}>
                                            Open ↗
                                        </a>
                                    )}
                                    {canManage && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task.id)}>×</button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Task Modal */}
            {showTaskModal && (
                <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>📝 Add Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div className="form-group">
                                <label>Title</label>
                                <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required placeholder="Task title" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="What should the intern do?" />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={taskForm.type} onChange={e => setTaskForm({ ...taskForm, type: e.target.value })}>
                                    <option value="VIDEO">Video (YouTube)</option>
                                    <option value="READING">Reading</option>
                                    <option value="QUIZ">Quiz / Assignment</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Resource URL (YouTube link, article, etc.)</label>
                                <input value={taskForm.contentUrl} onChange={e => setTaskForm({ ...taskForm, contentUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                            </div>
                            <div className="form-group">
                                <label>Order Index</label>
                                <input type="number" value={taskForm.orderIndex} onChange={e => setTaskForm({ ...taskForm, orderIndex: parseInt(e.target.value) })} min="0" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
