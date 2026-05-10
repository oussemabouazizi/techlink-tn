import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { supabase } from '../../config/supabase';
import { SendIcon, UserIcon, ArrowLeftIcon, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MessagesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const intervalRef = useRef(null);
  const backgroundFetching = useRef(false);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data || []);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  // Fetch messages – showLoader controls the spinner, but NO AUTO-SCROLL
  const fetchMessages = async (targetUserId, showLoader = false) => {
    if (!targetUserId) return;
    if (showLoader) setLoadingMessages(true);
    else backgroundFetching.current = true;
    try {
      const { data } = await api.get(`/messages/${targetUserId}`);
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      if (showLoader) setLoadingMessages(false);
      backgroundFetching.current = false;
    }
  };

  // Send message – no scroll
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    try {
      await api.post('/messages', {
        receiver_id: selectedUser.id,
        content: newMessage.trim(),
      });
      setNewMessage('');
      await fetchMessages(selectedUser.id, true);
      await fetchConversations();
    } catch (err) {
      console.error('Send failed', err);
    } finally {
      setSending(false);
    }
  };

  // Select conversation – no scroll, only load messages
  const selectConversation = (partner) => {
    if (!partner?.id) return;
    setSelectedUser(partner);
    navigate(`/messages/${partner.id}`, { replace: true });
    fetchMessages(partner.id, true);
  };

  // Initial load (once)
  useEffect(() => {
    const init = async () => {
      setInitialLoading(true);
      await fetchConversations();
      if (userId && userId !== 'undefined') {
        const existing = conversations.find(c => c.partner?.id === userId);
        if (existing) {
          setSelectedUser(existing.partner);
          await fetchMessages(userId, true);
        } else {
          try {
            const { data: userProfile } = await api.get(`/users/${userId}`);
            setSelectedUser(userProfile);
          } catch (err) {
            console.error('User not found', err);
          }
        }
      }
      setInitialLoading(false);
    };
    init();
  }, []);

  // When userId changes (by clicking conversation), update
  useEffect(() => {
    if (!userId || userId === 'undefined') return;
    if (selectedUser?.id === userId) return;
    const existing = conversations.find(c => c.partner?.id === userId);
    if (existing) {
      setSelectedUser(existing.partner);
      fetchMessages(userId, true);
    } else {
      api.get(`/users/${userId}`)
        .then(({ data }) => {
          setSelectedUser(data);
          fetchMessages(userId, true);
        })
        .catch(err => console.error('Error fetching user', err));
    }
  }, [userId, conversations, selectedUser]);

  // Polling for new messages – background, no loader, no scroll
  useEffect(() => {
    if (selectedUser) {
      intervalRef.current = setInterval(() => {
        if (!backgroundFetching.current) {
          fetchMessages(selectedUser.id, false);
        }
        fetchConversations();
      }, 4000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [selectedUser]);

  // Real‑time subscription – background, no loader, no scroll
  useEffect(() => {
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new;
        if (selectedUser && (newMsg.sender_id === selectedUser.id || newMsg.receiver_id === selectedUser.id)) {
          fetchMessages(selectedUser.id, false);
        }
        fetchConversations();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [selectedUser]);

  if (initialLoading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <div className="container py-8 h-[calc(100vh-4rem)]">
      <div className="messages-layout">
        {/* Left panel – conversations */}
        <div className="conversations">
          <div className="conversations-header">
            <h3 className="font-semibold">Messages</h3>
          </div>
          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div className="empty-state p-4 text-center text-gray-500">No conversations yet</div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.partner?.id}
                  onClick={() => selectConversation(conv.partner)}
                  className={`conversation-item ${selectedUser?.id === conv.partner?.id ? 'conversation-item-active' : ''}`}
                >
                  <img
                    src={conv.partner?.avatar_url || '/default-avatar.png'}
                    alt={conv.partner?.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="conversation-info">
                    <div className="conversation-name">{conv.partner?.full_name || 'User'}</div>
                    <div className="conversation-preview">
                      {conv.last_message?.content?.substring(0, 40)}
                    </div>
                  </div>
                  {conv.unread_count > 0 && <div className="conversation-badge">{conv.unread_count}</div>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel – chat area (no auto‑scroll) */}
        <div className="chat">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <button onClick={() => navigate('/messages')} className="md:hidden mr-2 text-gray-600">
                  <ArrowLeftIcon size={20} />
                </button>
                <img
                  src={selectedUser.avatar_url || '/default-avatar.png'}
                  alt={selectedUser.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold">{selectedUser.full_name}</div>
                  <div className="text-xs text-green-600">Online</div>
                </div>
                {loadingMessages && <Loader2 size={16} className="animate-spin text-gray-400 ml-2" />}
              </div>
              <div className="chat-messages" style={{ overflowY: 'auto', flex: 1 }}>
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 size={32} className="animate-spin text-gray-400" />
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender_id === selectedUser.id ? 'message-received' : 'message-sent'}`}
                    >
                      <div className="message-content">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSend} className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input"
                />
                <button type="submit" disabled={sending} className="btn btn-primary">
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <SendIcon size={18} />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <UserIcon size={48} className="mx-auto mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}