import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { supabase } from '../../config/supabase';
import { Bell, MessageSquare, Briefcase, FileText, CheckCircle, Check, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth(); // ✅ use auth context instead of supabase.auth.user()
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data || []);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
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
      case 'message': return <MessageSquare size={20} className="icon-blue" />;
      case 'job': return <Briefcase size={20} className="icon-green" />;
      case 'proposal': return <FileText size={20} className="icon-purple" />;
      case 'contract': return <CheckCircle size={20} className="icon-indigo" />;
      default: return <Bell size={20} />;
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

  useEffect(() => {
    if (!user) return; // wait for user to be loaded
    fetchNotifications();

    const channel = supabase
      .channel('notifications-page')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <div className="notifications-page-container">
      <div className="notifications-page-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your activity</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-btn">
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <p>No notifications yet</p>
            <span>When you receive updates, they'll appear here</span>
          </div>
        ) : (
          notifications.map(notif => (
            <Link
              key={notif.id}
              to={getLink(notif)}
              onClick={() => markAsRead(notif.id)}
              className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
            >
              <div className="notification-icon">{getIcon(notif.type)}</div>
              <div className="notification-content">
                <div className="notification-title">{notif.title}</div>
                <div className="notification-body">{notif.body}</div>
                <div className="notification-meta">
                  <Clock size={12} />
                  <span>{timeAgo(notif.created_at)}</span>
                  {!notif.is_read && <span className="unread-badge">New</span>}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <style>{`
        .notifications-page-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .notifications-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .notifications-page-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        .notifications-page-header p {
          color: #6b7280;
          font-size: 0.9rem;
        }
        .mark-all-btn {
          background: #eff6ff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #2563eb;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .mark-all-btn:hover {
          background: #dbeafe;
        }
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .notification-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
          text-decoration: none;
          transition: all 0.2s;
        }
        .notification-item:hover {
          transform: translateX(4px);
          border-color: #93c5fd;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .notification-item.unread {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
        }
        .notification-icon {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-blue { color: #3b82f6; }
        .icon-green { color: #10b981; }
        .icon-purple { color: #8b5cf6; }
        .icon-indigo { color: #6366f1; }
        .notification-content {
          flex: 1;
        }
        .notification-title {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        .notification-body {
          font-size: 0.85rem;
          color: #4b5563;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .notification-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: #9ca3af;
        }
        .unread-badge {
          background: #3b82f6;
          color: white;
          padding: 0.1rem 0.5rem;
          border-radius: 999px;
          font-size: 0.65rem;
          font-weight: 600;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
          color: #9ca3af;
        }
        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.4;
        }
        .empty-state p {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .empty-state span {
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}