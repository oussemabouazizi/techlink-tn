import  { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../config/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { EyeIcon, ClockIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon } from '../../components/ui/Icons'

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProposals = async () => {
    try {
      const { data } = await api.get('/proposals/my')
      setProposals(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  const getStatus = (status) => {
    const icons = { pending: <ClockIcon size={20} className="text-yellow-500" />, accepted: <CheckCircleIcon size={20} className="text-green-500" />, rejected: <XCircleIcon size={20} className="text-red-500" />, withdrawn: <AlertCircleIcon size={20} className="text-gray-500" /> }
    const colors = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-error', withdrawn: 'badge-gray' }
    return { icon: icons[status] || <ClockIcon size={20} />, color: colors[status] || 'badge-gray' }
  }

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />

  return (
    <div className="container py-8">
      <div className="page-header"><h1>My Proposals</h1><p>Track your job applications</p></div>
      {proposals.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📄</div><div className="empty-state-title">No proposals yet</div><Link to="/jobs" className="btn-primary">Browse Jobs</Link></div>
      ) : (
        <div className="space-y-4">
          {proposals.map(p => {
            const { icon, color } = getStatus(p.status)
            return (
              <div key={p.id} className="card p-6">
                <div className="flex justify-between"><div><h3 className="font-semibold text-lg">{p.jobs?.title}</h3><span className={`badge ${color} mt-1`}>{p.status}</span></div>{icon}</div>
                <div className="grid grid-4 gap-4 text-sm mt-4"><div><span className="text-gray-400">Bid Amount</span><p className="font-medium">{p.bid_amount} TND</p></div><div><span className="text-gray-400">Delivery</span><p>{p.delivery_days} days</p></div><div><span className="text-gray-400">Submitted</span><p>{new Date(p.created_at).toLocaleDateString()}</p></div><div><span className="text-gray-400">Client Viewed</span><p>{p.client_viewed ? 'Yes' : 'No'}</p></div></div>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg mt-4 line-clamp-2">{p.cover_letter}</p>
                <div className="mt-4 pt-4 border-t flex justify-end"><Link to={`/jobs/${p.job_id}`} className="flex items-center text-primary text-sm"><EyeIcon size={14} className="mr-1" /> View Job</Link></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}