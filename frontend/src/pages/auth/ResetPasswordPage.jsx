import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { LockIcon, EyeIcon, EyeOffIcon } from '../../components/ui/Icons';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    }
    setLoading(false);
  };

  if (error && !message && !loading) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: '440px', padding: '2rem' }}>
          <div className="auth-header">
            <h1>Link Expired or Invalid</h1>
            <p>{error}</p>
          </div>
          <div className="auth-footer">
            <Link to="/forgot-password">Request a new reset link →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '440px', padding: '2rem' }}>
        <div className="auth-header">
          <h1>Create New Password</h1>
          <p>Enter your new password below</p>
        </div>

        {message && (
          <div className="alert alert-success mb-4" style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e' }}>
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-error mb-4" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="relative">
              <LockIcon size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input password-input"
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
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="relative">
              <LockIcon size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input password-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-semibold">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" /> Updating...
              </span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Back to login</Link>
        </div>
      </div>

      <style>{`
        .form-group {
          margin-bottom: var(--space-6);
        }
        .relative {
          position: relative;
          width: 100%;
        }
        .input {
          width: 100%;
          padding-left: var(--space-8);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          font-size: var(--text-base);
          transition: all 0.2s ease;
          background: var(--bg-primary);
          height: 44px;
        }
        .password-input {
          padding-right: var(--space-8);
        }
        .input-icon {
          position: absolute;
          left: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          z-index: 10;
        }
        .password-toggle-icon {
          position: absolute;
          right: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--gray-400);
          transition: color 0.2s;
        }
        .password-toggle-icon:hover {
          color: var(--primary-600);
        }
        .input:focus {
          outline: none;
          border-color: var(--primary-400);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .alert-success {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: #166534;
        }
        .alert-error {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: #991b1b;
        }
      `}</style>
    </div>
  );
}