import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const INTEREST_OPTIONS = [
    'Web Development', 'Mobile Dev', 'AI / ML', 'Data Science',
    'UI/UX Design', 'Cloud & DevOps', 'Cybersecurity', 'Blockchain',
    'IoT', 'Game Dev', 'Backend', 'Frontend'
];

export default function Register() {
    const { register } = useAuth();
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        phone: '', college: '', duration: '30', interests: []
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const toggleInterest = (interest) => {
        setForm(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                college: form.college,
                duration: parseInt(form.duration) || 30,
                interests: form.interests.join(', ')
            });
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="animated-bg" />
            <div className="auth-card" style={{ maxWidth: 520 }}>
                <div className="brand-area">
                    <div className="brand-icon">🎓</div>
                    <h1>Create Account</h1>
                    <p className="subtitle">Join InternLab to kickstart your internship journey</p>
                </div>
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={form.name} onChange={update('name')} placeholder="John Doe" required />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={form.email} onChange={update('email')} placeholder="you@email.com" required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Min 6 characters" required minLength={6} />
                                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                                    {showPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+91 9876543210" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>College / University</label>
                            <input type="text" value={form.college} onChange={update('college')} placeholder="Your institution" />
                        </div>
                        <div className="form-group">
                            <label>Internship Duration (days)</label>
                            <input type="number" value={form.duration} onChange={update('duration')} placeholder="30" min="1" max="365" />
                        </div>
                    </div>


                    <div className="form-group">
                        <label>Your Interests</label>
                        <div className="chip-group">
                            {INTEREST_OPTIONS.map(interest => (
                                <span
                                    key={interest}
                                    className={`chip ${form.interests.includes(interest) ? 'selected' : ''}`}
                                    onClick={() => toggleInterest(interest)}
                                >
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
