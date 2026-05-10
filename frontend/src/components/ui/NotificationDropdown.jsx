import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageSquare, Briefcase, FileText, CheckCircle, ChevronRight, Check } from 'lucide-react';
import api from '../../config/api';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare size={16} className="icon-blue" />;
      case 'job': return <Briefcase size={16} className="icon-green" />;
      case 'proposal': return <FileText size={16} className="icon-purple" />;
      case 'contract': return <CheckCircle size={16} className="icon-indigo" />;
      default: return <Bell size={16} />;
    }
  };

  const getLink = (notif) => {
    if (notif.type === 'message' && notif.data?.sender_id) return `/messages/${notif.data.sender_id}`;
    if (notif.type === 'job' && notif.data?.job_id) return `/jobs/${notif.data.job_id}`;
    if (notif.type === 'proposal' && notif.data?.job_id) return `/jobs/${notif.data.job_id}`;
    if (notif.type === 'contract' && notif.data?.contract_id) return `/contracts/${notif.data.contract_id}`;
    return '#';
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();
    fetchRecentNotifications();

    const channel = supabase
      .channel('notifications-dropdown')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadCount();
        fetchRecentNotifications();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notification-bell"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="dd-header">
            <div className="dd-header-title">
              <Bell size={16} /> Notifications
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="dd-mark-all">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="dd-list">
            {notifications.length === 0 ? (
              <div className="dd-empty">
                <Bell size={32} />
                <p>No notifications yet</p>
                <span>We'll notify you when something happens</span>
              </div>
            ) : (
              notifications.map(notif => (
                <Link
                  key={notif.id}
                  to={getLink(notif)}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false);
                  }}
                  className={`dd-item ${!notif.is_read ? 'dd-item-unread' : ''}`}
                >
                  <div className="dd-item-icon">
                    {getIcon(notif.type)}
                  </div>
                  <div className="dd-item-content">
                    <div className="dd-item-title">{notif.title}</div>
                    <div className="dd-item-body">{notif.body}</div>
                    <div className="dd-item-time">
                      {timeAgo(notif.created_at)}
                      {!notif.is_read && <span className="dd-unread-dot" />}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="dd-footer">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              See all notifications <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Pure CSS styles */}
      <style>{`
        .notification-dropdown-container {
          position: relative;
        }
        .notification-bell {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.2s;
        }
        .notification-bell:hover {
          color: #2563eb;
        }
        .notification-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          min-width: 18px;
          height: 18px;
          background: #ef4444;
          border-radius: 999px;
          color: white;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .notification-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 380px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 35px -10px rgba(0,0,0,0.2);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          z-index: 1000;
          animation: dropdownFadeIn 0.2s ease-out;
          transform-origin: top right;
        }
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .dd-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .dd-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          color: #1f2937;
        }
        .dd-mark-all {
          background: none;
          border: none;
          font-size: 0.7rem;
          font-weight: 500;
          color: #2563eb;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s;
        }
        .dd-mark-all:hover {
          color: #1d4ed8;
        }
        .dd-list {
          max-height: 400px;
          overflow-y: auto;
          background: white;
        }
        .dd-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          text-decoration: none;
          transition: background 0.15s;
        }
        .dd-item:hover {
          background: #f9fafb;
        }
        .dd-item-unread {
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
        }
        .dd-item-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .icon-blue { color: #3b82f6; }
        .icon-green { color: #10b981; }
        .icon-purple { color: #8b5cf6; }
        .icon-indigo { color: #6366f1; }
        .dd-item-content {
          flex: 1;
          min-width: 0;
        }
        .dd-item-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }
        .dd-item-body {
          font-size: 0.75rem;
          color: #4b5563;
          margin-bottom: 4px;
          line-height: 1.4;
        }
        .dd-item-time {
          font-size: 0.7rem;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dd-unread-dot {
          width: 6px;
          height: 6px;
          background: #3b82f6;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1.5s infinite;
        }
        .dd-empty {
          padding: 32px 20px;
          text-align: center;
          color: #9ca3af;
        }
        .dd-empty svg {
          margin-bottom: 12px;
          opacity: 0.4;
        }
        .dd-empty p {
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .dd-empty span {
          font-size: 0.7rem;
        }
        .dd-footer {
          padding: 10px 16px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .dd-footer a {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s;
        }
        .dd-footer a:hover {
          color: #2563eb;
        }
      `}</style>
    </div>
  );
}