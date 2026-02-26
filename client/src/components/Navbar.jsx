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
    const isIntern = user?.role === 'INTERN';

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
                {!isIntern && <NavLink to="/programs" onClick={closeMenu}>Programs</NavLink>}
                {isAdmin && <NavLink to="/admin/students" onClick={closeMenu}>Students</NavLink>}
                {isAdmin && <NavLink to="/admin/resources" onClick={closeMenu}>Resources</NavLink>}
                {/* Mobile-only: user info inside hamburger menu */}
                <div className="navbar-user-mobile">
                    <div className="user-mobile-info">
                        <span className="user-name">{user?.name}</span>
                        <span className={`role-badge ${roleClass}`}>{user?.role}</span>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { handleLogout(); closeMenu(); }}>Logout</button>
                </div>
            </div>

            <div className="navbar-user navbar-user-desktop">
                <span className="user-name">{user?.name}</span>
                <span className={`role-badge ${roleClass}`}>{user?.role}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
}
