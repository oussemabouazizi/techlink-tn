import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";
import { ArrowLeftIcon, PlusIcon } from "../../components/ui/Icons";

export default function PostJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    budget_min: "",
    budget_max: "",
    budget_type: "fixed",
    duration: "",
    skills_required: "",
    category_id: "",
    deadline: "",
    type: "", // 👈 added job type
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/jobs/categories");
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories. Please refresh the page.");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = {
        ...formData,
        skills_required: formData.skills_required
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        budget_min: parseFloat(formData.budget_min) || null,
        budget_max: parseFloat(formData.budget_max) || null,
        category_id: formData.category_id || null,
      };
      await api.post("/jobs", data);
      navigate("/my-jobs");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="container py-8 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeftIcon size={16} className="mr-1" /> Back
      </button>
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-2">Post a New Job</h1>
        <p className="text-gray-600 mb-6">
          Fill in the details below to find the perfect freelancer
        </p>
        {error && <div className="alert alert-error mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              name="title"
              required
              minLength={5}
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="e.g. Full Stack Developer for E-commerce Site"
            />
          </div>

          {/* Category + Budget Type */}
          <div className="grid grid-2 gap-6">
            <div>
              <label className="form-label">Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Budget Type</label>
              <select
                name="budget_type"
                value={formData.budget_type}
                onChange={handleChange}
                className="input"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
          </div>

          {/* Budget Min/Max */}
          <div className="grid grid-2 gap-6">
            <div>
              <label className="form-label">Budget Min (TND)</label>
              <input
                type="number"
                name="budget_min"
                min="0"
                value={formData.budget_min}
                onChange={handleChange}
                className="input"
                placeholder="500"
              />
            </div>
            <div>
              <label className="form-label">Budget Max (TND)</label>
              <input
                type="number"
                name="budget_max"
                min="0"
                value={formData.budget_max}
                onChange={handleChange}
                className="input"
                placeholder="2000"
              />
            </div>
          </div>

          {/* Duration + Deadline */}
          <div className="grid grid-2 gap-6">
            <div>
              <label className="form-label">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input"
                placeholder="e.g. 2 weeks, 1 month"
              />
            </div>
            <div>
              <label className="form-label">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Job Type – NEW */}
          <div>
            <label className="form-label">Job Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select job type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Required Skills */}
          <div>
            <label className="form-label">Required Skills (comma separated)</label>
            <input
              type="text"
              name="skills_required"
              value={formData.skills_required}
              onChange={handleChange}
              className="input"
              placeholder="React, Node.js, PostgreSQL, AWS"
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              required
              minLength={20}
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className="input"
              placeholder="Describe the project, goals, and what you need..."
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="form-label">Requirements (optional)</label>
            <textarea
              name="requirements"
              rows={4}
              value={formData.requirements}
              onChange={handleChange}
              className="input"
              placeholder="List specific requirements, qualifications, or deliverables..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: "120px" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-spinner-sm"></span> Posting...
                </span>
              ) : (
                <>
                  <PlusIcon size={18} className="inline mr-1" /> Post Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Inline style for loading spinner */}
      <style>{`
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