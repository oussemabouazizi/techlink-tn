import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BriefcaseIcon,
  MessageSquareIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  UserIcon,
} from "../ui/Icons";
import NotificationDropdown from "../ui/NotificationDropdown";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <BriefcaseIcon size={20} />
          </div>
          <span>TechLink TN</span>
        </Link>

        {/* Desktop navigation */}
        <div className="navbar-nav">
          <Link to="/jobs" className="nav-link btn-nav">
            <span>Find Jobs</span>
          </Link>
          <Link to="/freelancers" className="nav-link btn-nav-primary">
            <span>Hire Talent</span>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              {/* Messages */}
              <Link
                to="/messages"
                className="text-gray-600 hover:text-primary transition"
              >
                <MessageSquareIcon size={20} />
              </Link>

              {/* Notifications dropdown */}
              <NotificationDropdown />

              {/* User dropdown */}
              <div className="dropdown">
                <button className="navbar-user">
                  <img
                    src={
                      user.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.full_name
                      )}&background=3b82f6&color=fff`
                    }
                    alt={user.full_name}
                  />
                  <span className="font-medium hidden md:inline">
                    {user.full_name}
                  </span>
                </button>
                <div className="dropdown-menu">
                  <Link to="/dashboard" className="dropdown-item">
                    <UserIcon size={16} /> Dashboard
                  </Link>
                  <Link to="/profile" className="dropdown-item">
                    <UserIcon size={16} /> Edit Profile
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="dropdown-item">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="dropdown-item dropdown-item-danger"
                  >
                    <LogOutIcon size={16} /> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-nav">
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary font-medium transition"
              >
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <Link
          to="/jobs"
          className="mobile-menu-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Find Jobs
        </Link>
        <Link
          to="/freelancers"
          className="mobile-menu-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Freelancers
        </Link>
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="mobile-menu-link text-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="mobile-menu-link bg-primary-500 text-white text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}