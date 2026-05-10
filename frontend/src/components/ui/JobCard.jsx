import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPinIcon, ClockIcon, DollarSignIcon, BookmarkIcon } from './Icons'
import api from '../../config/api'
import './JobCard.css'  // import the new CSS

export default function JobCard({ job, showActions = true }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!showActions) return
    try {
      setSaving(true)
      if (saved) {
        await api.delete(`/saved-jobs/${job.id}`)
        setSaved(false)
      } else {
        await api.post('/saved-jobs', { job_id: job.id })
        setSaved(true)
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="job-card-custom">
      {/* Header row with avatar, title, and save button */}
      <div className="job-card-header-row">
        <img
          src={job.profiles?.avatar_url || '/default-avatar.png'}
          alt={job.profiles?.full_name}
          className="job-card-avatar"
        />
        <div className="job-card-header-info">
          <h3 className="job-card-title">{job.title}</h3>
          <div className="job-card-client">{job.profiles?.full_name}</div>
        </div>
        {showActions && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`job-card-save-btn ${saved ? 'saved' : ''}`}
          >
            <BookmarkIcon size={18} />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="job-card-description">{job.description}</p>

      {/* Skills */}
      <div className="job-card-skills">
        {job.skills_required?.slice(0, 4).map((skill, idx) => (
          <span key={idx} className="job-card-skill">{skill}</span>
        ))}
        {job.skills_required?.length > 4 && (
          <span className="job-card-skill">+{job.skills_required.length - 4}</span>
        )}
      </div>

      {/* Budget, duration, location */}
      <div className="job-card-info-row">
        <div className="job-card-info-group">
          <span className="job-card-info-item">
            <DollarSignIcon size={14} />
            {job.budget_min && job.budget_max
              ? `${job.budget_min} - ${job.budget_max} TND`
              : 'Negotiable'}
          </span>
          <span className="job-card-info-item">
            <ClockIcon size={14} />
            {job.duration || 'Flexible'}
          </span>
        </div>
        <span className="job-card-info-item">
          <MapPinIcon size={14} />
          {job.profiles?.location || 'Remote'}
        </span>
      </div>

      {/* Footer: proposals, date, and view button */}
      <div className="job-card-footer">
        <div className="job-card-stats">
          {job.proposal_count || 0} proposals · {new Date(job.created_at).toLocaleDateString()}
        </div>
        <Link to={`/jobs/${job.id}`} className="job-card-button">
          View Details
        </Link>
      </div>
    </div>
  )
}