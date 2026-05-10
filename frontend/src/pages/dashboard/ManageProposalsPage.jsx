import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../config/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { ArrowLeftIcon } from '../../components/ui/Icons'

// ── tokens ─────────────────────────────────────────────────
const C = {
  p50:'#eff6ff', p100:'#dbeafe', p200:'#bfdbfe',
  p500:'#3b82f6', p600:'#2563eb', p700:'#1d4ed8', p800:'#1e40af', p900:'#1e3a8a',
  g50:'#f0fdf4', g100:'#dcfce7', g500:'#22c55e', g600:'#16a34a', g700:'#15803d',
  r50:'#fef2f2', r100:'#fee2e2', r500:'#ef4444', r600:'#dc2626',
  amber:'#f59e0b', amberBg:'#fef3c7', amberDark:'#92400e',
  gray50:'#f9fafb', gray100:'#f3f4f6', gray200:'#e5e7eb',
  gray300:'#d1d5db', gray400:'#9ca3af', gray500:'#6b7280',
  gray600:'#4b5563', gray700:'#374151', gray900:'#111827',
  white:'#ffffff', bg:'#f8fafc', border:'#e5e7eb',
  text1:'#111827', text2:'#4b5563', text3:'#9ca3af',
  purple:'#8b5cf6', purpleBg:'#ede9fe',
}

// ── inline svg icons ────────────────────────────────────────
const CheckIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const XIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const MsgIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const UserIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const TndIcon = () => (
  <span style={{ fontWeight:800, fontSize:11, letterSpacing:'0.02em' }}>TND</span>
)
const ClockIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const SendIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

// ── status config ───────────────────────────────────────────
const STATUS = {
  pending:  { label:'Pending',  bg:C.amberBg, border:'rgba(245,158,11,0.3)', color:C.amber,   dot:'#f59e0b' },
  accepted: { label:'Accepted', bg:C.g50,     border:'rgba(34,197,94,0.3)',  color:C.g600,    dot:'#22c55e' },
  rejected: { label:'Rejected', bg:C.r50,     border:'rgba(239,68,68,0.3)',  color:C.r500,    dot:'#ef4444' },
}

function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.pending
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      background:cfg.bg, border:`1px solid ${cfg.border}`,
      color:cfg.color, fontSize:11, fontWeight:700, padding:'4px 10px',
      borderRadius:100, textTransform:'capitalize', whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%',
        background:cfg.dot, flexShrink:0, display:'inline-block' }} />
      {cfg.label}
    </span>
  )
}

