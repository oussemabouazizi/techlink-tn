import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';
import { ArrowLeftIcon, PlusIcon } from '../../components/ui/Icons';

export default function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget_min: '',
    budget_max: '',
    budget_type: 'fixed',
    duration: '',
    skills_required: '',
    category_id: '',
    deadline: '',
    type: '', // Added job type
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/jobs/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          requirements: data.requirements || '',
          budget_min: data.budget_min || '',
          budget_max: data.budget_max || '',
          budget_type: data.budget_type || 'fixed',
          duration: data.duration || '',
          skills_required: data.skills_required?.join(', ') || '',
          category_id: data.category_id || '',
          deadline: data.deadline || '',
          type: data.type || '',
        });
      } catch (err) {
        setError('Job not found');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = {
        ...formData,
        skills_required: formData.skills_required.split(',').map(s => s.trim()).filter(Boolean),
        budget_min: parseFloat(formData.budget_min) || null,
        budget_max: parseFloat(formData.budget_max) || null,
      };
      await api.put(`/jobs/${id}`, data);
      alert('Job updated successfully!');
      navigate('/my-jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="container py-8 max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon size={16} className="mr-1" /> Back
      </button>
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-2">Edit Job</h1>
        <p className="text-gray-600 mb-6">Update your job posting details</p>
        {error && <div className="alert alert-error mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div><label className="form-label">Job Title *</label><input type="text" name="title" required minLength={5} value={formData.title} onChange={handleChange} className="input" /></div>

          {/* Category + Budget Type */}
          <div className="grid grid-2 gap-6">
            <div><label className="form-label">Category</label><select name="category_id" value={formData.category_id} onChange={handleChange} className="input" required><option value="">Select Category</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
            <div><label className="form-label">Budget Type</label><select name="budget_type" value={formData.budget_type} onChange={handleChange} className="input"><option value="fixed">Fixed Price</option><option value="hourly">Hourly Rate</option></select></div>
          </div>

          {/* Budget Min/Max */}
          <div className="grid grid-2 gap-6">
            <div><label className="form-label">Budget Min (TND)</label><input type="number" name="budget_min" min="0" value={formData.budget_min} onChange={handleChange} className="input" /></div>
            <div><label className="form-label">Budget Max (TND)</label><input type="number" name="budget_max" min="0" value={formData.budget_max} onChange={handleChange} className="input" /></div>
          </div>

          {/* Duration + Deadline */}
          <div className="grid grid-2 gap-6">
            <div><label className="form-label">Duration</label><input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input" placeholder="e.g. 2 weeks, 1 month" /></div>
            <div><label className="form-label">Deadline</label><input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="input" /></div>
          </div>

          {/* Job Type – NEW */}
          <div>
            <label className="form-label">Job Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="input">
              <option value="">Select job type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Skills */}
          <div><label className="form-label">Required Skills (comma separated)</label><input type="text" name="skills_required" value={formData.skills_required} onChange={handleChange} className="input" placeholder="React, Node.js, PostgreSQL" /></div>

          {/* Description */}
          <div><label className="form-label">Description *</label><textarea name="description" required minLength={20} rows={6} value={formData.description} onChange={handleChange} className="input" /></div>

          {/* Requirements */}
          <div><label className="form-label">Requirements (optional)</label><textarea name="requirements" rows={4} value={formData.requirements} onChange={handleChange} className="input" /></div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/my-jobs')} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}