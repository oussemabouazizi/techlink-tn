import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../config/api";
import {
  Camera, Save, Globe, Link as LinkIcon,
  MapPin, Phone, FileText, User, Briefcase,
  Award, Star, Clock, DollarSign, Languages,
} from "lucide-react";

// ── tokens ─────────────────────────────────────────────────
const C = {
  p50:'#eff6ff', p100:'#dbeafe', p200:'#bfdbfe',
  p500:'#3b82f6', p600:'#2563eb', p700:'#1d4ed8', p800:'#1e40af', p900:'#1e3a8a',
  g50:'#f0fdf4', g100:'#dcfce7', g500:'#22c55e', g600:'#16a34a',
  amber:'#f59e0b', amberBg:'#fef3c7',
  gray50:'#f9fafb', gray100:'#f3f4f6', gray200:'#e5e7eb',
  gray300:'#d1d5db', gray400:'#9ca3af', gray500:'#6b7280',
  gray600:'#4b5563', gray700:'#374151', gray900:'#111827',
  white:'#ffffff', bg:'#f8fafc', border:'#e5e7eb',
  text1:'#111827', text2:'#4b5563', text3:'#9ca3af',
  purple:'#8b5cf6', purpleBg:'#ede9fe',
  red:'#ef4444', redBg:'#fef2f2',
}

// ── Job Titles and Skills Lists ────────────────────────────
const JOB_TITLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Mobile Developer (React Native)', 'Mobile Developer (Flutter)',
  'DevOps Engineer', 'Cloud Architect', 'Data Scientist', 'Data Analyst',
  'Machine Learning Engineer', 'UI/UX Designer', 'Graphic Designer',
  'Product Manager', 'Project Manager', 'QA Tester', 'Cybersecurity Specialist',
  'Blockchain Developer', 'Game Developer', 'IT Support Specialist',
  'System Administrator', 'Database Administrator', 'Technical Writer',
  'SEO Specialist', 'Digital Marketer', 'Other'
]

const SKILLS_LIST = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Django',
  'Flask', 'Java', 'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby on Rails',
  'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'HTML5', 'CSS3', 'SASS',
  'Tailwind CSS', 'Bootstrap', 'GraphQL', 'REST API', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Firebase', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
  'GitHub', 'GitLab', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'SEO', 'WordPress'
]

// ── availability options ────────────────────────────────────
const AVAILABILITY_OPTIONS = [
  { value:'full_time',    label:'Full-time (40h/week)' },
  { value:'part_time',   label:'Part-time (20h/week)' },
  { value:'weekends',    label:'Weekends only' },
  { value:'not_available', label:'Not available' },
]
const EXPERIENCE_LEVELS = ['Entry Level','Intermediate','Senior','Expert/Lead']
const LANGUAGES = ['Arabic','French','English','German','Spanish','Italian','Other']

// ── reusable field components ───────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24,
      paddingBottom:16, borderBottom:`2px solid ${C.border}` }}>
      <div style={{ width:40, height:40, borderRadius:12,
        background:`linear-gradient(135deg,${C.p600},${C.p700})`,
        color:C.white, display:'flex', alignItems:'center', justifyContent:'center',
        flexShrink:0, boxShadow:'0 4px 12px rgba(37,99,235,0.25)' }}>
        {icon}
      </div>
      <div>
        <h2 style={{ fontSize:17, fontWeight:700, color:C.text1, margin:'0 0 2px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize:12, color:C.text3, margin:0, fontWeight:500 }}>{subtitle}</p>}
      </div>
    </div>
  )
}

function Field({ label, hint, children, span2 = false }) {
  return (
    <div style={{ gridColumn: span2 ? '1/-1' : undefined }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, color:C.gray600,
        textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>
        {label}
      </label>
      {hint && <p style={{ fontSize:11, color:C.text3, marginBottom:6, marginTop:-2 }}>{hint}</p>}
      {children}
    </div>
  )
}

function Input({ icon, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position:'relative' }}>
      {icon && (
        <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)',
          color: focused ? C.p500 : C.gray400, transition:'color 0.2s', pointerEvents:'none',
          display:'flex', alignItems:'center' }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e  => { setFocused(false); props.onBlur?.(e) }}
        style={{ width:'100%', padding: icon ? '10px 14px 10px 40px' : '10px 14px',
          border:`2px solid ${focused ? C.p500 : C.border}`,
          borderRadius:12, fontSize:14, color:C.text1, background:C.white,
          fontFamily:'inherit', outline:'none', boxSizing:'border-box',
          boxShadow: focused ? `0 0 0 3px ${C.p100}` : 'none',
          transition:'border-color 0.2s, box-shadow 0.2s',
          ...props.style }}
      />
    </div>
  )
}