function ProposalCard({ proposal, onAccept, onReject, updating }) {
  const [expanded, setExpanded] = useState(false)
  const isUpdating = updating === proposal.id
  const isPending  = proposal.status === 'pending'
  const isAccepted = proposal.status === 'accepted'
  const name       = proposal.profiles?.full_name || 'Freelancer'
  const title      = proposal.profiles?.freelancer_profiles?.title || 'Freelancer'
  const avatar     = proposal.profiles?.avatar_url
  const initials   = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
  const letter     = proposal.cover_letter || ''
  const preview    = letter.length > 160 ? letter.slice(0, 160) + '…' : letter

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${isAccepted ? 'rgba(34,197,94,0.35)' : C.border}`,
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: isAccepted
        ? '0 4px 20px rgba(34,197,94,0.1)'
        : '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Accepted accent bar */}
      {isAccepted && (
        <div style={{ height:3, background:`linear-gradient(90deg,${C.g500},${C.g600})` }} />
      )}

      <div style={{ padding:'22px 24px' }}>
        {/* Top row: avatar + name + status + actions */}
        <div style={{ display:'flex', alignItems:'flex-start',
          justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:18 }}>

          {/* Left: avatar + info */}
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            {avatar
              ? <img src={avatar} alt={name} style={{
                  width:52, height:52, borderRadius:'50%', objectFit:'cover',
                  border:`2px solid ${C.p100}`, flexShrink:0 }} />
              : <div style={{ width:52, height:52, borderRadius:'50%', flexShrink:0,
                  background:`linear-gradient(135deg,${C.p600},${C.p800})`,
                  color:C.white, fontSize:17, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {initials}
                </div>
            }
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:C.text1, marginBottom:3 }}>
                {name}
              </div>
              <div style={{ fontSize:13, color:C.p600, fontWeight:500, marginBottom:4 }}>
                {title}
              </div>
              <StatusBadge status={proposal.status} />
            </div>
          </div>

          {/* Right: bid + delivery chips */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7,
              background:C.p50, border:`1px solid ${C.p200}`,
              borderRadius:12, padding:'10px 16px' }}>
              <TndIcon />
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:C.p700, lineHeight:1 }}>
                  {proposal.bid_amount}
                </div>
                <div style={{ fontSize:10, color:C.text3, fontWeight:600,
                  textTransform:'uppercase', letterSpacing:'0.04em', marginTop:2 }}>
                  Bid
                </div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:7,
              background:C.amberBg, border:`1px solid rgba(245,158,11,0.3)`,
              borderRadius:12, padding:'10px 16px' }}>
              <ClockIcon size={15} />
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:C.amber, lineHeight:1 }}>
                  {proposal.delivery_days}
                </div>
                <div style={{ fontSize:10, color:C.gray400, fontWeight:600,
                  textTransform:'uppercase', letterSpacing:'0.04em', marginTop:2 }}>
                  Days
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cover letter */}
        <div style={{ background:C.gray50, border:`1px solid ${C.border}`,
          borderRadius:12, padding:'14px 16px', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <SendIcon size={12} />
            <span style={{ fontSize:11, fontWeight:700, color:C.text3,
              textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Cover Letter
            </span>
          </div>
          <p style={{ fontSize:14, color:C.text2, lineHeight:1.72, margin:0 }}>
            {expanded ? letter : preview}
          </p>
          {letter.length > 160 && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{ background:'none', border:'none', color:C.p600,
                fontSize:12, fontWeight:700, cursor:'pointer',
                padding:'6px 0 0', fontFamily:'inherit' }}>
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          {/* Always: view profile + message */}
          <Link
            to={`/freelancers/${proposal.freelancer_id}`}
            style={{ display:'inline-flex', alignItems:'center', gap:6,
              background:C.gray100, border:`1px solid ${C.border}`,
              color:C.gray700, fontSize:12, fontWeight:600,
              padding:'8px 14px', borderRadius:100, textDecoration:'none' }}>
            <UserIcon size={13} /> View Profile
          </Link>
          <Link
            to={`/messages/${proposal.freelancer_id}`}
            style={{ display:'inline-flex', alignItems:'center', gap:6,
              background:C.p50, border:`1px solid ${C.p200}`,
              color:C.p600, fontSize:12, fontWeight:600,
              padding:'8px 14px', borderRadius:100, textDecoration:'none' }}>
            <MsgIcon size={13} /> Message
          </Link>

          {/* Pending: accept / reject */}
          {isPending && (
            <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
              <button
                onClick={() => onReject(proposal.id)}
                disabled={isUpdating}
                style={{ display:'inline-flex', alignItems:'center', gap:6,
                  background:C.r50, border:`1px solid rgba(239,68,68,0.3)`,
                  color:C.r500, fontSize:12, fontWeight:700,
                  padding:'8px 16px', borderRadius:100, cursor:'pointer',
                  fontFamily:'inherit', opacity: isUpdating ? 0.6 : 1 }}>
                <XIcon size={13} />
                {isUpdating ? '…' : 'Reject'}
              </button>
              <button
                onClick={() => onAccept(proposal.id)}
                disabled={isUpdating}
                style={{ display:'inline-flex', alignItems:'center', gap:6,
                  background:`linear-gradient(135deg,${C.g500},${C.g600})`,
                  border:'none', color:C.white, fontSize:12, fontWeight:700,
                  padding:'8px 18px', borderRadius:100, cursor:'pointer',
                  fontFamily:'inherit',
                  boxShadow:'0 3px 10px rgba(34,197,94,0.35)',
                  opacity: isUpdating ? 0.6 : 1 }}>
                <CheckIcon size={13} />
                {isUpdating ? 'Updating…' : 'Accept'}
              </button>
            </div>
          )}

          {/* Accepted: show accepted label */}
          {isAccepted && (
            <div style={{ marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:6,
              color:C.g600, fontSize:12, fontWeight:700 }}>
              <CheckIcon size={13} /> Hired
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ManageProposalsPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [updating, setUpdating]   = useState(null)
  const [filter, setFilter]       = useState('all') // 'all' | 'pending' | 'accepted' | 'rejected'

  const fetchProposals = async () => {
    try {
      const { data } = await api.get(`/proposals/job/${id}`)
      setProposals(data)
    } catch {
      setError('Failed to load proposals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProposals() }, [id])

  const updateStatus = async (proposalId, status) => {
    setUpdating(proposalId)
    try {
      await api.put(`/proposals/${proposalId}/status`, { status })
      setProposals(prev =>
        prev.map(p => p.id === proposalId ? { ...p, status } : p)
      )
    } catch {
      alert('Failed to update proposal status')
    } finally {
      setUpdating(null) }
  }

  const counts = {
    all:      proposals.length,
    pending:  proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  }

  const filtered = filter === 'all' ? proposals : proposals.filter(p => p.status === filter)

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />

  return (
    <div style={{
      background: C.bg, minHeight:'100vh', padding:'32px 0 80px',
      fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    }}>
      <div style={{ maxWidth:860, margin:'0 auto', padding:'0 24px' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom:28 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display:'inline-flex', alignItems:'center', gap:7,
              background:'none', border:'none', color:C.gray500, fontSize:14,
              fontWeight:600, cursor:'pointer', padding:'6px 0', marginBottom:20,
              fontFamily:'inherit' }}>
            <ArrowLeftIcon size={15} /> Back
          </button>

          {/* Title + summary */}
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'flex-end', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, color:C.text1,
                margin:'0 0 6px', letterSpacing:'-0.02em' }}>
                Proposals
              </h1>
              <p style={{ fontSize:14, color:C.text3, margin:0, fontWeight:500 }}>
                {counts.all} total · {counts.pending} pending · {counts.accepted} accepted
              </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display:'flex', background:C.white,
              border:`1px solid ${C.border}`, borderRadius:12,
              padding:4, gap:3 }}>
              {[
                { key:'all',      label:`All (${counts.all})` },
                { key:'pending',  label:`Pending (${counts.pending})` },
                { key:'accepted', label:`Accepted (${counts.accepted})` },
                { key:'rejected', label:`Rejected (${counts.rejected})` },
              ].map(({ key, label }) => (
                <button key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    background: filter === key
                      ? key === 'accepted' ? C.g600
                        : key === 'rejected' ? C.r500
                        : C.p600
                      : 'transparent',
                    border: 'none',
                    color: filter === key ? C.white : C.gray500,
                    fontSize: 12, fontWeight: 600,
                    padding: '6px 14px', borderRadius: 9,
                    cursor: 'pointer', fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        {proposals.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)',
            gap:12, marginBottom:24 }}>
            {[
              { label:'Avg. Bid', value: proposals.length
                  ? `${Math.round(proposals.reduce((a,p)=>a+(+p.bid_amount||0),0)/proposals.length)} TND`
                  : '—',
                bg:C.p50, border:C.p200, color:C.p700 },
              { label:'Lowest Bid', value: proposals.length
                  ? `${Math.min(...proposals.map(p=>+p.bid_amount||Infinity))} TND`
                  : '—',
                bg:C.g50, border:'rgba(34,197,94,0.25)', color:C.g700 },
              { label:'Avg. Delivery', value: proposals.length
                  ? `${Math.round(proposals.reduce((a,p)=>a+(+p.delivery_days||0),0)/proposals.length)} days`
                  : '—',
                bg:C.amberBg, border:'rgba(245,158,11,0.3)', color:C.amber },
            ].map(({ label, value, bg, border, color }) => (
              <div key={label} style={{ background:bg, border:`1px solid ${border}`,
                borderRadius:14, padding:'16px 20px', textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, color, marginBottom:3 }}>{value}</div>
                <div style={{ fontSize:11, color:C.text3, fontWeight:600,
                  textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div style={{ background:C.r50, border:'1px solid rgba(239,68,68,0.3)',
            color:C.r600, borderRadius:12, padding:'14px 18px',
            fontSize:14, fontWeight:600, marginBottom:20 }}>
            {error}
          </div>
        )}

        {/* ── EMPTY ── */}
        {!error && filtered.length === 0 && (
          <div style={{ background:C.white, border:`1px solid ${C.border}`,
            borderRadius:18, padding:'64px 24px', textAlign:'center',
            boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
            <p style={{ fontSize:16, fontWeight:700, color:C.text1, margin:'0 0 6px' }}>
              {filter === 'all' ? 'No proposals yet' : `No ${filter} proposals`}
            </p>
            <p style={{ fontSize:14, color:C.text3, margin:0 }}>
              {filter === 'all'
                ? 'Share your job to start receiving proposals.'
                : `Switch to "All" to see all proposals.`}
            </p>
          </div>
        )}

        {/* ── PROPOSAL LIST ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map(proposal => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              updating={updating}
              onAccept={(pid) => updateStatus(pid, 'accepted')}
              onReject={(pid) => updateStatus(pid, 'rejected')}
            />
          ))}
        </div>

      </div>
    </div>
  )
}