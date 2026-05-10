import { useState, useEffect } from 'react'
import api from '../config/api'

export const useJobs = (filters = {}) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchJobs()
  }, [filters.page, filters.category, filters.search])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const { data } = await api.get(`/jobs?${params}`)
      setJobs(data.jobs)
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  return { jobs, loading, error, pagination, refetch: fetchJobs }
}