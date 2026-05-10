import { Link } from 'react-router-dom'
import { BriefcaseIcon, MailIcon, MapPinIcon, PhoneIcon, GlobeIcon } from '../ui/Icons'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-name">
              <div className="footer-brand-icon">
                <BriefcaseIcon size={20} />
              </div>
              <span>TechLink TN</span>
            </div>
            <p className="footer-brand-text">
              Connecting Tunisia's best IT talent with world-class opportunities.
              The premier marketplace for developers, designers, and tech professionals.
            </p>
            <div className="footer-social">
              <a href="#"><GlobeIcon size={18} /></a>
              <a href="#"><GlobeIcon size={18} /></a>
              <a href="#"><GlobeIcon size={18} /></a>
            </div>
          </div>

          <div>
            <h3 className="footer-title">For Freelancers</h3>
            <ul className="footer-links">
              <li><Link to="/jobs">Browse Jobs</Link></li>
              <li><Link to="/register">Create Profile</Link></li>
              <li><Link to="/pricing">Pricing Plans</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="footer-title">For Clients</h3>
            <ul className="footer-links">
              <li><Link to="/freelancers">Find Talent</Link></li>
              <li><Link to="/post-job">Post a Job</Link></li>
              <li><Link to="/pricing">Business Plans</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="footer-title">Contact</h3>
            <ul className="footer-links">
              <li className="footer-contact">
                <MapPinIcon size={16} />
                <span>Tunis, Tunisia</span>
              </li>
              <li className="footer-contact">
                <MailIcon size={16} />
                <span>contact@techlink.tn</span>
              </li>
              <li className="footer-contact">
                <PhoneIcon size={16} />
                <span>+216 XX XXX XXX</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 TechLink TN. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}