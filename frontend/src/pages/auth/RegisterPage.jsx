import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MailIcon, LockIcon, UserIcon, BriefcaseIcon, EyeIcon, EyeOffIcon } from '../../components/ui/Icons';
// Import needed icons directly from lucide-react (they are already installed)
import { User, Briefcase, Code, DollarSign } from 'lucide-react';

const JOB_TITLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Mobile Developer (React Native)', 'Mobile Developer (Flutter)',
  'DevOps Engineer', 'Cloud Architect', 'Data Scientist', 'Data Analyst',
  'Machine Learning Engineer', 'UI/UX Designer', 'Graphic Designer',
  'Product Manager', 'Project Manager', 'QA Tester', 'Cybersecurity Specialist',
  'Blockchain Developer', 'Game Developer', 'IT Support Specialist',
  'System Administrator', 'Database Administrator', 'Technical Writer',
  'SEO Specialist', 'Digital Marketer', 'Other'
];

const SKILLS_LIST = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Django',
  'Flask', 'Java', 'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby on Rails',
  'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'HTML5', 'CSS3', 'SASS',
  'Tailwind CSS', 'Bootstrap', 'GraphQL', 'REST API', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Firebase', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
  'GitHub', 'GitLab', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'SEO', 'WordPress'
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: searchParams.get('role') || 'freelancer',
    username: ''
  });

  const [extra, setExtra] = useState({
    title: '',
    skills: [],
    hourly_rate: '',
    company_name: ''
  });

  const [titleInput, setTitleInput] = useState('');
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const filteredTitles = JOB_TITLES.filter(title =>
    title.toLowerCase().includes(titleInput.toLowerCase())
  );

  const [skillInput, setSkillInput] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const filteredSkills = SKILLS_LIST.filter(skill =>
    skill.toLowerCase().includes(skillInput.toLowerCase()) && !extra.skills.includes(skill)
  );

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectTitle = (title) => {
    setExtra({ ...extra, title });
    setTitleInput(title);
    setShowTitleDropdown(false);
  };

  const addSkill = (skill) => {
    if (!extra.skills.includes(skill)) {
      setExtra({ ...extra, skills: [...extra.skills, skill] });
    }
    setSkillInput('');
    setShowSkillDropdown(false);
  };

  const removeSkill = (skill) => {
    setExtra({ ...extra, skills: extra.skills.filter(s => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = { ...formData };
    if (formData.role === 'freelancer') {
      payload.title = extra.title;
      payload.skills = extra.skills.join(',');
      payload.hourly_rate = extra.hourly_rate;
    } else if (formData.role === 'client') {
      payload.company_name = extra.company_name;
    }
    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '580px', padding: '2rem' }}>
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join TechLink TN today</p>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <div className="auth-role-toggle">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'freelancer' })}
            className={`auth-role-btn ${formData.role === 'freelancer' ? 'auth-role-btn-active' : ''}`}
          >
            <BriefcaseIcon size={14} className="role-icon" /> Freelancer
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'client' })}
            className={`auth-role-btn ${formData.role === 'client' ? 'auth-role-btn-active' : ''}`}
          >
            <UserIcon size={14} className="role-icon" /> Client
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="relative">
              <UserIcon size={18} className="input-icon" />
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="input"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Username – using lucide-react User icon */}
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="relative">
              <User size={18} className="input-icon" />
              <input
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="input"
                placeholder="johndoe"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="relative">
              <MailIcon size={18} className="input-icon" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative">
              <LockIcon size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="input password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-icon"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {formData.role === 'freelancer' && (
            <>
              {/* Professional Title – using lucide-react Briefcase icon */}
              <div className="form-group">
                <label className="form-label">Professional Title</label>
                <div className="relative">
                  <Briefcase size={18} className="input-icon" />
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => {
                      setTitleInput(e.target.value);
                      setExtra({ ...extra, title: e.target.value });
                      setShowTitleDropdown(true);
                    }}
                    onFocus={() => setShowTitleDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTitleDropdown(false), 200)}
                    className="input"
                    placeholder="Type to search or select title..."
                    autoComplete="off"
                  />
                </div>
                {showTitleDropdown && filteredTitles.length > 0 && (
                  <div className="search-dropdown">
                    {filteredTitles.map(title => (
                      <div key={title} onMouseDown={() => selectTitle(title)} className="dropdown-option">
                        {title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills – using lucide-react Code icon */}
              <div className="form-group">
                <label className="form-label">Skills</label>
                <div className="relative">
                  <Code size={18} className="input-icon" />
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                    className="input"
                    placeholder="Type to search skills..."
                    autoComplete="off"
                  />
                </div>
                {showSkillDropdown && filteredSkills.length > 0 && (
                  <div className="search-dropdown">
                    {filteredSkills.map(skill => (
                      <div key={skill} onMouseDown={() => addSkill(skill)} className="dropdown-option">
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
                <div className="skills-tags">
                  {extra.skills.map(skill => (
                    <span key={skill} className="tag tag-secondary" onClick={() => removeSkill(skill)}>
                      {skill} ✕
                    </span>
                  ))}
                </div>
              </div>

              {/* Hourly Rate – using lucide-react DollarSign icon */}
              <div className="form-group">
                <label className="form-label">Hourly Rate (TND)</label>
                <div className="relative">
                  <DollarSign size={18} className="input-icon" />
                  <input
                    type="number"
                    value={extra.hourly_rate}
                    onChange={e => setExtra({ ...extra, hourly_rate: e.target.value })}
                    className="input"
                    placeholder="50"
                  />
                </div>
              </div>
            </>
          )}

          {/* Client Company Name (Optional) */}
          {formData.role === 'client' && (
            <div className="form-group">
              <label className="form-label">Company Name (optional)</label>
              <input
                type="text"
                value={extra.company_name}
                onChange={e => setExtra({ ...extra, company_name: e.target.value })}
                className="input"
                placeholder="Acme Inc."
              />
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="flex items-center">
            <input type="checkbox" required className="mr-2" />
            <span className="text-sm">
              I agree to the <Link to="/terms" className="text-primary">Terms</Link> and <Link to="/privacy" className="text-primary">Privacy Policy</Link>
            </span>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-semibold">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-spinner-sm inline-block"></span> Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="font-semibold hover:underline">Sign in</Link>
        </div>
      </div>

      {/* Keep the same <style> as before – no changes needed */}
      <style>{`
        .form-group {
          margin-bottom: var(--space-6);
          position: relative;
        }
        .relative {
          position: relative;
          width: 100%;
        }
        .input {
          width: 100%;
          padding-left: var(--space-8);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          font-size: var(--text-base);
          transition: all 0.2s ease;
          background: var(--bg-primary);
          height: 44px;
        }
        .password-input {
          padding-right: var(--space-8);
        }
        .input-icon {
          position: absolute;
          left: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          z-index: 10;
          margin: 0;
          padding: 0;
        }
        .password-toggle-icon {
          position: absolute;
          right: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
          z-index: 10;
        }
        .password-toggle-icon:hover {
          color: var(--primary-600);
        }
        .role-icon {
          margin-right: var(--space-2);
          vertical-align: middle;
        }
        .search-dropdown {
          position: absolute;
          top: calc(100% + var(--space-1));
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          max-height: 200px;
          overflow-y: auto;
          z-index: 15;
          margin-top: var(--space-1);
        }
        .dropdown-option {
          padding: 0.5rem 1rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.15s;
        }
        .dropdown-option:hover {
          background: #f3f4f6;
        }
        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: var(--space-3);
        }
        .loading-spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .input:focus {
          outline: none;
          border-color: var(--primary-400);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
      `}</style>
    </div>
  );
}