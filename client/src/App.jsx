import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Lazy-loaded pages for code-splitting / faster initial load
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Programs = lazy(() => import('./pages/Programs'));
const ProgramDetail = lazy(() => import('./pages/ProgramDetail'));
const AdminStudents = lazy(() => import('./pages/AdminStudents'));
const StudentDetail = lazy(() => import('./pages/StudentDetail'));
const AdminResources = lazy(() => import('./pages/AdminResources'));
const AdminAnnouncements = lazy(() => import('./pages/AdminAnnouncements'));
const InternAnnouncements = lazy(() => import('./pages/InternAnnouncements'));
const InternResources = lazy(() => import('./pages/InternResources'));

const PageLoader = () => (
    <div className="loading-screen"><div className="spinner" /></div>
);

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" />;
    return user.role === 'ADMIN' ? children : <Navigate to="/dashboard" />;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <PageLoader />;
    return !user ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
    const { user } = useAuth();
    return (
        <>
            {user && <Navbar />}
            <main className={user ? 'main-content' : ''}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
                        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/programs" element={<PrivateRoute><Programs /></PrivateRoute>} />
                        <Route path="/programs/:id" element={<PrivateRoute><ProgramDetail /></PrivateRoute>} />

                        {/* Intern-facing pages */}
                        <Route path="/announcements" element={<PrivateRoute><InternAnnouncements /></PrivateRoute>} />
                        <Route path="/resources" element={<PrivateRoute><InternResources /></PrivateRoute>} />

                        {/* Admin-only pages */}
                        <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
                        <Route path="/admin/students/:id" element={<AdminRoute><StudentDetail /></AdminRoute>} />
                        <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
                        <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />

                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Suspense>
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
