import { useState, useEffect, useRef } from "react";
import api from "../../config/api";
import FreelancerCard from "../../components/ui/FreelancerCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { SearchIcon, SlidersIcon } from "../../components/ui/Icons";

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    skills: "",
    min_rating: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({});
  const initialFetchDone = useRef(false);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const { data } = await api.get(`/freelancers?${params}`);
      setFreelancers(data.freelancers || []);
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchFreelancers();
    }
  }, []);

  useEffect(() => {
    if (initialFetchDone.current) {
      fetchFreelancers();
    }
  }, [filters.page]);

  const applyFilters = () => fetchFreelancers();

  return (
    <div className="container py-8">
      <div className="page-header">
        <h1>Find Freelancers</h1>
        <p>Hire top IT professionals for your projects</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 flex-shrink-0">
          <div className="filters">
            <div className="filters-title">
              <SlidersIcon size={18} /> Filters
            </div>
            <div className="filter-group">
              <label>Skills</label>
              <input
                type="text"
                placeholder="e.g. React, Python"
                value={filters.skills}
                onChange={(e) =>
                  setFilters({ ...filters, skills: e.target.value, page: 1 })
                }
                className="input"
              />
            </div>
            <div className="filter-group">
              <label>Min Rating</label>
              <select
                value={filters.min_rating}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    min_rating: e.target.value,
                    page: 1,
                  })
                }
                className="input"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            <button onClick={applyFilters} className="btn btn-primary w-full">
              Apply Filters
            </button>{" "}
          </div>
        </div>

        <div className="flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchFreelancers();
            }}
            className="mb-6"
          >
            <div className="search-bar">
              <SearchIcon size={20} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search freelancers..."
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>{" "}
            </div>
          </form>

          {loading ? (
            <LoadingSpinner size="lg" className="py-12" />
          ) : (
            <>
              <div className="grid grid-3">
                {freelancers.map((f) => (
                  <FreelancerCard key={f.id} freelancer={f} />
                ))}
                {freelancers.length === 0 && (
                  <div className="empty-state">
                    <p className="empty-state-text">No freelancers found</p>
                  </div>
                )}
              </div>
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: p }))
                      }
                      className={`page-btn ${p === pagination.page ? "page-btn-active" : ""}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
