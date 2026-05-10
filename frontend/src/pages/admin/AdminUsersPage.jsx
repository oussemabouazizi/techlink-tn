import { useState, useEffect } from 'react'
import api from '../../config/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { SearchIcon, BanIcon, CheckCircleIcon } from '../../components/ui/Icons'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/admin/users?page=${page}&search=${search}`)
      setUsers(data.users)
      setPagination({ total: data.total, page: data.page, totalPages: data.totalPages })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const handleBan = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}/ban`, { is_banned: !currentStatus })
      fetchUsers()
    } catch { alert('Failed to update user') }
  }

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />

  return (
    <div className="container py-8">
      <div className="page-header"><h1>User Management</h1><p>Manage platform users</p></div>
      <div className="mb-6 max-w-md"><div className="relative"><SearchIcon size={18} className="absolute left-3 top-3 text-gray-400" /><input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search users..." className="input pl-10" /></div></div>
      <div className="table-container"><table className="table"><thead><tr><th>User</th><th>Role</th><th>Plan</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td><div className="flex items-center gap-3"><img src={u.avatar_url || '/default-avatar.png'} className="w-10 h-10 rounded-full" /><div><p className="font-medium">{u.full_name}</p><p className="text-sm text-gray-500">{u.email}</p></div></div></td>
            <td className="capitalize">{u.role}</td><td><span className="badge badge-info capitalize">{u.subscriptions?.plan || 'free'}</span></td>
            <td>{u.is_banned ? <span className="flex items-center gap-1 text-red-600"><BanIcon size={14} /> Banned</span> : <span className="flex items-center gap-1 text-green-600"><CheckCircleIcon size={14} /> Active</span>}</td>
            <td className="text-right"><button onClick={() => handleBan(u.id, u.is_banned)} className={`p-2 rounded ${u.is_banned ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}>{u.is_banned ? <CheckCircleIcon size={20} /> : <BanIcon size={20} />}</button></td>
          </tr>
        ))}
      </tbody></table></div>
      {pagination.totalPages > 1 && <div className="pagination mt-8">{Array.from({ length: pagination.totalPages }, (_, i) => i+1).map(p => (<button key={p} onClick={() => setPage(p)} className={`page-btn ${p === page ? 'page-btn-active' : ''}`}>{p}</button>))}</div>}
    </div>
  )
}