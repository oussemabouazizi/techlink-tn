import { Link } from 'react-router-dom';
import { Star, MapPin,DollarSign } from 'lucide-react';

export default function FreelancerCard({ freelancer }) {
  const fullName = freelancer.full_name || 'Anonymous';
  const title = freelancer.freelancer_profiles?.title || 'Freelancer';
  const bio = freelancer.bio || 'No bio yet.';
  const location = freelancer.location || 'Tunisia';
  const skills = freelancer.freelancer_profiles?.skills || [];
  const hourlyRate = freelancer.freelancer_profiles?.hourly_rate || 0;
  const avatar = freelancer.avatar_url || '/default-avatar.png';
  const completedJobs = freelancer.completed_jobs || 0;
  const avgRating = freelancer.avg_rating || 0;
  const reviewCount = freelancer.review_count || 0;

  return (
    <div className="card-modern freelancer-card">
      <div className="freelancer-card-header">
        <img src={avatar} alt={fullName} className="freelancer-avatar" />
        <div className="freelancer-basic-info">
          <h3>{fullName}</h3>
          <div className="freelancer-title">{title}</div>
          <div className="freelancer-location">
            <MapPin size={12} /> <span>{location}</span>
          </div>
        </div>
      </div>

      <div className="freelancer-bio">{bio}</div>

      <div className="freelancer-skills">
        {skills.slice(0, 3).map((skill) => (
          <span key={skill} className="tag tag-secondary">#{skill}</span>
        ))}
        {skills.length === 0 && <span className="tag tag-gray">No skills</span>}
      </div>

      <div className="freelancer-stats">
        <div className="freelancer-stat">
          <div className="freelancer-stat-value">
            {avgRating > 0 ? (
              <span className="flex items-center justify-center gap-1">
                <Star size={12} fill="gold" stroke="gold" /> {avgRating}
              </span>
            ) : '—'}
          </div>
          <div className="freelancer-stat-label">{reviewCount} reviews</div>
        </div>
        <div className="freelancer-stat">
          <div className="freelancer-stat-value">{completedJobs}</div>
          <div className="freelancer-stat-label">jobs done</div>
        </div>
      </div>

      <div className="freelancer-rate">
        <div className="freelancer-rate-text">
          <DollarSign size={14} className="inline" /> {hourlyRate > 0 ? `${hourlyRate} TND/hr` : 'Not set'}
        </div>
        <Link to={`/freelancers/${freelancer.id}`} className="btn btn-outline btn-sm">
          View Profile
        </Link>
      </div>
    </div>
  );
}