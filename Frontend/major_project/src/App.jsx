import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import ProducerDashboard from './pages/producer/ProducerDashboard';
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import useAuthStore from './store/authStore';
import { ToastProvider } from './components/Toast';

function Layout({ children }) {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {user && <Sidebar />}
        <main className="flex-1 overflow-y-auto bg-black p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'ADMIN': return <Navigate to="/admin" replace />;
    case 'PRODUCER': return <Navigate to="/producer" replace />;
    case 'DRIVER': return <Navigate to="/driver" replace />;
    case 'RETAILER': return <Navigate to="/retailer" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <ToastProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout><HomeRedirect /></Layout>} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Producer Routes */}
        <Route
          path="/producer/*"
          element={
            <ProtectedRoute allowedRoles={['PRODUCER', 'ADMIN']}>
              <Layout>
                <ProducerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Driver Routes */}
        <Route
          path="/driver/*"
          element={
            <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']}>
              <Layout>
                <DriverDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Retailer Routes */}
        <Route
          path="/retailer/*"
          element={
            <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
              <Layout>
                <RetailerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
}