function Textarea({ ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e  => { setFocused(false); props.onBlur?.(e) }}
      style={{ width:'100%', padding:'10px 14px',
        border:`2px solid ${focused ? C.p500 : C.border}`,
        borderRadius:12, fontSize:14, color:C.text1, background:C.white,
        fontFamily:'inherit', lineHeight:1.65, resize:'vertical',
        outline:'none', boxSizing:'border-box',
        boxShadow: focused ? `0 0 0 3px ${C.p100}` : 'none',
        transition:'border-color 0.2s, box-shadow 0.2s',
        ...props.style }}
    />
  )
}

function Select({ children, value, onChange, name }) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      name={name} value={value} onChange={onChange}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ width:'100%', padding:'10px 14px',
        border:`2px solid ${focused ? C.p500 : C.border}`,
        borderRadius:12, fontSize:14, color:C.text1, background:C.white,
        fontFamily:'inherit', outline:'none', boxSizing:'border-box',
        boxShadow: focused ? `0 0 0 3px ${C.p100}` : 'none',
        transition:'border-color 0.2s', cursor:'pointer',
        appearance:'none',
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center' }}>
      {children}
    </select>
  )
}

// Language row
function LanguageRow({ lang, onRemove }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'10px 14px', background:C.gray50, border:`1px solid ${C.border}`,
      borderRadius:10, marginBottom:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:18 }}>🌐</span>
        <span style={{ fontSize:14, fontWeight:600, color:C.text1 }}>{lang.language}</span>
        <span style={{ fontSize:12, color:C.text3, background:C.gray100,
          padding:'2px 8px', borderRadius:100 }}>{lang.level}</span>
      </div>
      <button type="button" onClick={onRemove}
        style={{ background:C.redBg, border:`1px solid rgba(239,68,68,0.25)`,
          color:C.red, width:26, height:26, borderRadius:'50%',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:14, fontFamily:'inherit' }}>
        ×
      </button>
    </div>
  )
}

// Tab button
function TabBtn({ active, onClick, icon, label, badge }) {
  return (
    <button type="button" onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:7,
        padding:'9px 16px', borderRadius:10, border:'none',
        background: active ? C.p600 : 'transparent',
        color: active ? C.white : C.gray500,
        fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
        whiteSpace:'nowrap', transition:'all 0.15s',
        boxShadow: active ? '0 2px 8px rgba(37,99,235,0.3)' : 'none' }}>
      {icon}
      {label}
      {badge && (
        <span style={{ background: active ? 'rgba(255,255,255,0.25)' : C.p100,
          color: active ? C.white : C.p600, fontSize:10, fontWeight:700,
          padding:'1px 6px', borderRadius:100 }}>{badge}</span>
      )}
    </button>
  )
}

