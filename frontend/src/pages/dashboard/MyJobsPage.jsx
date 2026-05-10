import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { PlusIcon, EyeIcon, TrashIcon, EditIcon, UsersIcon } from '../../components/ui/Icons';

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyJobs = async () => {
    try {
      const { data } = await api.get('/jobs/my');   // ✅ protected route
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter(j => j.id !== id));
      alert('Job deleted');
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const getStatusColor = (status) => {
    const colors = { open: 'badge-success', in_progress: 'badge-info', completed: 'badge-gray', draft: 'badge-warning', canceled: 'badge-error' };
    return colors[status] || 'badge-gray';
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="page-header"><h1>My Jobs</h1><p>Manage your job postings</p></div>
        <Link to="/post-job" className="btn btn-primary flex items-center gap-2"><PlusIcon size={18} /> Post New Job</Link>
      </div>
      {jobs.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📌</div><div className="empty-state-title">No jobs posted yet</div><Link to="/post-job" className="btn btn-primary">Post Your First Job</Link></div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Job</th><th>Status</th><th>Proposals</th><th>Budget</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td><div><p className="font-medium">{job.title}</p><p className="text-xs text-gray-500">{new Date(job.created_at).toLocaleDateString()}</p></div></td>
                  <td><span className={`badge ${getStatusColor(job.status)}`}>{job.status}</span></td>
                  <td><div className="flex items-center gap-1"><UsersIcon size={14} /> {job.proposal_count || 0}</div></td>
                  <td>{job.budget_min && job.budget_max ? `${job.budget_min} - ${job.budget_max} TND` : 'Negotiable'}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/jobs/${job.id}`} className="text-gray-400 hover:text-primary"><EyeIcon size={16} /> View</Link>
                      <Link to={`/edit-job/${job.id}`} className="text-gray-400 hover:text-primary"><EditIcon size={16} /> Edit</Link>
                      <button onClick={() => handleDelete(job.id)} className="text-gray-400 hover:text-red-600"><TrashIcon size={16} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}