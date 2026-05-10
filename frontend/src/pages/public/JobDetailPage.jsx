import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../config/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { MapPinIcon, ClockIcon, CalendarIcon, ArrowLeftIcon, SendIcon } from '../../components/ui/Icons'

// ── tokens ─────────────────────────────────────────────────
const C = {
  p50:'#eff6ff', p100:'#dbeafe', p200:'#bfdbfe',
  p500:'#3b82f6', p600:'#2563eb', p700:'#1d4ed8', p800:'#1e40af', p900:'#1e3a8a',
  g50:'#f0fdf4', g100:'#dcfce7', g500:'#22c55e', g600:'#16a34a',
  amber:'#f59e0b', amberBg:'#fef3c7',
  gray50:'#f9fafb', gray100:'#f3f4f6', gray200:'#e5e7eb',
  gray300:'#d1d5db', gray400:'#9ca3af', gray500:'#6b7280',
  gray600:'#4b5563', gray700:'#374151', gray900:'#111827',
  white:'#ffffff', bg:'#f8fafc', border:'#e5e7eb',
  text1:'#111827', text2:'#4b5563', text3:'#9ca3af',
  purple:'#8b5cf6', purpleBg:'#ede9fe',
  red:'#ef4444', redBg:'#fef2f2',
}