// Profile completion meter
function CompletionMeter({ formData, role }) {
  const fields = ['full_name','bio','location','phone','avatar_url']
  const freelancerFields = ['title','hourly_rate','skills','experience_years','github_url','linkedin_url','availability']
  const allFields = role === 'freelancer' ? [...fields, ...freelancerFields] : fields
  const filled = allFields.filter(f => {
    const v = formData[f]
    return v !== '' && v !== null && v !== undefined && v !== '0'
  }).length
  const pct = Math.round((filled / allFields.length) * 100)
  const color = pct < 40 ? C.red : pct < 70 ? C.amber : C.g500

  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`,
      borderRadius:16, padding:'16px 20px', marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:13, fontWeight:700, color:C.text1 }}>Profile Completeness</span>
        <span style={{ fontSize:15, fontWeight:800, color }}>{pct}%</span>
      </div>
      <div style={{ background:C.gray100, borderRadius:100, height:8, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, borderRadius:100,
          background:`linear-gradient(90deg,${color},${color}cc)`,
          transition:'width 0.5s ease' }} />
      </div>
      <p style={{ fontSize:11, color:C.text3, marginTop:6, marginBottom:0 }}>
        {pct < 100
          ? `Complete your profile to attract more ${role === 'freelancer' ? 'clients' : 'talent'}.`
          : '🎉 Your profile is 100% complete!'}
      </p>
    </div>
  )
}

// Card wrapper component (moved outside main component)
function Card({ children, style }) {
  return (
    <div style={{ background:C.white, border:`1px solid ${C.border}`,
      borderRadius:18, padding:28,
      boxShadow:'0 1px 4px rgba(0,0,0,0.05)', ...style }}>
      {children}
    </div>
  )
}

// ── MAIN COMPONENT ──────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { addToast }         = useToast()
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // New state for searchable dropdowns
  const [titleInput, setTitleInput] = useState('')
  const [showTitleDropdown, setShowTitleDropdown] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)

  const [formData, setFormData] = useState({
    // basic
    full_name:'', username:'', bio:'', location:'', website:'', phone:'', avatar_url:'', cv_url:'',
    // freelancer professional
    title:'', hourly_rate:'', skills:'', experience_years:'',
    github_url:'', linkedin_url:'', twitter_url:'', portfolio_url:'',
    // new fields
    availability:'full_time',
    experience_level:'Intermediate',
    tagline:'',
    hourly_rate_min:'', hourly_rate_max:'',
    languages:[],
    education:[],
    certifications:[],
    // client fields
    company_name:'', company_size:'', industry:'', company_website:'',
  })

  const [newLang,  setNewLang]  = useState({ language:'English', level:'Professional' })
  const [newEdu,   setNewEdu]   = useState({ degree:'', institution:'', year:'' })
  const [newCert,  setNewCert]  = useState({ name:'', issuer:'', year:'' })

  // Filtered lists for dropdowns
  const filteredTitles = JOB_TITLES.filter(title =>
    title.toLowerCase().includes(titleInput.toLowerCase())
  )
  
  const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  const filteredSkills = SKILLS_LIST.filter(skill =>
    skill.toLowerCase().includes(skillInput.toLowerCase()) && !skillsArray.includes(skill)
  )

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/me')
        const profileTitle = data.freelancer_profiles?.title || ''
        setFormData({
          full_name:   data.full_name || '',
          username:    data.username  || '',
          bio:         data.bio       || '',
          location:    data.location  || '',
          website:     data.website   || '',
          phone:       data.phone     || '',
          avatar_url:  data.avatar_url || '',
          cv_url:      data.cv_url    || '',
          title:       profileTitle,
          hourly_rate: data.freelancer_profiles?.hourly_rate || '',
          hourly_rate_min: data.freelancer_profiles?.hourly_rate_min || '',
          hourly_rate_max: data.freelancer_profiles?.hourly_rate_max || '',
          skills:      data.freelancer_profiles?.skills?.join(', ') || '',
          experience_years: data.freelancer_profiles?.experience_years || '',
          experience_level: data.freelancer_profiles?.experience_level || 'Intermediate',
          github_url:    data.freelancer_profiles?.github_url  || '',
          linkedin_url:  data.freelancer_profiles?.linkedin_url || '',
          twitter_url:   data.freelancer_profiles?.twitter_url  || '',
          portfolio_url: data.freelancer_profiles?.portfolio_url || '',
          tagline:       data.freelancer_profiles?.tagline || '',
          availability:  data.freelancer_profiles?.availability || 'full_time',
          languages:     data.freelancer_profiles?.languages    || [],
          education:     data.freelancer_profiles?.education    || [],
          certifications:data.freelancer_profiles?.certifications || [],
          company_name:    data.company_name    || '',
          company_size:    data.company_size    || '',
          industry:        data.industry        || '',
          company_website: data.company_website || '',
        })
        // Initialize title input with existing profile title
        setTitleInput(profileTitle)
      } catch {
        addToast('Failed to load profile', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [addToast])

  const set = (name, value) => setFormData(prev => ({ ...prev, [name]: value }))
  const handleChange = e => set(e.target.name, e.target.value)

  // Dropdown handlers
  const selectTitle = (title) => {
    set('title', title)
    setTitleInput(title)
    setShowTitleDropdown(false)
  }

  const addSkill = (skill) => {
    if (!skillsArray.includes(skill)) {
      const updatedSkills = [...skillsArray, skill].join(', ')
      set('skills', updatedSkills)
    }
    setSkillInput('')
    setShowSkillDropdown(false)
  }

  const removeSkill = (skill) => {
    const updatedSkills = skillsArray.filter(s => s !== skill).join(', ')
    set('skills', updatedSkills)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/profile', {
        full_name:   formData.full_name,
        username:    formData.username,
        bio:         formData.bio,
        location:    formData.location,
        website:     formData.website,
        phone:       formData.phone,
        avatar_url:  formData.avatar_url,
        cv_url:      formData.cv_url,
        company_name:    formData.company_name,
        company_size:    formData.company_size,
        industry:        formData.industry,
        company_website: formData.company_website,
      })
      updateUser({ full_name: formData.full_name, avatar_url: formData.avatar_url })

      if (user?.role === 'freelancer') {
        await api.put('/freelancer-profile', {
          title:          formData.title,
          tagline:        formData.tagline,
          hourly_rate:    parseFloat(formData.hourly_rate) || null,
          hourly_rate_min:parseFloat(formData.hourly_rate_min) || null,
          hourly_rate_max:parseFloat(formData.hourly_rate_max) || null,
          skills:         formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          experience_years: parseInt(formData.experience_years) || 0,
          experience_level: formData.experience_level,
          github_url:    formData.github_url,
          linkedin_url:  formData.linkedin_url,
          twitter_url:   formData.twitter_url,
          portfolio_url: formData.portfolio_url,
          availability:  formData.availability,
          languages:     formData.languages,
          education:     formData.education,
          certifications:formData.certifications,
          bio:           formData.bio,
          location:      formData.location,
        })
      }
      addToast('Profile saved successfully!', 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) { addToast('Please upload an image file', 'error'); return }
    const fd = new FormData(); fd.append('image', file)
    setUploading(true)
    try {
      const { data } = await api.post('/upload/avatar', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
      await api.put('/auth/profile', { avatar_url: data.url })
      updateUser({ avatar_url: data.url })
      set('avatar_url', data.url)
      addToast('Photo updated!', 'success')
    } catch (err) {
      addToast('Upload failed: ' + (err.response?.data?.error || err.message), 'error')
    } finally { setUploading(false) }
  }

  const handleCVUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const ok = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!ok.includes(file.type)) { addToast('Please upload a PDF or DOCX', 'error'); return }
    const fd = new FormData(); fd.append('cv', file)
    setUploading(true)
    try {
      const { data } = await api.post('/upload/cv', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
      await api.put('/auth/profile', { cv_url: data.url })
      set('cv_url', data.url)
      addToast('CV uploaded!', 'success')
    } catch (err) {
      addToast('CV upload failed: ' + (err.response?.data?.error || err.message), 'error')
    } finally { setUploading(false) }
  }

  const addLanguage = () => {
    if (!newLang.language) return
    if (formData.languages.find(l => l.language === newLang.language)) return
    set('languages', [...formData.languages, { ...newLang }])
    setNewLang({ language:'English', level:'Professional' })
  }

  const addEducation = () => {
    if (!newEdu.degree || !newEdu.institution) return
    set('education', [...formData.education, { ...newEdu }])
    setNewEdu({ degree:'', institution:'', year:'' })
  }

  const addCertification = () => {
    if (!newCert.name) return
    set('certifications', [...formData.certifications, { ...newCert }])
    setNewCert({ name:'', issuer:'', year:'' })
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'60vh', fontFamily:'inherit', color:C.text3, fontSize:14 }}>
      Loading profile…
    </div>
  )

  const isFreelancer = user?.role === 'freelancer'

  const TABS = isFreelancer
    ? [
        { id:'basic',    label:'Basic Info',    icon:<User size={14} /> },
        { id:'professional', label:'Professional', icon:<Briefcase size={14} /> },
        { id:'skills',   label:'Skills',        icon:<Award size={14} />,
          badge: skillsArray.length || null },
        { id:'portfolio',label:'Portfolio',     icon:<Globe size={14} /> },
        { id:'extra',    label:'More Details',  icon:<Star size={14} /> },
      ]
    : [
        { id:'basic',   label:'Basic Info',  icon:<User size={14} /> },
        { id:'company', label:'Company',     icon:<Briefcase size={14} /> },
      ]

  const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }

  return (
    <div style={{ background:C.bg, minHeight:'100vh', padding:'32px 0 80px',
      fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ maxWidth:960, margin:'0 auto', padding:'0 24px' }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:26, fontWeight:800, color:C.text1,
            margin:'0 0 4px', letterSpacing:'-0.02em' }}>
            Edit Profile
          </h1>
          <p style={{ fontSize:14, color:C.text3, margin:0 }}>
            Keep your profile up to date to {isFreelancer ? 'attract more clients' : 'find the best talent'}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:24, alignItems:'start' }}>

          {/* ── LEFT: avatar + nav ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16, position:'sticky', top:90 }}>

            {/* Avatar card */}
            <Card>
              <div style={{ textAlign:'center' }}>
                <div style={{ position:'relative', display:'inline-block', marginBottom:14 }}>
                  <img
                    src={formData.avatar_url || '/default-avatar.png'}
                    alt="avatar"
                    style={{ width:96, height:96, borderRadius:'50%', objectFit:'cover',
                      border:`3px solid ${C.white}`,
                      boxShadow:`0 0 0 3px ${C.p200}, 0 4px 14px rgba(37,99,235,0.15)` }}
                  />
                  <label style={{ position:'absolute', bottom:0, right:0,
                    width:30, height:30, borderRadius:'50%',
                    background:`linear-gradient(135deg,${C.p600},${C.p700})`,
                    color:C.white, display:'flex', alignItems:'center', justifyContent:'center',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    boxShadow:'0 2px 8px rgba(37,99,235,0.4)', border:`2px solid ${C.white}` }}>
                    <Camera size={13} />
                    <input type="file" accept="image/*" style={{ display:'none' }}
                      onChange={handleAvatarUpload} disabled={uploading} />
                  </label>
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:C.text1 }}>
                  {formData.full_name || 'Your Name'}
                </div>
                <div style={{ fontSize:12, color:C.p600, fontWeight:500, margin:'2px 0 4px' }}>
                  {isFreelancer ? (formData.title || 'Freelancer') : 'Client'}
                </div>
                <div style={{ fontSize:11, color:C.text3 }}>
                  {formData.location || 'Tunisia'}
                </div>
                {uploading && (
                  <div style={{ fontSize:11, color:C.p600, marginTop:6, fontWeight:600 }}>
                    Uploading…
                  </div>
                )}
              </div>
            </Card>

            {/* Completion meter */}
            <CompletionMeter formData={formData} role={user?.role} />

            {/* Tab nav */}
            <Card style={{ padding:8 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {TABS.map(t => (
                  <TabBtn key={t.id} active={activeTab === t.id}
                    onClick={() => setActiveTab(t.id)}
                    icon={t.icon} label={t.label} badge={t.badge} />
                ))}
              </div>
            </Card>
          </div>

          {/* ── RIGHT: tab content ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* ══ BASIC INFO ══ */}
            {activeTab === 'basic' && (
              <>
                <Card>
                  <SectionHeader icon={<User size={17} />} title="Basic Information"
                    subtitle="How you appear to others on TechLink TN" />
                  <div style={grid2}>
                    <Field label="Full Name">
                      <Input name="full_name" value={formData.full_name}
                        onChange={handleChange} placeholder="e.g. Ahmed Ben Ali"
                        icon={<User size={15} />} />
                    </Field>
                    <Field label="Username" hint="Your unique @handle">
                      <Input name="username" value={formData.username}
                        onChange={handleChange} placeholder="e.g. ahmedbali"
                        icon={<span style={{ fontSize:13, fontWeight:700 }}>@</span>} />
                    </Field>
                    <Field label="Location" span2={false}>
                      <Input name="location" value={formData.location}
                        onChange={handleChange} placeholder="e.g. Tunis, Tunisia"
                        icon={<MapPin size={15} />} />
                    </Field>
                    <Field label="Phone">
                      <Input name="phone" type="tel" value={formData.phone}
                        onChange={handleChange} placeholder="+216 XX XXX XXX"
                        icon={<Phone size={15} />} />
                    </Field>
                    <Field label="Bio / About" hint="Tell clients about yourself. 2-3 sentences works best." span2>
                      <Textarea name="bio" rows={4} value={formData.bio}
                        onChange={handleChange}
                        placeholder="I'm a passionate full-stack developer with 5 years of experience building web apps..." />
                    </Field>
                    <Field label="Website">
                      <Input name="website" type="url" value={formData.website}
                        onChange={handleChange} placeholder="https://yourwebsite.com"
                        icon={<LinkIcon size={15} />} />
                    </Field>
                  </div>
                </Card>

                {/* CV upload */}
                <Card>
                  <SectionHeader icon={<FileText size={17} />} title="CV / Resume"
                    subtitle="Clients can download your CV directly from your profile" />
                  <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                    <label style={{ display:'inline-flex', alignItems:'center', gap:7,
                      background:C.p50, border:`1.5px solid ${C.p200}`,
                      color:C.p600, fontSize:13, fontWeight:700,
                      padding:'10px 18px', borderRadius:100, cursor: uploading ? 'not-allowed' : 'pointer' }}>
                      <FileText size={14} /> Upload CV (PDF/DOCX)
                      <input type="file" accept=".pdf,.docx" style={{ display:'none' }}
                        onChange={handleCVUpload} disabled={uploading} />
                    </label>
                    {uploading && <span style={{ fontSize:12, color:C.text3 }}>Uploading…</span>}
                    {formData.cv_url && (
                      <a href={formData.cv_url} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:6,
                          fontSize:13, fontWeight:600, color:C.g600,
                          background:C.g50, border:`1px solid rgba(34,197,94,0.3)`,
                          padding:'9px 16px', borderRadius:100, textDecoration:'none' }}>
                        <FileText size={13} /> View Current CV ↗
                      </a>
                    )}
                  </div>
                  {!formData.cv_url && (
                    <p style={{ fontSize:12, color:C.text3, marginTop:10, marginBottom:0 }}>
                      No CV uploaded yet. Add one to boost your profile visibility.
                    </p>
                  )}
                </Card>
              </>
            )}

            {/* ══ PROFESSIONAL (freelancer) ══ */}
            {activeTab === 'professional' && isFreelancer && (
              <>
                <Card>
                  <SectionHeader icon={<Briefcase size={17} />} title="Professional Details"
                    subtitle="Help clients understand your expertise and value" />
                  <div style={grid2}>
                    {/* Searchable Professional Title Dropdown */}
                    <Field label="Professional Title" span2>
                      <div style={{ position: 'relative' }}>
                        <Input
                          value={titleInput}
                          onChange={(e) => {
                            setTitleInput(e.target.value)
                            set('title', e.target.value)
                            setShowTitleDropdown(true)
                          }}
                          onFocus={() => setShowTitleDropdown(true)}
                          onBlur={() => setTimeout(() => setShowTitleDropdown(false), 200)}
                          placeholder="Type to search or select title..."
                          autoComplete="off"
                          icon={<Briefcase size={15} />}
                        />
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
                    </Field>

                    <Field label="Tagline" hint="One punchy sentence that sells you." span2>
                      <Input name="tagline" value={formData.tagline} onChange={handleChange}
                        placeholder="e.g. I turn complex problems into clean, scalable code."
                        icon={<Star size={15} />} />
                    </Field>
                    <Field label="Experience Level">
                      <Select name="experience_level" value={formData.experience_level} onChange={handleChange}>
                        {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </Select>
                    </Field>
                    <Field label="Years of Experience">
                      <Input name="experience_years" type="number" min="0" max="50"
                        value={formData.experience_years} onChange={handleChange}
                        placeholder="e.g. 5" icon={<Clock size={15} />} />
                    </Field>
                    <Field label="Availability">
                      <Select name="availability" value={formData.availability} onChange={handleChange}>
                        {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    </Field>
                  </div>
                </Card>

                <Card>
                  <SectionHeader icon={<DollarSign size={17} />} title="Rates (TND)"
                    subtitle="Set your hourly rate range. You can negotiate per project." />
                  <div style={grid2}>
                    <Field label="Standard Hourly Rate (TND)">
                      <Input name="hourly_rate" type="number" min="0"
                        value={formData.hourly_rate} onChange={handleChange}
                        placeholder="e.g. 80"
                        icon={<span style={{ fontSize:11, fontWeight:800 }}>TND</span>} />
                    </Field>
                    <div /> {/* spacer */}
                    <Field label="Min Rate (TND)" hint="Lowest you'd accept">
                      <Input name="hourly_rate_min" type="number" min="0"
                        value={formData.hourly_rate_min} onChange={handleChange}
                        placeholder="e.g. 50"
                        icon={<span style={{ fontSize:11, fontWeight:800 }}>TND</span>} />
                    </Field>
                    <Field label="Max Rate (TND)" hint="For premium projects">
                      <Input name="hourly_rate_max" type="number" min="0"
                        value={formData.hourly_rate_max} onChange={handleChange}
                        placeholder="e.g. 150"
                        icon={<span style={{ fontSize:11, fontWeight:800 }}>TND</span>} />
                    </Field>
                  </div>
                </Card>
              </>
            )}

            {/* ══ SKILLS (freelancer) ══ */}
            {activeTab === 'skills' && isFreelancer && (
              <>
                <Card>
                  <SectionHeader icon={<Award size={17} />} title="Skills & Expertise"
                    subtitle="Add the technologies and tools you're proficient in" />
                  {/* Searchable Skills Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <Input
                      value={skillInput}
                      onChange={(e) => {
                        setSkillInput(e.target.value)
                        setShowSkillDropdown(true)
                      }}
                      onFocus={() => setShowSkillDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                      placeholder="Type to search skills..."
                      autoComplete="off"
                    />
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
                      {skillsArray.map(skill => (
                        <span key={skill} className="tag tag-secondary" onClick={() => removeSkill(skill)}>
                          {skill} ✕
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <SectionHeader icon={<Languages size={17} />} title="Languages"
                    subtitle="Languages you can communicate in with clients" />
                  {formData.languages.map((l, i) => (
                    <LanguageRow key={i} lang={l}
                      onRemove={() => set('languages', formData.languages.filter((_,j) => j !== i))} />
                  ))}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:10, marginTop:12 }}>
                    <Select value={newLang.language}
                      onChange={e => setNewLang(p => ({ ...p, language: e.target.value }))}>
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </Select>
                    <Select value={newLang.level}
                      onChange={e => setNewLang(p => ({ ...p, level: e.target.value }))}>
                      {['Native','Fluent','Professional','Conversational','Basic'].map(l => (
                        <option key={l}>{l}</option>
                      ))}
                    </Select>
                    <button type="button" onClick={addLanguage}
                      style={{ padding:'10px 16px', background:C.p600, color:C.white,
                        border:'none', borderRadius:12, fontSize:13, fontWeight:700,
                        cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                      + Add
                    </button>
                  </div>
                </Card>
              </>
            )}

            {/* ══ PORTFOLIO (freelancer) ══ */}
            {activeTab === 'portfolio' && isFreelancer && (
              <>
                <Card>
                  <SectionHeader icon={<Globe size={17} />} title="Links & Profiles"
                    subtitle="Connect your portfolio and social accounts" />
                  <div style={grid2}>
                    <Field label="Portfolio Website">
                      <Input name="portfolio_url" type="url" value={formData.portfolio_url}
                        onChange={handleChange} placeholder="https://yourportfolio.com"
                        icon={<Globe size={15} />} />
                    </Field>
                    <Field label="GitHub">
                      <Input name="github_url" type="url" value={formData.github_url}
                        onChange={handleChange} placeholder="https://github.com/username"
                        icon={
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                        } />
                    </Field>
                    <Field label="LinkedIn">
                      <Input name="linkedin_url" type="url" value={formData.linkedin_url}
                        onChange={handleChange} placeholder="https://linkedin.com/in/username"
                        icon={
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        } />
                    </Field>
                    <Field label="Twitter / X">
                      <Input name="twitter_url" type="url" value={formData.twitter_url}
                        onChange={handleChange} placeholder="https://twitter.com/username"
                        icon={<Globe size={15} />} />
                    </Field>
                    {/* You can add Instagram and Youtube fields here if you want, using Globe icon */}
                  </div>
                </Card>
              </>
            )}

            {/* ══ MORE DETAILS (freelancer) ══ */}
            {activeTab === 'extra' && isFreelancer && (
              <>
                {/* Education */}
                <Card>
                  <SectionHeader icon={<Award size={17} />} title="Education"
                    subtitle="Your academic background builds client trust" />
                  {formData.education.map((e, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', padding:'12px 14px',
                      background:C.gray50, border:`1px solid ${C.border}`,
                      borderRadius:10, marginBottom:8 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:C.text1 }}>{e.degree}</div>
                        <div style={{ fontSize:12, color:C.text3 }}>{e.institution} {e.year && `· ${e.year}`}</div>
                      </div>
                      <button type="button"
                        onClick={() => set('education', formData.education.filter((_,j) => j !== i))}
                        style={{ background:C.redBg, border:`1px solid rgba(239,68,68,0.25)`,
                          color:C.red, width:26, height:26, borderRadius:'50%',
                          cursor:'pointer', fontSize:14, display:'flex',
                          alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
                        ×
                      </button>
                    </div>
                  ))}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 100px auto', gap:10, marginTop:8 }}>
                    <input placeholder="Degree / Field" value={newEdu.degree}
                      onChange={e => setNewEdu(p => ({ ...p, degree: e.target.value }))}
                      style={{ padding:'10px 12px', border:`2px solid ${C.border}`, borderRadius:10,
                        fontSize:13, fontFamily:'inherit', outline:'none', color:C.text1 }} />
                    <input placeholder="Institution" value={newEdu.institution}
                      onChange={e => setNewEdu(p => ({ ...p, institution: e.target.value }))}
                      style={{ padding:'10px 12px', border:`2px solid ${C.border}`, borderRadius:10,
                        fontSize:13, fontFamily:'inherit', outline:'none', color:C.text1 }} />
                    <input placeholder="Year" type="number" value={newEdu.year}
                      onChange={e => setNewEdu(p => ({ ...p, year: e.target.value }))}
                      style={{ padding:'10px 12px', border:`2px solid ${C.border}`, borderRadius:10,
                        fontSize:13, fontFamily:'inherit', outline:'none', color:C.text1 }} />
                    <button type="button" onClick={addEducation}
                      style={{ padding:'10px 14px', background:C.p600, color:C.white,
                        border:'none', borderRadius:10, fontSize:13, fontWeight:700,
                        cursor:'pointer', fontFamily:'inherit' }}>
                      + Add
                    </button>
                  </div>
                </Card>

                {/* Certifications */}
                <Card>
                  <SectionHeader icon={<Star size={17} />} title="Certifications"
                    subtitle="Show clients your verified credentials and achievements" />
                  {formData.certifications.map((c, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', padding:'12px 14px',
                      background:C.g50, border:`1px solid rgba(34,197,94,0.2)`,
                      borderRadius:10, marginBottom:8 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:C.text1 }}>🏅 {c.name}</div>
                        <div style={{ fontSize:12, color:C.text3 }}>{c.issuer} {c.year && `· ${c.year}`}</div>
                      </div>
                      <button type="button"
                        onClick={() => set('certifications', formData.certifications.filter((_,j) => j !== i))}
                        style={{ background:C.redBg, border:`1px solid rgba(239,68,68,0.25)`,
                          color:C.red, width:26, height:26, borderRadius:'50%',
                          cursor:'pointer', fontSize:14, display:'flex',
                          alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
                        ×
                      </button>
                    </div>
                  ))}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 100px auto', gap:10, marginTop:8 }}>
                    <input placeholder="Certificate Name" value={newCert.name}
                      onChange={e => setNewCert(p => ({ ...p, name: e.target.value }))}
                      style={{ padding:'10px 12px', border:`2px solid ${C.border}`, borderRadius:10,
                        fontSize:13, fontFamily:'inherit', outline:'none', color:C.text1 }} />
                    <input placeholder="Issuer (e.g. Google)" value={newCert.issuer}
                      onChange={e => setNewCert(p => ({ ...p, issuer: e.target.value }))}
                      style={{ padding:'10px 12px', border:`2px solid ${C.border}`, borderRadius:10,
                        fontSize:13, fontFamily:'inherit', outline:'none', color:C.text1 }} />
                    <input placeholder="Year" type="number" value={newCert.year}
                      onChange={e => setNewCert(p => ({ ...p, year: e.target.value }))}
                      style={{ padding:'10px 12px', border:`2px solid ${C.border}`, borderRadius:10,
                        fontSize:13, fontFamily:'inherit', outline:'none', color:C.text1 }} />
                    <button type="button" onClick={addCertification}
                      style={{ padding:'10px 14px', background:C.p600, color:C.white,
                        border:'none', borderRadius:10, fontSize:13, fontWeight:700,
                        cursor:'pointer', fontFamily:'inherit' }}>
                      + Add
                    </button>
                  </div>
                </Card>
              </>
            )}

            {/* ══ COMPANY (client) ══ */}
            {activeTab === 'company' && !isFreelancer && (
              <Card>
                <SectionHeader icon={<Briefcase size={17} />} title="Company Details"
                  subtitle="Help freelancers understand who they'll be working with" />
                <div style={grid2}>
                  <Field label="Company Name">
                    <Input name="company_name" value={formData.company_name}
                      onChange={handleChange} placeholder="e.g. Acme Corp"
                      icon={<Briefcase size={15} />} />
                  </Field>
                  <Field label="Industry">
                    <Input name="industry" value={formData.industry}
                      onChange={handleChange} placeholder="e.g. FinTech, E-commerce"
                      icon={<Globe size={15} />} />
                  </Field>
                  <Field label="Company Size">
                    <Select name="company_size" value={formData.company_size} onChange={handleChange}>
                      <option value="">Select size</option>
                      {['1-10','11-50','51-200','201-500','500+'].map(s => (
                        <option key={s} value={s}>{s} employees</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Company Website">
                    <Input name="company_website" type="url" value={formData.company_website}
                      onChange={handleChange} placeholder="https://company.com"
                      icon={<Globe size={15} />} />
                  </Field>
                </div>
              </Card>
            )}

            {/* ── Save button ── */}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:12, paddingTop:4 }}>
              <button type="button" onClick={handleSubmit} disabled={saving}
                style={{ display:'inline-flex', alignItems:'center', gap:8,
                  background: saving
                    ? C.gray300
                    : `linear-gradient(135deg,${C.p600},${C.p700})`,
                  color:C.white, fontWeight:700, fontSize:14,
                  padding:'12px 28px', borderRadius:100, border:'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily:'inherit',
                  boxShadow: saving ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
                  transition:'all 0.2s' }}>
                <Save size={16} />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* CSS for search dropdowns and skill tags */}
      <style>{`
        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          max-height: 200px;
          overflow-y: auto;
          z-index: 50;
          margin-top: 4px;
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
          margin-top: 0.75rem;
        }
        .tag {
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tag-secondary {
          background-color: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        .tag-secondary:hover {
          background-color: #dbeafe;
        }
      `}</style>
    </div>
  )
}