import { useState, useEffect } from 'react'
import api from '../../config/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {  EyeIcon, CheckCircleIcon, XCircleIcon } from '../../components/ui/Icons'

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/admin/jobs?page=${page}`)
      setJobs(data.jobs)
      setPagination({ total: data.total, page: data.page, totalPages: data.totalPages })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [page])

  const handleModerate = async (id, status) => {
    try {
      await api.put(`/jobs/${id}`, { status })
      fetchJobs()
    } catch { alert('Failed to update job') }
  }

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />

  return (
    <div className="container py-8">
      <div className="page-header"><h1>Job Moderation</h1><p>Review and moderate job postings</p></div>
      <div className="table-container"><table className="table"><thead><tr><th>Job</th><th>Client</th><th>Status</th><th>Date</th><th className="text-right">Actions</th></tr></thead><tbody>
        {jobs.map(j => (
          <tr key={j.id}>
            <td><div><p className="font-medium">{j.title}</p><p className="text-sm text-gray-500 line-clamp-1">{j.description}</p></div></td>
            <td><div><p>{j.profiles?.full_name}</p><p className="text-xs text-gray-500">{j.profiles?.email}</p></div></td>
            <td><span className={`badge ${j.status === 'open' ? 'badge-success' : 'badge-gray'}`}>{j.status}</span></td>
            <td>{new Date(j.created_at).toLocaleDateString()}</td>
            <td className="text-right"><div className="flex justify-end gap-2"><a href={`/jobs/${j.id}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary"><EyeIcon size={16} /></a><button onClick={() => handleModerate(j.id, 'open')} className="text-gray-400 hover:text-green-600"><CheckCircleIcon size={16} /></button><button onClick={() => handleModerate(j.id, 'canceled')} className="text-gray-400 hover:text-red-600"><XCircleIcon size={16} /></button></div></td>
          </tr>
        ))}
      </tbody></table></div>
      {pagination.totalPages > 1 && <div className="pagination mt-8">{Array.from({ length: pagination.totalPages }, (_, i) => i+1).map(p => (<button key={p} onClick={() => setPage(p)} className={`page-btn ${p === page ? 'page-btn-active' : ''}`}>{p}</button>))}</div>}
    </div>
  )
}