const S = {
  root:{ background:C.bg, minHeight:'100vh', padding:'32px 0 80px',
    fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" },
  container:{ maxWidth:980, margin:'0 auto', padding:'0 24px' },

  back:{ display:'inline-flex', alignItems:'center', gap:7, background:'none',
    border:'none', color:C.gray500, fontSize:14, fontWeight:600, cursor:'pointer',
    padding:'8px 0', marginBottom:24, fontFamily:'inherit', textDecoration:'none' },

  // ── hero ──
  hero:{ background:C.white, border:`1px solid ${C.border}`, borderRadius:20,
    overflow:'hidden', marginBottom:20,
    boxShadow:'0 4px 6px -1px rgba(0,0,0,0.07)' },
  heroCover:{ height:100,
    background:`linear-gradient(135deg,${C.p900} 0%,${C.p700} 55%,${C.p500} 100%)`,
    position:'relative', overflow:'hidden' },
  heroCoverInner:{ position:'absolute', inset:0,
    backgroundImage:`radial-gradient(circle at 15% 60%,rgba(255,255,255,0.09) 0%,transparent 50%),
      radial-gradient(circle at 85% 20%,rgba(96,165,250,0.22) 0%,transparent 50%)` },
  heroBody:{ padding:'24px 32px 28px' },
  heroMainRow:{ display:'flex', justifyContent:'space-between',
    alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:18 },
  title:{ fontSize:26, fontWeight:800, color:C.text1, margin:'0 0 10px',
    lineHeight:1.2, letterSpacing:'-0.02em' },
  metaRow:{ display:'flex', flexWrap:'wrap', gap:8 },
  chip:{ display:'inline-flex', alignItems:'center', gap:5,
    background:C.gray100, border:`1px solid ${C.border}`, borderRadius:100,
    padding:'4px 11px', fontSize:12, color:C.text2, fontWeight:500, whiteSpace:'nowrap' },
  chipPurple:{ background:C.purpleBg, border:'1px solid rgba(139,92,246,0.25)', color:C.purple },
  statusBadge:(open)=>({ display:'inline-flex', alignItems:'center', gap:5,
    background: open ? C.g100 : C.gray100,
    border:`1px solid ${open ? 'rgba(34,197,94,0.3)' : C.border}`,
    color: open ? C.g600 : C.gray500,
    fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:100,
    flexShrink:0, whiteSpace:'nowrap' }),

  // 3-stat strip (budget · duration · proposals) — no repetition anywhere else
  strip:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)',
    background:C.gray50, border:`1px solid ${C.border}`,
    borderRadius:14, overflow:'hidden' },
  stripCell:(last)=>({ display:'flex', alignItems:'center', gap:12,
    padding:'15px 20px',
    borderRight: last ? 'none' : `1px solid ${C.border}` }),
  stripIconBox:(bg,color)=>({ width:36, height:36, borderRadius:9,
    background:bg, color, display:'flex', alignItems:'center',
    justifyContent:'center', flexShrink:0 }),
  stripVal:{ fontSize:14, fontWeight:700, color:C.text1, marginBottom:2 },
  stripLbl:{ fontSize:11, color:C.text3, fontWeight:500,
    textTransform:'uppercase', letterSpacing:'0.04em' },

  // ── layout ──
  grid:{ display:'grid', gridTemplateColumns:'1fr 290px', gap:20, alignItems:'start' },
  main:{ display:'flex', flexDirection:'column', gap:16 },
  sidebar:{ display:'flex', flexDirection:'column', gap:16 },

  // ── content cards ──
  card:{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16,
    padding:24, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  cardHdr:{ display:'flex', alignItems:'center', gap:10, marginBottom:16,
    paddingBottom:14, borderBottom:`1px solid ${C.border}` },
  cardTitle:{ fontSize:15, fontWeight:700, color:C.text1, margin:0 },
  cardIconBox:(bg,color)=>({ width:32, height:32, borderRadius:8, background:bg,
    color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }),
  bodyText:{ fontSize:14.5, color:C.text2, lineHeight:1.78, margin:0, whiteSpace:'pre-wrap' },

  // skills
  skillsWrap:{ display:'flex', flexWrap:'wrap', gap:8 },
  skill:{ background:C.p50, border:`1px solid ${C.p200}`, color:C.p700,
    fontSize:12.5, fontWeight:600, padding:'5px 13px', borderRadius:100 },

  // ── sidebar: action card (dark blue) ──
  actionCard:{ background:`linear-gradient(145deg,${C.p900},${C.p700})`,
    borderRadius:16, padding:24, display:'flex', flexDirection:'column', gap:12,
    boxShadow:'0 8px 24px rgba(37,99,235,0.28)' },
  clientRow:{ display:'flex', alignItems:'center', gap:12 },
  clientAvatar:{ width:46, height:46, borderRadius:'50%', objectFit:'cover',
    border:'2.5px solid rgba(255,255,255,0.3)',
    boxShadow:'0 2px 8px rgba(0,0,0,0.2)', flexShrink:0, background:C.p800 },
  clientInitials:{ width:46, height:46, borderRadius:'50%',
    background:'rgba(255,255,255,0.15)', border:'2.5px solid rgba(255,255,255,0.3)',
    color:'#fff', fontSize:16, fontWeight:700,
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  clientName:{ fontSize:15, fontWeight:700, color:'#fff', margin:'0 0 1px' },
  clientSub:{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:500 },
  dividerW:{ height:1, background:'rgba(255,255,255,0.1)', margin:'2px 0' },

  btnWhite:{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    background:C.white, color:C.p700, fontWeight:700, fontSize:13,
    padding:'11px 18px', borderRadius:100, border:'none', cursor:'pointer',
    fontFamily:'inherit', textDecoration:'none',
    boxShadow:'0 2px 8px rgba(0,0,0,0.12)' },
  btnGhostW:{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    background:'rgba(255,255,255,0.1)', color:C.white, fontWeight:600, fontSize:13,
    padding:'10px 18px', borderRadius:100, cursor:'pointer',
    border:'1px solid rgba(255,255,255,0.2)', fontFamily:'inherit', textDecoration:'none' },
  btnOutlineBlue:{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    background:'transparent', color:C.p600, fontWeight:600, fontSize:13,
    padding:'10px 18px', borderRadius:100, border:`1.5px solid ${C.p200}`,
    cursor:'pointer', fontFamily:'inherit', textDecoration:'none', width:'100%' },
  btnGray:{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    background:'transparent', color:C.gray500, fontWeight:600, fontSize:13,
    padding:'10px 18px', borderRadius:100, border:`1px solid ${C.border}`,
    cursor:'pointer', fontFamily:'inherit', textDecoration:'none', width:'100%' },

  // ── proposal form ──
  proposalWrap:{ background:C.white, border:`1px solid ${C.p200}`, borderRadius:16,
    padding:24, boxShadow:`0 0 0 3px ${C.p100},0 4px 20px rgba(37,99,235,0.08)` },
  label:{ display:'block', fontSize:11, fontWeight:700, color:C.gray600,
    textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 },
  textarea:{ width:'100%', padding:'12px 14px', border:`2px solid ${C.border}`,
    borderRadius:12, fontSize:14, color:C.text1, background:C.white,
    fontFamily:'inherit', lineHeight:1.6, resize:'vertical',
    boxSizing:'border-box', outline:'none' },
  inputField:{ width:'100%', padding:'10px 14px', border:`2px solid ${C.border}`,
    borderRadius:12, fontSize:14, color:C.text1, background:C.white,
    fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
  twoCol:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  formActions:{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:8 },
  btnCancel:{ display:'inline-flex', alignItems:'center', gap:6,
    background:'transparent', color:C.gray500, fontSize:13, fontWeight:600,
    padding:'9px 18px', borderRadius:100, border:`1px solid ${C.border}`,
    cursor:'pointer', fontFamily:'inherit' },
  btnSubmit:{ display:'inline-flex', alignItems:'center', gap:7,
    background:`linear-gradient(135deg,${C.p600},${C.p700})`,
    color:'#fff', fontSize:13, fontWeight:700,
    padding:'10px 22px', borderRadius:100, border:'none',
    cursor:'pointer', fontFamily:'inherit',
    boxShadow:'0 4px 12px rgba(37,99,235,0.3)' },

  // success banner
  successBanner:{ background:C.g50, border:'1px solid rgba(34,197,94,0.3)',
    borderRadius:14, padding:'18px 20px',
    display:'flex', alignItems:'center', gap:14 },
  successIcon:{ width:38, height:38, borderRadius:'50%', background:C.g100,
    color:C.g600, display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:18, flexShrink:0, fontWeight:700 },
}

// ── tiny icon components ────────────────────────────────────
const TndIcon = () => (
  <span style={{ fontWeight:800, fontSize:13, lineHeight:1 }}>TND</span>
)
const MsgIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const DocIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const ZapIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
)

export default function JobDetailPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [job, setJob]                     = useState(null)
  const [loading, setLoading]             = useState(true)
  const [showForm, setShowForm]           = useState(false)
  const [proposalData, setProposalData]   = useState({ cover_letter:'', bid_amount:'', delivery_days:'' })
  const [submitting, setSubmitting]       = useState(false)
  const [submitted, setSubmitted]         = useState(false)
  const [proposalCount, setProposalCount] = useState(0)
  const [copied, setCopied]               = useState(false)

  useEffect(() => { fetchJob() }, [id])

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`)
      setJob(data)
      setProposalCount(data.proposal_count || 0)
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.post('/proposals', { ...proposalData, job_id: id })
      setShowForm(false)
      setSubmitted(true)
      setProposalCount(c => c + 1) // live update
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit proposal')
    } finally { setSubmitting(false) }
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <LoadingSpinner size="xl" className="min-h-screen" />
  if (!job) return (
    <div style={{ textAlign:'center', padding:'80px 24px', color:C.gray500, fontFamily:'inherit' }}>
      <div style={{ fontSize:52, marginBottom:12 }}>🔍</div>
      <p style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Job not found</p>
      <Link to="/jobs" style={{ ...S.btnOutlineBlue, width:'fit-content', display:'inline-flex' }}>
        Back to Jobs
      </Link>
    </div>
  )

  const isOpen         = job.status === 'open'
  const isFreelancer   = user?.role === 'freelancer'
  const isOwner        = user?.id === job.client_id
  const canApply       = isFreelancer && isOpen && !submitted && !isOwner
  const clientInitials = (job.profiles?.full_name || 'C').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
  const budget         = job.budget_min && job.budget_max
    ? `${job.budget_min} – ${job.budget_max} TND` : 'Negotiable'

  return (
    <div style={S.root}>
      <div style={S.container}>

        {/* ── back ── */}
        <button style={S.back} onClick={() => navigate(-1)}>
          <ArrowLeftIcon size={15} /> Back to Jobs
        </button>

        {/* ── HERO ── */}
        <div style={S.hero}>
          <div style={S.heroCover}><div style={S.heroCoverInner} /></div>
          <div style={S.heroBody}>

            {/* Title row */}
            <div style={S.heroMainRow}>
              <div style={{ flex:1, minWidth:0 }}>
                <h1 style={S.title}>{job.title}</h1>
                <div style={S.metaRow}>
                  <span style={S.chip}><MapPinIcon size={12} /> {job.profiles?.location || 'Remote'}</span>
                  <span style={S.chip}><CalendarIcon size={12} /> {new Date(job.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                  <span style={S.chip}><ClockIcon size={12} /> {job.duration || 'Flexible'}</span>
                  {job.type && <span style={{...S.chip,...S.chipPurple}}><ZapIcon /> {job.type}</span>}
                </div>
              </div>
              <span style={S.statusBadge(isOpen)}>{isOpen ? '● Open' : '● Closed'}</span>
            </div>

            {/* Stats strip — budget · experience · proposals (no repetition elsewhere) */}
            <div style={S.strip}>
              <div style={S.stripCell(false)}>
                <div style={S.stripIconBox(C.p50, C.p600)}><TndIcon /></div>
                <div>
                  <div style={S.stripVal}>{budget}</div>
                  <div style={S.stripLbl}>Budget</div>
                </div>
              </div>
              <div style={S.stripCell(false)}>
                <div style={S.stripIconBox(C.amberBg, C.amber)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div>
                  <div style={S.stripVal}>{job.experience_level || 'Any level'}</div>
                  <div style={S.stripLbl}>Experience</div>
                </div>
              </div>
              <div style={S.stripCell(true)}>
                <div style={S.stripIconBox(C.purpleBg, C.purple)}>
                  <SendIcon size={15} />
                </div>
                <div>
                  <div style={S.stripVal}>{proposalCount}</div>
                  <div style={S.stripLbl}>Proposals</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        <div style={S.grid}>

          {/* ── LEFT ── */}
          <div style={S.main}>

            {/* Description */}
            <div style={S.card}>
              <div style={S.cardHdr}>
                <div style={S.cardIconBox(C.p50, C.p600)}><DocIcon /></div>
                <h2 style={S.cardTitle}>Job Description</h2>
              </div>
              <p style={S.bodyText}>{job.description}</p>
            </div>

            {/* Requirements — only render if it exists AND differs from description */}
            {job.requirements && job.requirements !== job.description && (
              <div style={S.card}>
                <div style={S.cardHdr}>
                  <div style={S.cardIconBox(C.amberBg, C.amber)}><CheckIcon /></div>
                  <h2 style={S.cardTitle}>Requirements</h2>
                </div>
                <p style={S.bodyText}>{job.requirements}</p>
              </div>
            )}

            {/* Skills */}
            {job.skills_required?.length > 0 && (
              <div style={S.card}>
                <div style={S.cardHdr}>
                  <div style={S.cardIconBox(C.purpleBg, C.purple)}><ZapIcon /></div>
                  <h2 style={S.cardTitle}>Required Skills</h2>
                </div>
                <div style={S.skillsWrap}>
                  {job.skills_required.map((s, i) => (
                    <span key={i} style={S.skill}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Proposal form */}
            {showForm && (
              <div style={S.proposalWrap}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                  <div style={S.cardIconBox(`linear-gradient(135deg,${C.p600},${C.p700})`, '#fff')}>
                    <SendIcon size={15} />
                  </div>
                  <h2 style={{ ...S.cardTitle, fontSize:16 }}>Your Proposal</h2>
                </div>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom:14 }}>
                    <label style={S.label}>Cover Letter *</label>
                    <textarea
                      rows={5} required minLength={50}
                      placeholder="Explain why you're the best fit for this project (min. 50 characters)..."
                      style={S.textarea}
                      value={proposalData.cover_letter}
                      onChange={e => setProposalData({...proposalData, cover_letter: e.target.value})}
                      onFocus={e => e.target.style.borderColor = C.p500}
                      onBlur={e  => e.target.style.borderColor = C.border}
                    />
                  </div>
                  <div style={S.twoCol}>
                    <div>
                      <label style={S.label}>Your Bid (TND) *</label>
                      <input type="number" required min={1}
                        placeholder="e.g. 800"
                        style={S.inputField}
                        value={proposalData.bid_amount}
                        onChange={e => setProposalData({...proposalData, bid_amount: e.target.value})}
                        onFocus={e => e.target.style.borderColor = C.p500}
                        onBlur={e  => e.target.style.borderColor = C.border}
                      />
                    </div>
                    <div>
                      <label style={S.label}>Delivery Days *</label>
                      <input type="number" required min={1}
                        placeholder="e.g. 14"
                        style={S.inputField}
                        value={proposalData.delivery_days}
                        onChange={e => setProposalData({...proposalData, delivery_days: e.target.value})}
                        onFocus={e => e.target.style.borderColor = C.p500}
                        onBlur={e  => e.target.style.borderColor = C.border}
                      />
                    </div>
                  </div>
                  <div style={S.formActions}>
                    <button type="button" style={S.btnCancel} onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" style={S.btnSubmit} disabled={submitting}>
                      <SendIcon size={14} />
                      {submitting ? 'Submitting…' : 'Submit Proposal'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Success banner */}
            {submitted && (
              <div style={S.successBanner}>
                <div style={S.successIcon}>✓</div>
                <div>
                  <div style={{ fontWeight:700, color:C.g600, fontSize:15, marginBottom:3 }}>
                    Proposal submitted successfully!
                  </div>
                  <div style={{ fontSize:13, color:C.gray500 }}>
                    The client will review your proposal and reach out via messages.
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside style={S.sidebar}>

            {/* Action card — dark blue */}
            <div style={S.actionCard}>

              {/* Client info */}
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>
                Posted by
              </p>
              <div style={S.clientRow}>
                {job.profiles?.avatar_url
                  ? <img src={job.profiles.avatar_url} alt={job.profiles.full_name} style={S.clientAvatar} />
                  : <div style={S.clientInitials}>{clientInitials}</div>
                }
                <div>
                  <p style={S.clientName}>{job.profiles?.full_name || 'Client'}</p>
                  <p style={S.clientSub}>Client · TechLink TN</p>
                </div>
              </div>

              <div style={S.dividerW} />

              {/* CTA buttons — context-aware */}
              {!user && (
                <>
                  <Link to="/login" style={S.btnWhite}>
                    <SendIcon size={14} /> Login to Apply
                  </Link>
                  <Link to={`/login`} style={S.btnGhostW}>
                    <MsgIcon /> Message Client
                  </Link>
                </>
              )}

              {canApply && (
                <>
                  <button style={S.btnWhite} onClick={() => setShowForm(v => !v)}>
                    <SendIcon size={14} />
                    {showForm ? 'Hide Proposal Form' : 'Apply Now'}
                  </button>
                  <Link
                    to={`/messages/new?userId=${job.user_id}`}
                    style={S.btnGhostW}
                  >
                    <MsgIcon /> Message Client
                  </Link>
                </>
              )}

              {submitted && (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:8,
                    background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)',
                    borderRadius:100, padding:'10px 16px',
                    color:'#4ade80', fontSize:13, fontWeight:700, justifyContent:'center' }}>
                    ✓ Proposal Sent
                  </div>
                  <Link to={`/messages/new?userId=${job.user_id}`} style={S.btnGhostW}>
                    <MsgIcon /> Message Client
                  </Link>
                </>
              )}

              {user?.role === 'client' && !isOwner && (
                <Link to={`/messages/new?userId=${job.user_id}`} style={S.btnWhite}>
                  <MsgIcon /> Message Client
                </Link>
              )}

              {isOwner && (
                <Link to={`/dashboard/jobs/${id}/proposals`} style={S.btnWhite}>
                  <SendIcon size={14} /> View Proposals ({proposalCount})
                </Link>
              )}

              {!isOpen && !isOwner && (
                <div style={{ textAlign:'center', color:'rgba(255,255,255,0.45)',
                  fontSize:13, padding:'4px 0' }}>
                  This job is no longer open.
                </div>
              )}
            </div>

            {/* Job details — only non-repeated, unique info */}
            <div style={S.card}>
              <div style={{ ...S.cardHdr, marginBottom:12 }}>
                <div style={S.cardIconBox(C.p50, C.p600)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h2 style={S.cardTitle}>Details</h2>
              </div>
              {[
                { label:'Duration',    value: job.duration || 'Flexible' },
                { label:'Job Type',    value: job.type || 'Not specified' },
                { label:'Posted',      value: new Date(job.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) },
                { label:'Deadline',    value: job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'Not set' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', padding:'9px 0', borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:12, color:C.text3, fontWeight:600,
                    textTransform:'uppercase', letterSpacing:'0.04em' }}>
                    {label}
                  </span>
                  <span style={{ fontSize:13, fontWeight:700, color:C.text1 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Share */}
            <div style={{ ...S.card, padding:16, display:'flex', flexDirection:'column', gap:10 }}>
              <button style={copied ? {...S.btnOutlineBlue, color:C.g600, borderColor:C.g500} : S.btnOutlineBlue}
                onClick={handleCopy}>
                <ShareIcon /> {copied ? 'Link Copied!' : 'Share This Job'}
              </button>
              <Link to="/jobs" style={S.btnGray}>
                <ArrowLeftIcon size={14} /> Browse More Jobs
              </Link>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}