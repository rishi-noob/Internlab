import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const roleClass = user?.role?.toLowerCase() || 'intern';
    const isAdmin = user?.role === 'ADMIN';

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="brand-dot" />
                Intern<span>Lab</span>
            </div>
            <div className="navbar-links">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/programs">Programs</NavLink>
                {isAdmin && <NavLink to="/admin/students">Students</NavLink>}
                {isAdmin && <NavLink to="/admin/resources">Resources</NavLink>}
            </div>
            <div className="navbar-user">
                <span className="user-name">{user?.name}</span>
                <span className={`role-badge ${roleClass}`}>{user?.role}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
}
