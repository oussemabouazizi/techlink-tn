import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/api";
import JobCard from "../../components/ui/JobCard";
import CategoryCard from "../../components/ui/CategoryCard";
import FreelancerCard from "../../components/ui/FreelancerCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  BriefcaseIcon,
  ArrowRightIcon,
  SearchIcon,
  TrendingUpIcon,
  ShieldIcon,
  ZapIcon,
  UsersIcon,
  StarIcon,
} from "../../components/ui/Icons";

// ── Animated counter hook ──────────────────────────────────
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!target || started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

// ── Animated stat ──────────────────────────────────────────
function AnimatedStat({ value, suffix = "", label, icon, color = "#fff" }) {
  const count = useCountUp(value);
  return (
    <div className="hero-stat-card">
      <div className="hero-stat-icon">{icon}</div>
      <div className="hero-stat-number">{count}{suffix}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

const TRENDING_SKILLS = [
  "React", "Node.js", "Python", "UI/UX", "Flutter",
  "Laravel", "DevOps", "WordPress", "Vue.js", "Django",
];

export default function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories]       = useState([]);
  const [featuredJobs, setFeaturedJobs]   = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [stats, setStats]                 = useState({ freelancers: 0, jobs: 0, clients: 0, satisfaction: 98 });
  const [loading, setLoading]             = useState(true);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchType, setSearchType]       = useState("jobs");
  const [activeJobTab, setActiveJobTab]   = useState("latest");
  const fetched = useRef(false);

  const fetchHomeData = async () => {
    try {
      // Fetch categories, jobs, and freelancers
      const [catRes, jobsRes, freelancersRes, freelancerCountRes, jobsCountRes] =
        await Promise.all([
          api.get("/jobs/categories"),
          api.get("/jobs?limit=6"),
          api.get("/freelancers?limit=4"),
          api.get("/freelancers?limit=1"),
          api.get("/jobs?limit=1"),
        ]);

      // For dynamic client count: fetch all jobs (without limit) to get unique client IDs
      const allJobsRes = await api.get("/jobs?limit=100");
      const allJobs = allJobsRes.data?.jobs || [];
      const uniqueClients = new Set();
      allJobs.forEach(job => {
        if (job.client_id) uniqueClients.add(job.client_id);
      });
      const activeClients = uniqueClients.size;

      // For satisfaction: if reviews table exists, get average rating; else fallback
      let satisfactionPercent = 98;
      try {
        const reviewsRes = await api.get("/reviews/stats"); // optional endpoint
        if (reviewsRes.data?.avg_rating) {
          satisfactionPercent = Math.round(reviewsRes.data.avg_rating * 20); // convert 5-star to % (4.9 → 98%)
        }
      } catch (e) {
        // If endpoint doesn't exist, keep default or compute from freelancer ratings
        // fallback: use average freelancer rating if available
        if (topFreelancers.length) {
          let totalRating = 0;
          let ratingCount = 0;
          topFreelancers.forEach(f => {
            if (f.avg_rating) {
              totalRating += f.avg_rating;
              ratingCount++;
            }
          });
          if (ratingCount > 0) {
            satisfactionPercent = Math.round((totalRating / ratingCount) * 20);
          }
        }
      }

      setCategories(catRes.data || []);
      setFeaturedJobs(jobsRes.data?.jobs || []);
      setTopFreelancers(freelancersRes.data?.freelancers || []);
      setStats({
        freelancers: freelancerCountRes.data?.total || 0,
        jobs:        jobsCountRes.data?.total || 0,
        clients:     activeClients,
        satisfaction: satisfactionPercent,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true;
      fetchHomeData();
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/${searchType}?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const latestJobs  = [...featuredJobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const urgentJobs  = featuredJobs.filter(j => j.budget_type === "fixed" || j.budget_max > 1000);
  const displayJobs = activeJobTab === "latest" ? latestJobs : (urgentJobs.length ? urgentJobs : latestJobs);

  if (loading) return <LoadingSpinner size="xl" className="min-h-screen" />;

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-badge animate-fade-in">
            <ZapIcon size={14} />
            Tunisia's #1 Tech Freelance Platform
          </div>

          <h1 className="hero-title animate-fade-in">
            Find Top IT Talent<br />
            <span className="gradient-text">in Tunisia</span>
          </h1>

          <p className="hero-subtitle animate-fade-in">
            Connect with skilled developers, designers, and tech professionals.
            Post jobs, hire talent, and grow your business with TechLink TN.
          </p>

          <div className="hero-actions animate-fade-in">
            <Link to="/jobs" className="btn btn-primary btn-lg">
              <BriefcaseIcon size={18} /> Browse Jobs
            </Link>
            <Link to="/register?role=client" className="btn btn-outline btn-lg">
              <UsersIcon size={18} /> Hire Talent
            </Link>
          </div>

          {/* Animated stats – now use dynamic values */}
          <div className="hero-stats-grid animate-fade-in">
            <AnimatedStat
              value={stats.freelancers}
              suffix="+"
              label="Freelancers"
              icon={<UsersIcon size={20} />}
            />
            <AnimatedStat
              value={stats.jobs}
              suffix="+"
              label="Jobs Posted"
              icon={<BriefcaseIcon size={20} />}
            />
            <AnimatedStat
              value={stats.clients}
              suffix="+"
              label="Happy Clients"
              icon={<ShieldIcon size={20} />}
            />
            <AnimatedStat
              value={stats.satisfaction}
              suffix="%"
              label="Satisfaction"
              icon={<StarIcon size={20} />}
            />
          </div>
        </div>
      </section>

      {/* ── SMART SEARCH ─────────────────────────────────── */}
      <div className="search-section">
        <div className="search-box">
          <div className="search-toggle">
            <button
              className={`search-toggle-btn ${searchType === "jobs" ? "search-toggle-active" : ""}`}
              onClick={() => setSearchType("jobs")}
            >
              <BriefcaseIcon size={14} /> Find Jobs
            </button>
            <button
              className={`search-toggle-btn ${searchType === "freelancers" ? "search-toggle-active" : ""}`}
              onClick={() => setSearchType("freelancers")}
            >
              <UsersIcon size={14} /> Find Freelancers
            </button>
          </div>

          <div className="search-bar">
            <SearchIcon size={20} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                searchType === "jobs"
                  ? "Search for jobs, skills, or companies..."
                  : "Search for freelancers or skills..."
              }
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>

          <div className="trending-skills">
            <span className="trending-label">
              <TrendingUpIcon size={13} /> Trending:
            </span>
            {TRENDING_SKILLS.slice(0, 6).map((skill) => (
              <button
                key={skill}
                className="trending-pill"
                onClick={() => {
                  setSearchQuery(skill);
                  navigate(`/${searchType}?search=${encodeURIComponent(skill)}`);
                }}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-title" style={{ textAlign: "left", marginBottom: 4 }}>
                Browse by Category
              </div>
              <p className="section-subtitle" style={{ textAlign: "left", marginBottom: 0 }}>
                Find the perfect talent for your needs
              </p>
            </div>
            <Link to="/jobs" className="btn btn-outline btn-sm">
              All Categories <ArrowRightIcon size={14} />
            </Link>
          </div>
          <div className="grid grid-4" style={{ marginTop: "2rem" }}>
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
            {categories.length === 0 && (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <div className="empty-state-text">No categories available</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS with tabs ───────────────────────── */}
      <section className="section-alt" style={{ padding: "4rem 0" }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{ textAlign: "left", marginBottom: 4 }}>
                Featured Jobs
              </h2>
              <p className="section-subtitle" style={{ textAlign: "left", marginBottom: 0 }}>
                Latest opportunities from top clients
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className="mini-tabs">
                <button
                  className={`mini-tab ${activeJobTab === "latest" ? "mini-tab-active" : ""}`}
                  onClick={() => setActiveJobTab("latest")}
                >
                  Latest
                </button>
                <button
                  className={`mini-tab ${activeJobTab === "urgent" ? "mini-tab-active" : ""}`}
                  onClick={() => setActiveJobTab("urgent")}
                >
                  Top Budget
                </button>
              </div>
              <Link to="/jobs" className="view-all-link">
                View All <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-3" style={{ marginTop: "2rem" }}>
            {displayJobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {displayJobs.length === 0 && (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <div className="empty-state-text">No jobs available right now</div>
                <Link to="/post-job" className="btn btn-primary btn-sm">Post a Job</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TOP FREELANCERS ───────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-title" style={{ textAlign: "left", marginBottom: 4 }}>
                Top Freelancers
              </div>
              <p className="section-subtitle" style={{ textAlign: "left", marginBottom: 0 }}>
                Hire from our pool of verified professionals
              </p>
            </div>
            <Link to="/freelancers" className="view-all-link">
              View All <ArrowRightIcon size={14} />
            </Link>
          </div>
          <div className="grid grid-4" style={{ marginTop: "2rem" }}>
            {topFreelancers.map((f) => (
              <FreelancerCard key={f.id} freelancer={f} />
            ))}
            {topFreelancers.length === 0 && (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <div className="empty-state-text">No freelancers yet</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section-alt" style={{ padding: "4rem 0" }}>
        <div className="container">
          <div className="section-title">How TechLink TN Works</div>
          <div className="section-subtitle">Get started in 3 simple steps</div>

          <div className="how-it-works-grid">
            {[
              {
                step: "01",
                icon: <UsersIcon size={28} />,
                title: "Create Your Profile",
                desc: "Sign up and build a professional profile showcasing your skills and experience.",
                color: "#3b82f6",
                bg: "#eff6ff",
              },
              {
                step: "02",
                icon: <SearchIcon size={28} />,
                title: "Find the Perfect Match",
                desc: "Browse jobs or freelancers, filter by skill, budget, and availability.",
                color: "#8b5cf6",
                bg: "#f5f3ff",
              },
              {
                step: "03",
                icon: <ZapIcon size={28} />,
                title: "Work & Get Paid",
                desc: "Collaborate securely, deliver great work, and receive payment safely.",
                color: "#22c55e",
                bg: "#f0fdf4",
              },
            ].map(({ step, icon, title, desc, color, bg }, i) => (
              <div key={i} className="how-step">
                <div className="how-step-number" style={{ color }}>{step}</div>
                <div className="how-step-icon" style={{ background: bg, color }}>
                  {icon}
                </div>
                <h3 className="how-step-title">{title}</h3>
                <p className="how-step-desc">{desc}</p>
                {i < 2 && <div className="how-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT ACTIVITY ───────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-title">Live Activity</div>
          <div className="section-subtitle">What's happening on TechLink TN right now</div>

          <div className="grid grid-2" style={{ gap: "2rem" }}>
            {/* Latest Jobs */}
            <div>
              <div className="activity-col-header">
                <h3 className="activity-col-title">
                  <BriefcaseIcon size={18} /> Latest Jobs
                </h3>
                <Link to="/jobs" className="view-all-link">
                  See all <ArrowRightIcon size={13} />
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {featuredJobs.slice(0, 4).map((job) => (
                  <Link
                    to={`/jobs/${job.id}`}
                    key={job.id}
                    className="recent-activity-item"
                  >
                    <div className="activity-item-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                      <BriefcaseIcon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827", marginBottom: 2 }}
                        className="line-clamp-1">
                        {job.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {job.profiles?.full_name || "Client"} · {job.budget_min && job.budget_max
                          ? `${job.budget_min}–${job.budget_max} TND`
                          : "Budget negotiable"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span className="badge badge-info" style={{ fontSize: "0.65rem" }}>
                        {job.budget_type || "Open"}
                      </span>
                      <span style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
                {featuredJobs.length === 0 && (
                  <div className="recent-activity-item" style={{ color: "#9ca3af", justifyContent: "center" }}>
                    No jobs posted yet
                  </div>
                )}
              </div>
            </div>

            {/* New Freelancers */}
            <div>
              <div className="activity-col-header">
                <h3 className="activity-col-title">
                  <UsersIcon size={18} /> New Freelancers
                </h3>
                <Link to="/freelancers" className="view-all-link">
                  See all <ArrowRightIcon size={13} />
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {topFreelancers.slice(0, 4).map((f) => (
                  <Link
                    to={`/freelancers/${f.id}`}
                    key={f.id}
                    className="recent-activity-item"
                  >
                    <img
                      src={f.avatar_url || "/default-avatar.png"}
                      className="recent-activity-avatar"
                      alt={f.full_name}
                      style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #bfdbfe" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827", marginBottom: 2 }}>
                        {f.full_name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {f.freelancer_profiles?.title || "Freelancer"}
                        {f.freelancer_profiles?.hourly_rate
                          ? ` · ${f.freelancer_profiles.hourly_rate} TND/hr`
                          : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span className="badge badge-success" style={{ fontSize: "0.65rem" }}>Available</span>
                      {f.avg_rating > 0 && (
                        <span style={{ fontSize: "0.7rem", color: "#f59e0b", fontWeight: 600 }}>
                          ★ {Number(f.avg_rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                {topFreelancers.length === 0 && (
                  <div className="recent-activity-item" style={{ color: "#9ca3af", justifyContent: "center" }}>
                    No freelancers yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY TECHLINK ─────────────────────────────────── */}
      <section style={{ background: "#1e3a8a", padding: "5rem 0" }}>
        <div className="container">
          <div className="section-title" style={{ color: "#fff" }}>Why Choose TechLink TN?</div>
          <div className="section-subtitle" style={{ color: "#93c5fd" }}>
            Everything you need to succeed in the digital economy
          </div>
          <div className="features-grid">
            {[
              {
                icon: <ShieldIcon size={30} />,
                title: "Secure & Trusted",
                desc: "Verified profiles, secure payments, and professional dispute resolution.",
                iconBg: "rgba(59,130,246,0.2)",
                iconColor: "#93c5fd",
              },
              {
                icon: <ZapIcon size={30} />,
                title: "Fast Matching",
                desc: "Smart algorithms connect you with the right talent in minutes, not days.",
                iconBg: "rgba(34,197,94,0.2)",
                iconColor: "#4ade80",
              },
              {
                icon: <TrendingUpIcon size={30} />,
                title: "Grow Your Career",
                desc: "Access premium projects, build your reputation, and level up your income.",
                iconBg: "rgba(139,92,246,0.2)",
                iconColor: "#c4b5fd",
              },
              {
                icon: <UsersIcon size={30} />,
                title: "Local Community",
                desc: "Built for Tunisian tech professionals — understand the local market.",
                iconBg: "rgba(249,115,22,0.2)",
                iconColor: "#fdba74",
              },
            ].map(({ icon, title, desc, iconBg, iconColor }, i) => (
              <div key={i} className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: iconBg, color: iconColor, width: 60, height: 60,
                    borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1rem" }}
                >
                  {icon}
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-text">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="cta">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-subtitle">
            Join {stats.freelancers > 0 ? `${stats.freelancers}+` : "thousands of"} freelancers and clients already using TechLink TN
          </p>
          <div className="cta-role-toggle">
            <Link to="/register?role=freelancer" className="cta-role-btn">
              <UsersIcon size={16} /> I'm a Freelancer
            </Link>
            <Link to="/register?role=client" className="cta-role-btn">
              <BriefcaseIcon size={16} /> I'm a Client
            </Link>
          </div>
        </div>
      </section>

      {/* ── INLINE STYLES (already present) ───────────────── */}
      <style>{`
        /* All the styles you already have – keep them exactly as they were */
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; font-size: 0.8rem; font-weight: 600; padding: 6px 14px; border-radius: 100px; margin-bottom: 1.5rem; letter-spacing: 0.02em; }
        .hero-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 2.5rem; max-width: 700px; margin-left: auto; margin-right: auto; }
        .hero-stat-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 1rem 0.5rem; text-align: center; backdrop-filter: blur(8px); }
        .hero-stat-icon { display: flex; align-items: center; justify-content: center; color: #93c5fd; margin-bottom: 0.4rem; }
        .hero-stat-number { font-size: 1.5rem; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 0.25rem; }
        .hero-stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; }
        @media (max-width: 640px) { .hero-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .search-toggle { display: flex; background: #f3f4f6; border-radius: 100px; padding: 4px; gap: 4px; width: fit-content; margin: 0 auto 1rem; }
        .search-toggle-btn { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; padding: 7px 18px; border-radius: 100px; font-size: 0.85rem; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
        .search-toggle-active { background: #fff; color: #2563eb; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .trending-skills { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 1rem; justify-content: center; }
        .trending-label { display: inline-flex; align-items: center; gap: 4px; font-size: 0.78rem; font-weight: 600; color: #6b7280; }
        .trending-pill { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 0.78rem; font-weight: 600; padding: 4px 12px; border-radius: 100px; cursor: pointer; transition: all 0.15s ease; font-family: inherit; }
        .trending-pill:hover { background: #2563eb; border-color: #2563eb; color: #fff; transform: translateY(-2px); }
        .section-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .view-all-link { display: inline-flex; align-items: center; gap: 5px; font-size: 0.875rem; font-weight: 600; color: #2563eb; text-decoration: none; white-space: nowrap; transition: gap 0.2s ease; }
        .view-all-link:hover { gap: 8px; }
        .mini-tabs { display: flex; background: #f3f4f6; border-radius: 100px; padding: 3px; gap: 2px; }
        .mini-tab { background: transparent; border: none; padding: 5px 14px; border-radius: 100px; font-size: 0.8rem; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
        .mini-tab-active { background: #fff; color: #2563eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .how-it-works-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 3rem; position: relative; }
        .how-step { text-align: center; position: relative; }
        .how-step-number { font-size: 3.5rem; font-weight: 900; line-height: 1; margin-bottom: 1rem; opacity: 0.15; letter-spacing: -0.04em; }
        .how-step-icon { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
        .how-step-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem; }
        .how-step-desc { font-size: 0.9rem; color: #6b7280; line-height: 1.6; }
        .how-step-arrow { position: absolute; top: 80px; right: -1rem; font-size: 1.5rem; color: #d1d5db; font-weight: 300; }
        @media (max-width: 768px) { .how-it-works-grid { grid-template-columns: 1fr; } .how-step-arrow { display: none; } }
        .activity-col-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .activity-col-title { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; font-weight: 700; color: #111827; }
        .activity-item-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-top: 2.5rem; }
        .feature-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 1.25rem; padding: 1.75rem; transition: all 0.3s ease; }
        .feature-card:hover { background: rgba(255,255,255,0.09); transform: translateY(-6px); border-color: rgba(255,255,255,0.2); }
        .feature-title { font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .feature-text { font-size: 0.875rem; color: rgba(255,255,255,0.55); line-height: 1.6; }
        @media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr; } }
        .cta-role-toggle { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
        .cta-role-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 100px; font-weight: 700; font-size: 1rem; background: rgba(255,255,255,0.12); color: #fff; border: 2px solid rgba(255,255,255,0.3); text-decoration: none; transition: all 0.25s ease; }
        .cta-role-btn:hover { background: #fff; color: #1e3a8a; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}