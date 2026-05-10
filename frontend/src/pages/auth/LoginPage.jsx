import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon } from '../../components/ui/Icons';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      addToast('Login successful! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="static-accent-left"></div>
      <div className="auth-card" style={{ maxWidth: '440px', padding: '2rem' }}>
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Log in to your TechLink TN account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            {/* Fixed Icon Container */}
            <div className="icon-input-container">
              <MailIcon size={18} className="input-icon" />
              <input
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            {/* Fixed Icon Container with Toggle */}
            <div className="icon-input-container password-input-container">
              <LockIcon size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input ${errors.password ? 'input-error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-icon"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-base font-semibold" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-spinner-sm inline-block"></span> Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold hover:underline">Sign up free</Link>
        </div>
      </div>

      <style>{`
        /* Fixed Icon Container Styling */
        .icon-input-container {
          position: relative;
          width: 100%;
        }

        /* Input with Icon Padding */
        .icon-input-container .input {
          padding-left: var(--space-8); /* Matches icon + spacing */
          width: 100%;
        }

        /* Password Input Extra Right Padding */
        .password-input-container .input {
          padding-right: var(--space-8); /* For toggle icon */
        }

        /* Fixed Icon Positioning */
        .input-icon {
          position: absolute;
          left: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          z-index: 10; /* Ensures icon is visible */
        }

        /* Fixed Password Toggle Positioning */
        .password-toggle-icon {
          position: absolute;
          right: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          z-index: 10; /* Ensures toggle is visible */
        }

        .password-toggle-icon:hover {
          color: var(--primary-600);
        }

        .loading-spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}