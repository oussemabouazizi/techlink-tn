import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { Briefcase, FileText, TrendingUp, Clock, CheckCircle, MessageSquare, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalProposals: 0,
    pendingProposals: 0,
    completedJobs: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'client') {
          const { data } = await api.get('/jobs?limit=100&client=true');
          const jobs = data.jobs || []; // ✅ extract the array
          const active = jobs.filter(j => j.status === 'open').length;
          const completed = jobs.filter(j => j.status === 'completed').length;
          setStats({
            totalJobs: jobs.length,
            activeJobs: active,
            completedJobs: completed,
            totalProposals: 0,
            pendingProposals: 0,
            earnings: 0
          });
        } else if (user?.role === 'freelancer') {
          const { data: proposals } = await api.get('/proposals/my');
          const pending = proposals.filter(p => p.status === 'pending').length;
          const accepted = proposals.filter(p => p.status === 'accepted').length;
          setStats({
            totalProposals: proposals.length,
            pendingProposals: pending,
            completedJobs: accepted,
            earnings: 0,
            totalJobs: 0,
            activeJobs: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="loading-spinner" style={{ margin: 'var(--space-20) auto' }} />;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-welcome">
          <h1>Welcome back, {user?.full_name || 'User'}!</h1>
          <p>Here's what's happening with your account today.</p>
        </div>

        <div className="dashboard-stats-grid">
          {user?.role === 'client' ? (
            <>
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><Briefcase size={24} /></div>
                <div className="stat-value">{stats.totalJobs}</div>
                <div className="stat-label">Total Jobs</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-green"><Clock size={24} /></div>
                <div className="stat-value">{stats.activeJobs}</div>
                <div className="stat-label">Active Jobs</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-yellow"><CheckCircle size={24} /></div>
                <div className="stat-value">{stats.completedJobs}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple"><TrendingUp size={24} /></div>
                <div className="stat-value">0 TND</div>
                <div className="stat-label">Total Spent</div>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><FileText size={24} /></div>
                <div className="stat-value">{stats.totalProposals}</div>
                <div className="stat-label">Proposals Sent</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-green"><Clock size={24} /></div>
                <div className="stat-value">{stats.pendingProposals}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-yellow"><CheckCircle size={24} /></div>
                <div className="stat-value">{stats.completedJobs}</div>
                <div className="stat-label">Completed Jobs</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple"><TrendingUp size={24} /></div>
                <div className="stat-value">{stats.earnings} TND</div>
                <div className="stat-label">Earnings</div>
              </div>
            </>
          )}
        </div>

        <div className="dashboard-quick-actions">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            {user?.role === 'client' ? (
              <>
                <Link to="/post-job" className="quick-action-card">
                  <Briefcase size={24} className="mx-auto mb-2 text-primary" />
                  <span>Post a Job</span>
                </Link>
                <Link to="/my-jobs" className="quick-action-card">
                  <FileText size={24} className="mx-auto mb-2" />
                  <span>My Jobs</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/jobs" className="quick-action-card">
                  <Briefcase size={24} className="mx-auto mb-2 text-primary" />
                  <span>Find Work</span>
                </Link>
                <Link to="/proposals" className="quick-action-card">
                  <FileText size={24} className="mx-auto mb-2" />
                  <span>My Proposals</span>
                </Link>
              </>
            )}
            <Link to="/messages" className="quick-action-card">
              <MessageSquare size={24} className="mx-auto mb-2" />
              <span>Messages</span>
            </Link>
            <Link to="/profile" className="quick-action-card">
              <Users size={24} className="mx-auto mb-2" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}