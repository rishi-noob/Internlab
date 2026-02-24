import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import AdminStudents from './pages/AdminStudents';
import StudentDetail from './pages/StudentDetail';
import AdminResources from './pages/AdminResources';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
    return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
    if (!user) return <Navigate to="/login" />;
    return user.role === 'ADMIN' ? children : <Navigate to="/dashboard" />;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
    return !user ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
    const { user } = useAuth();
    return (
        <>
            {user && <Navbar />}
            <main className={user ? 'main-content' : ''}>
                <Routes>
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/programs" element={<PrivateRoute><Programs /></PrivateRoute>} />
                    <Route path="/programs/:id" element={<PrivateRoute><ProgramDetail /></PrivateRoute>} />
                    <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
                    <Route path="/admin/students/:id" element={<AdminRoute><StudentDetail /></AdminRoute>} />
                    <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </main>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
