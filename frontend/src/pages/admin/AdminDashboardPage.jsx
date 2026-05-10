import  { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../config/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { UsersIcon, BriefcaseIcon, FileTextIcon, DollarSignIcon, } from '../../components/ui/Icons'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard')
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) return <LoadingSpinner size="xl" className="min-h-screen" />

  const statCards = [
    { name: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: UsersIcon, color: 'stat-icon-blue' },
    { name: 'Total Jobs', value: stats?.stats?.totalJobs || 0, icon: BriefcaseIcon, color: 'stat-icon-green' },
    { name: 'Proposals', value: stats?.stats?.totalProposals || 0, icon: FileTextIcon, color: 'stat-icon-yellow' },
    { name: 'Contracts', value: stats?.stats?.totalContracts || 0, icon: DollarSignIcon, color: 'stat-icon-purple' }
  ]

  return (
    <div className="container py-8">
      <div className="page-header"><h1>Admin Dashboard</h1><p>Platform overview and management</p></div>
      <div className="grid grid-4 gap-6 mb-8">
        {statCards.map(s => (
          <div key={s.name} className="stat-card">
            <div className={`stat-icon ${s.color}`}><s.icon size={24} /></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.name}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-2 gap-8">
        <div className="card p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Recent Users</h2><Link to="/admin/users" className="text-primary text-sm">View All</Link></div><div className="space-y-3">{stats?.recentUsers?.map(u => (<div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-3"><img src={u.avatar_url || '/default-avatar.png'} className="w-8 h-8 rounded-full" /><div><p className="font-medium">{u.full_name}</p><p className="text-xs text-gray-500">{u.email}</p></div></div><span className={`badge ${u.is_banned ? 'badge-error' : 'badge-success'}`}>{u.is_banned ? 'Banned' : 'Active'}</span></div>))}</div></div>
        <div className="card p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Recent Jobs</h2><Link to="/admin/jobs" className="text-primary text-sm">View All</Link></div><div className="space-y-3">{stats?.recentJobs?.map(j => (<div key={j.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">{j.title}</p><p className="text-xs text-gray-500">by {j.profiles?.full_name}</p></div><span className={`badge ${j.status === 'open' ? 'badge-success' : 'badge-gray'}`}>{j.status}</span></div>))}</div></div>
      </div>
    </div>
  )
}