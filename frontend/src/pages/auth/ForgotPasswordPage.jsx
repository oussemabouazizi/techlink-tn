import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { MailIcon, ArrowLeftIcon } from '../../components/ui/Icons';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for a password reset link.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '440px', padding: '2rem' }}>
        <div className="auth-header">
          <h1>Forgot Password?</h1>
          <p>Enter your email and we'll send you a reset link</p>
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
            <label className="form-label">Email Address</label>
            <div className="relative">
              <MailIcon size={18} className="input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-semibold">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" /> Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="inline-flex items-center gap-1">
            <ArrowLeftIcon size={14} /> Back to login
          </Link>
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
          padding-right: var(--space-4);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          font-size: var(--text-base);
          transition: all 0.2s ease;
          background: var(--bg-primary);
          height: 44px;
        }
        .input-icon {
          position: absolute;
          left: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          z-index: 10;
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