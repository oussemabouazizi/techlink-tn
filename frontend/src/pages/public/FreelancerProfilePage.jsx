import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Download,
  Mail,
  Award,
  Globe,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  ChevronRight,
} from "lucide-react";
import api from "../../config/api";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

// ── Platform design tokens (matches variables.css) ─────────
const C = {
  // Primary blue
  p50: "#eff6ff",
  p100: "#dbeafe",
  p200: "#bfdbfe",
  p300: "#93c5fd",
  p400: "#60a5fa",
  p500: "#3b82f6",
  p600: "#2563eb",
  p700: "#1d4ed8",
  p800: "#1e40af",
  p900: "#1e3a8a",
  // Green (success/available)
  g50: "#f0fdf4",
  g500: "#22c55e",
  g600: "#16a34a",
  g700: "#15803d",
  // Neutrals
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  // Semantic
  white: "#ffffff",
  bg: "#f8fafc",
  border: "#e5e7eb",
  borderM: "#d1d5db",
  text1: "#111827",
  text2: "#4b5563",
  text3: "#9ca3af",
  // Accents
  orange: "#f97316",
};

const S = {
  root: {
    background: C.bg,
    minHeight: "100vh",
    padding: "32px 0 80px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  container: { maxWidth: 1100, margin: "0 auto", padding: "0 24px" },

  // ── Hero ──
  hero: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
  },
  cover: {
    height: 120,
    background:
      "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
    position: "relative",
    overflow: "hidden",
  },
  coverPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 15% 50%, rgba(255,255,255,0.08) 0%, transparent 50%),
      radial-gradient(circle at 85% 20%, rgba(96,165,250,0.25) 0%, transparent 50%),
      radial-gradient(circle at 50% 100%, rgba(29,78,216,0.4) 0%, transparent 60%)
    `,
  },
  // decorative circles on cover
  coverCircle1: {
    position: "absolute",
    top: -30,
    right: 80,
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  coverCircle2: {
    position: "absolute",
    top: 10,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  heroBody: {
    padding: "0 32px 28px",
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
  },

  // Avatar
  avatarWrap: { position: "relative", flexShrink: 0, marginTop: -40 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
    border: `4px solid ${C.white}`,
    boxShadow: "0 4px 14px rgba(37,99,235,0.2), 0 2px 6px rgba(0,0,0,0.1)",
    display: "block",
    background: C.p100,
  },
  avatarInitials: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    border: `4px solid ${C.white}`,
    boxShadow: "0 4px 14px rgba(37,99,235,0.2), 0 2px 6px rgba(0,0,0,0.1)",
    background: `linear-gradient(135deg, ${C.p600}, ${C.p800})`,
    color: C.white,
    fontSize: 28,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
    flexShrink: 0,
  },
  dot: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 15,
    height: 15,
    background: C.g500,
    border: `2.5px solid ${C.white}`,
    borderRadius: "50%",
    boxShadow: "0 0 0 2px rgba(34,197,94,0.2)",
  },

  // Hero info
  heroInfo: { flex: 1, paddingTop: 10, minWidth: 0 },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 18,
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    color: C.text1,
    margin: "0 0 3px",
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  titleText: {
    fontSize: 14,
    color: C.p600,
    fontWeight: 600,
    margin: "0 0 10px",
  },
  metaRow: { display: "flex", flexWrap: "wrap", gap: 7 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: C.gray100,
    border: `1px solid ${C.border}`,
    borderRadius: 100,
    padding: "4px 11px",
    fontSize: 12,
    color: C.text2,
    whiteSpace: "nowrap",
    fontWeight: 500,
  },
  chipBlue: {
    background: C.p50,
    border: `1px solid ${C.p200}`,
    color: C.p700,
  },
  chipGreen: {
    background: C.g50,
    border: `1px solid rgba(34,197,94,0.3)`,
    color: C.g700,
  },

  ctaGroup: { display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: `linear-gradient(135deg, ${C.p600}, ${C.p700})`,
    color: C.white,
    fontWeight: 600,
    fontSize: 13,
    padding: "9px 20px",
    borderRadius: 100,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: C.white,
    color: C.p600,
    fontSize: 13,
    fontWeight: 600,
    padding: "9px 20px",
    borderRadius: 100,
    textDecoration: "none",
    border: `1.5px solid ${C.p200}`,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnOutline: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: C.white,
    color: C.text2,
    fontSize: 13,
    fontWeight: 500,
    padding: "9px 20px",
    borderRadius: 100,
    textDecoration: "none",
    border: `1px solid ${C.border}`,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnFull: { width: "100%", justifyContent: "center" },

  // Stats strip
  statsStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    background: C.gray50,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    overflow: "hidden",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "14px 8px",
    borderRight: `1px solid ${C.border}`,
  },
  statLast: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "14px 8px",
  },
  statVal: {
    fontSize: 20,
    fontWeight: 700,
    color: C.p700,
    lineHeight: 1,
    marginBottom: 3,
  },
  statLbl: {
    fontSize: 11,
    color: C.text3,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 500,
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: 20,
    alignItems: "start",
  },
  main: { display: "flex", flexDirection: "column", gap: 16 },

  // Tabs
  tabs: {
    display: "flex",
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    width: "fit-content",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  tab: {
    background: "transparent",
    border: "none",
    color: C.text3,
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 500,
    padding: "7px 18px",
    borderRadius: 9,
    cursor: "pointer",
  },
  tabActive: {
    background: C.p600,
    color: C.white,
    boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
  },

  // Cards
  card: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  cardHire: {
    background: `linear-gradient(145deg, ${C.p900} 0%, ${C.p700} 100%)`,
    borderRadius: 16,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
    border: "none",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: C.text1,
    margin: 0,
    flex: 1,
  },
  cardIcon: { color: C.p500, flexShrink: 0 },
  bio: { color: C.text2, lineHeight: 1.75, fontSize: 14.5, margin: 0 },
  empty: { color: C.text3, fontSize: 13, fontStyle: "italic" },
  seeAll: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    background: "none",
    border: "none",
    color: C.p600,
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
    padding: 0,
    fontWeight: 600,
  },

  // Skills
  skillsGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  skill: {
    background: C.p50,
    border: `1px solid ${C.p200}`,
    color: C.p700,
    fontSize: 12.5,
    fontWeight: 600,
    padding: "5px 13px",
    borderRadius: 100,
  },

  // Sidebar
  sidebar: { display: "flex", flexDirection: "column", gap: 16 },

  // Hire card internals (on dark bg)
  hireRate: { display: "flex", alignItems: "baseline", gap: 6 },
  hireRateVal: { fontSize: 32, fontWeight: 800, color: C.white, lineHeight: 1 },
  hireRateLbl: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: 500,
  },
  hireBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(34,197,94,0.15)",
    border: "1px solid rgba(34,197,94,0.35)",
    color: "#4ade80",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 100,
    width: "fit-content",
  },
  hireLabel: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 2 },
  btnHirePrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    justifyContent: "center",
    background: C.white,
    color: C.p700,
    fontWeight: 700,
    fontSize: 13,
    padding: "11px 20px",
    borderRadius: 100,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  btnHireGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    justifyContent: "center",
    background: "rgba(255,255,255,0.1)",
    color: C.white,
    fontSize: 13,
    fontWeight: 600,
    padding: "10px 20px",
    borderRadius: 100,
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.25)",
    cursor: "pointer",
    width: "100%",
  },

  // Contact
  contactList: { display: "flex", flexDirection: "column", gap: 4 },
  contactLink: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 10,
    textDecoration: "none",
    color: C.text2,
    fontSize: 13,
    border: "1px solid transparent",
  },
  contactIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    background: C.p50,
    borderRadius: 9,
    color: C.p600,
    flexShrink: 0,
    border: `1px solid ${C.p100}`,
  },
  contactText: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 500,
  },
  contactArrow: { color: C.text3, flexShrink: 0 },

  // Rating
  ratingBig: { display: "flex", alignItems: "center", gap: 16 },
  ratingNum: {
    fontSize: 52,
    fontWeight: 800,
    color: C.p700,
    lineHeight: 1,
    letterSpacing: "-0.03em",
  },
  stars: { display: "flex", gap: 3, marginBottom: 4 },
  ratingSub: { fontSize: 12, color: C.text3, margin: 0, fontWeight: 500 },

  // Divider
  divider: { height: 1, background: C.border, margin: "16px 0" },
};

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function FreelancerProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/freelancers/${id}`);
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("Freelancer not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <LoadingSpinner size="xl" className="min-h-screen" />;
  if (error)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
          color: C.text2,
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: C.p200,
            letterSpacing: "-0.04em",
          }}
        >
          404
        </div>
        <p style={{ margin: 0, fontSize: 15 }}>{error}</p>
        <Link to="/freelancers" style={S.btnPrimary}>
          Browse Freelancers
        </Link>
      </div>
    );
  if (!profile)
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: C.text3 }}>
        No profile found
      </div>
    );

  const fd = profile.freelancer_profiles || {};
  const skills = fd.skills || [];
  const hourlyRate = fd.hourly_rate || 0;
  const experienceYears = fd.experience_years || 0;
  const completedJobs = profile.completed_jobs || 0;
  const avgRating = profile.avg_rating || 0;
  const reviewCount = profile.review_count || 0;
  const avatar = profile.avatar_url;
  const fullName = profile.full_name || "Anonymous";
  const title = fd.title || "Freelancer";
  const bio = profile.bio || "No bio provided.";
  const location = profile.location || "Tunisia";
  const website = profile.website;
  const github = fd.github_url;
  const linkedin = fd.linkedin_url;
  const cvUrl = profile.cv_url;
  const email = profile.email;

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const ratingStars = Math.round(avgRating);

  return (
    <div style={S.root}>
      <div style={S.container}>
        {/* ── HERO CARD ── */}
        <div style={S.hero}>
          {/* Cover */}
          <div style={S.cover}>
            <div style={S.coverPattern} />
            <div style={S.coverCircle1} />
            <div style={S.coverCircle2} />
          </div>

          <div style={S.heroBody}>
            {/* Avatar */}
            <div style={S.avatarWrap}>
              {avatar ? (
                <img src={avatar} alt={fullName} style={S.avatar} />
              ) : (
                <div style={S.avatarInitials}>{initials}</div>
              )}
              <span style={S.dot} title="Available for work" />
            </div>

            {/* Info */}
            <div style={S.heroInfo}>
              <div style={S.heroTop}>
                <div>
                  <h1 style={S.name}>{fullName}</h1>
                  <p style={S.titleText}>{title}</p>
                  <div style={S.metaRow}>
                    <span style={S.chip}>
                      <MapPin size={13} /> {location}
                    </span>
                    {experienceYears > 0 && (
                      <span style={S.chip}>
                        <Clock size={13} /> {experienceYears}y experience
                      </span>
                    )}
                    {avgRating > 0 && (
                      <span style={{ ...S.chip, ...S.chipBlue }}>
                        <Star size={13} fill="currentColor" color={C.p500} />{" "}
                        {avgRating.toFixed(1)}
                      </span>
                    )}
                    <span style={{ ...S.chip, ...S.chipGreen }}>
                      <CheckCircle2 size={13} /> Available
                    </span>
                  </div>
                </div>

                <div style={S.ctaGroup}>
                  <Link
                    to={`/messages/${profile.id}`}
                    className="btn btn-primary"
                  >
                    <Mail size={16} className="mr-1" /> Message
                  </Link>
                  {cvUrl && (
                    <a href={cvUrl} target="_blank" style={S.btnGhost}>
                      <Download size={15} /> Download CV
                    </a>
                  )}
                </div>
              </div>

              {/* Stats strip */}
              <div style={S.statsStrip}>
                {[
                  {
                    val: hourlyRate ? `${hourlyRate} TND` : "—",
                    lbl: "Hourly Rate",
                  },
                  { val: completedJobs, lbl: "Jobs Done" },
                  {
                    val: avgRating > 0 ? avgRating.toFixed(1) : "—",
                    lbl: `${reviewCount} Reviews`,
                  },
                  {
                    val: experienceYears > 0 ? `${experienceYears}y` : "—",
                    lbl: "Experience",
                    last: true,
                  },
                ].map(({ val, lbl, last }) => (
                  <div key={lbl} style={last ? S.statLast : S.stat}>
                    <span style={S.statVal}>{val}</span>
                    <span style={S.statLbl}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        <div style={S.grid}>
          {/* LEFT — main */}
          <div style={S.main}>
            {/* Tabs */}
            <div style={S.tabs}>
              {["about", "skills"].map((tab) => (
                <button
                  key={tab}
                  style={
                    activeTab === tab ? { ...S.tab, ...S.tabActive } : S.tab
                  }
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "about" ? "About" : "Skills"}
                </button>
              ))}
            </div>

            {/* About */}
            {activeTab === "about" && (
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <Award size={18} style={S.cardIcon} />
                  <h2 style={S.cardTitle}>About</h2>
                </div>
                <p style={S.bio}>{bio}</p>
              </div>
            )}

            {/* Skills full */}
            {activeTab === "skills" && (
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <Zap size={18} style={S.cardIcon} />
                  <h2 style={S.cardTitle}>Skills & Expertise</h2>
                </div>
                {skills.length > 0 ? (
                  <div style={S.skillsGrid}>
                    {skills.map((s) => (
                      <span key={s} style={S.skill}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={S.empty}>No skills listed yet.</p>
                )}
              </div>
            )}

            {/* Quick skills preview on About */}
            {activeTab === "about" && skills.length > 0 && (
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <Zap size={18} style={S.cardIcon} />
                  <h2 style={S.cardTitle}>Top Skills</h2>
                  <button
                    style={S.seeAll}
                    onClick={() => setActiveTab("skills")}
                  >
                    See all <ChevronRight size={13} />
                  </button>
                </div>
                <div style={S.skillsGrid}>
                  {skills.slice(0, 8).map((s) => (
                    <span key={s} style={S.skill}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <aside style={S.sidebar}>
            {/* Hire card (dark blue gradient) */}
            <div style={S.cardHire}>
              <div>
                <p style={S.hireLabel}>Hourly Rate</p>
                <div style={S.hireRate}>
                  <span style={S.hireRateVal}>
                    {hourlyRate ? `${hourlyRate} TND` : "Negotiable"}
                  </span>
                  {hourlyRate > 0 && <span style={S.hireRateLbl}>/ hour</span>}
                </div>
              </div>
              <div style={S.hireBadge}>
                <CheckCircle2 size={14} /> Available for work
              </div>
              <Link
                to={`/messages/new?userId=${profile.id}`}
                style={S.btnHirePrimary}
              >
                <Mail size={15} /> Send a Message
              </Link>
              {cvUrl && (
                <a href={cvUrl} target="_blank" style={S.btnHireGhost}>
                  <Download size={15} /> Download CV
                </a>
              )}
            </div>

            {/* Contact info */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <Mail size={18} style={S.cardIcon} />
                <h2 style={S.cardTitle}>Contact</h2>
              </div>
              <div style={S.contactList}>
                {email && (
                  <a href={`mailto:${email}`} style={S.contactLink}>
                    <span style={S.contactIcon}>
                      <Mail size={15} />
                    </span>
                    <span style={S.contactText}>{email}</span>
                    <ArrowUpRight size={13} style={S.contactArrow} />
                  </a>
                )}
                {website && (
                  <a href={website} target="_blank" style={S.contactLink}>
                    <span style={S.contactIcon}>
                      <Globe size={15} />
                    </span>
                    <span style={S.contactText}>Website</span>
                    <ArrowUpRight size={13} style={S.contactArrow} />
                  </a>
                )}
                {github && (
                  <a href={github} target="_blank" style={S.contactLink}>
                    <span style={S.contactIcon}>
                      <GithubIcon />
                    </span>
                    <span style={S.contactText}>GitHub</span>
                    <ArrowUpRight size={13} style={S.contactArrow} />
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" style={S.contactLink}>
                    <span style={S.contactIcon}>
                      <LinkedinIcon />
                    </span>
                    <span style={S.contactText}>LinkedIn</span>
                    <ArrowUpRight size={13} style={S.contactArrow} />
                  </a>
                )}
                {!email && !website && !github && !linkedin && (
                  <p style={S.empty}>No contact info provided.</p>
                )}
              </div>
            </div>

            {/* Rating */}
            {avgRating > 0 && (
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <Star size={18} style={S.cardIcon} />
                  <h2 style={S.cardTitle}>Rating</h2>
                </div>
                <div style={S.ratingBig}>
                  <span style={S.ratingNum}>{avgRating.toFixed(1)}</span>
                  <div>
                    <div style={S.stars}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={17}
                          fill={i <= ratingStars ? "#f59e0b" : "none"}
                          color={i <= ratingStars ? "#f59e0b" : C.gray300}
                        />
                      ))}
                    </div>
                    <p style={S.ratingSub}>
                      {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
