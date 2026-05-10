import { Link } from 'react-router-dom';

const categoryIcons = {
  'Web Development': '🌐',
  'Mobile Development': '📱',
  'UI/UX Design': '🎨',
  'Graphic Design': '✏️',
  'DevOps & Cloud': '☁️',
  'Data Science & AI': '🤖',
  'Cybersecurity': '🔒',
  'Blockchain': '⛓️',
  'QA & Testing': '🧪',
  'IT Support': '💻',
  'Video & Animation': '🎬',
  'SEO & Digital Marketing': '📈',
};

export default function CategoryCard({ category }) {
  const icon = categoryIcons[category.name] || '📁';
  return (
    <Link to={`/jobs?category=${category.id}`} className="category-card">
      <div className="category-icon">{icon}</div>
      <h3 className="category-name">{category.name}</h3>
      <p className="category-description">{category.description || 'Find experts in this field'}</p>
      <div className="category-job-count">
        {category.job_count || 0} job{category.job_count !== 1 ? 's' : ''} available
      </div>
    </Link>
  );
}