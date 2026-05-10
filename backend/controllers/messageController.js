const { supabaseAdmin } = require('../config/supabase');

exports.getConversations = async (req, res) => {
  try {
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url),
        receiver:profiles!receiver_id(id, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const conversations = {};
    messages.forEach(msg => {
      const partnerId = msg.sender_id === req.user.id ? msg.receiver_id : msg.sender_id;
      const partnerData = msg.sender_id === req.user.id ? msg.receiver : msg.sender;

      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partner: partnerData,            // now includes id, full_name, avatar_url
          last_message: msg,
          unread_count: msg.receiver_id === req.user.id && !msg.is_read ? 1 : 0,
        };
      } else if (msg.receiver_id === req.user.id && !msg.is_read) {
        conversations[partnerId].unread_count++;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*, sender:profiles!sender_id(full_name, avatar_url)')
      .or(`and(sender_id.eq.${req.user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${req.user.id})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark as read
    await supabaseAdmin
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', userId)
      .eq('receiver_id', req.user.id)
      .eq('is_read', false);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, content, contract_id } = req.body;

    if (!receiver_id) {
      return res.status(400).json({ error: 'receiver_id is required' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        sender_id: req.user.id,
        receiver_id,
        content: content.trim(),
        contract_id: contract_id || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Non-blocking notification (use try/catch)
    try {
      const senderName = req.user.full_name || req.user.email?.split('@')[0] || 'Someone';
      await supabaseAdmin.from('notifications').insert({
        user_id: receiver_id,
        type: 'message',
        title: 'New Message',
        body: `You have a new message from ${senderName}`,
        data: { message_id: data.id, sender_id: req.user.id },
      });
    } catch (notifErr) {
      console.warn('Notification insert failed:', notifErr.message);
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
};