import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeMenu = () => setMenuOpen(false);

    const roleClass = user?.role?.toLowerCase() || 'intern';
    const isAdmin = user?.role === 'ADMIN';

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="brand-dot" />
                Intern<span>Lab</span>
            </div>

            <button
                className={`nav-toggle ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation"
            >
                <span />
                <span />
                <span />
            </button>

            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
                <NavLink to="/programs" onClick={closeMenu}>Programs</NavLink>
                {isAdmin && <NavLink to="/admin/students" onClick={closeMenu}>Students</NavLink>}
                {isAdmin && <NavLink to="/admin/resources" onClick={closeMenu}>Resources</NavLink>}
            </div>

            <div className="navbar-user">
                <span className="user-name">{user?.name}</span>
                <span className={`role-badge ${roleClass}`}>{user?.role}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
}
