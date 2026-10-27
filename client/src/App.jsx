import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import VenueDetail from './pages/VenueDetail.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

// Protected Route wrapper for authenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking session authorization..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Protected Route wrapper for admin role
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Verifying administrator credentials..." />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />

              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/venues/:id" element={<VenueDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Player Protected Routes */}
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />

                  {/* 404 Catch All */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
