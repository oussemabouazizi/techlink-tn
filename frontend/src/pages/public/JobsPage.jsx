import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../config/api";
import JobCard from "../../components/ui/JobCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { SearchIcon, SlidersIcon } from "../../components/ui/Icons";

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    budget_min: searchParams.get("budget_min") || "",
    budget_max: searchParams.get("budget_max") || "",
    skills: searchParams.get("skills") || "",
    page: parseInt(searchParams.get("page")) || 1,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const initialFetchDone = useRef(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/jobs/categories");
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      setSearchParams(params, { replace: true });
      const { data } = await api.get(`/jobs?${params}`);
      setJobs(data.jobs || []);
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1,
      });
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchJobs();
    }
  }, []);

  // Fetch when page changes
  useEffect(() => {
    if (initialFetchDone.current) {
      fetchJobs();
    }
  }, [filters.page]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const applyFilters = () => fetchJobs();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: filters.search, page: 1 }));
    fetchJobs();
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      category: "",
      budget_min: "",
      budget_max: "",
      skills: "",
      page: 1,
    });
    // Fetch after reset
    setTimeout(() => fetchJobs(), 0);
  };

  const hasActiveFilters =
    filters.category || filters.budget_min || filters.budget_max || filters.skills;

  return (
    <div className="container py-8">
      <div className="page-header">
        <h1>Find Jobs</h1>
        <p>Browse {pagination.total.toLocaleString()} available opportunities</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="filters">
            <div className="filters-title flex justify-between items-center">
              <span className="flex items-center gap-2">
                <SlidersIcon size={18} /> Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Reset all
                </button>
              )}
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Budget Range (TND)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budget_min}
                  onChange={(e) => handleFilterChange("budget_min", e.target.value)}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budget_max}
                  onChange={(e) => handleFilterChange("budget_max", e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Skills</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js"
                value={filters.skills}
                onChange={(e) => handleFilterChange("skills", e.target.value)}
                className="input"
              />
            </div>

            <button onClick={applyFilters} className="btn btn-primary w-full">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="search-bar">
              <SearchIcon size={20} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search jobs by title, company, or skills..."
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </form>

          {loading ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : (
            <>
              <div className="grid grid-1 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
                {jobs.length === 0 && (
                  <div className="empty-state text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search or filters to find what you're looking for
                    </p>
                    <button onClick={clearAllFilters} className="btn btn-primary">
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination mt-8">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, page: p }))
                        }
                        className={`page-btn ${
                          p === pagination.page ? "page-btn-active" : ""
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}