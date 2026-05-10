import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/layout/Layout'

// Public Pages
import HomePage from './pages/public/HomePage'
import JobsPage from './pages/public/JobsPage'
import FreelancersPage from './pages/public/FreelancersPage'
import JobDetailPage from './pages/public/JobDetailPage'
import PricingPage from './pages/public/PricingPage'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage'
import PostJobPage from './pages/dashboard/PostJobPage'
import MyJobsPage from './pages/dashboard/MyJobsPage'
import MyProposalsPage from './pages/dashboard/MyProposalsPage'
import MessagesPage from './pages/dashboard/MessagesPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import SubscriptionPage from './pages/dashboard/SubscriptionPage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminJobsPage from './pages/admin/AdminJobsPage'
import FreelancerProfilePage from './pages/public/FreelancerProfilePage'
import NotificationsPage from './pages/dashboard/NotificationsPage'
import EditJobPage from './pages/dashboard/EditJobPage'
import ManageProposalsPage from './pages/dashboard/ManageProposalsPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />
  return children
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/freelancers" element={<FreelancersPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />


              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />



              {/* Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/post-job" element={<ProtectedRoute allowedRoles={['client']}><PostJobPage /></ProtectedRoute>} />
              <Route path="/my-jobs" element={<ProtectedRoute allowedRoles={['client']}><MyJobsPage /></ProtectedRoute>} />
              <Route path="/proposals" element={<ProtectedRoute allowedRoles={['freelancer']}><MyProposalsPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/messages/:userId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              <Route path="/edit-job/:id" element={<ProtectedRoute allowedRoles={['client']}><EditJobPage /></ProtectedRoute>} />
              <Route path="/dashboard/jobs/:id/proposals" element={<ProtectedRoute allowedRoles={['client']}><ManageProposalsPage /></ProtectedRoute>} />
              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobsPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App