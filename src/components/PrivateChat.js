import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import './PrivateChat.css';

function PrivateChat({ currentUserId, selectedUser, setSelectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!selectedUser) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('private_messages')
      .select(`
        *,
        sender:sender_id (username),
        receiver:receiver_id (username)
      `)
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('private_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
        },
        async (payload) => {
          // Only add message if it's relevant to current conversation
          if (
            (payload.new.sender_id === currentUserId &&
              payload.new.receiver_id === selectedUser.id) ||
            (payload.new.sender_id === selectedUser.id &&
              payload.new.receiver_id === currentUserId)
          ) {
            const { data } = await supabase
              .from('private_messages')
              .select(`
                *,
                sender:sender_id (username),
                receiver:receiver_id (username)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setMessages((current) => [...current, data]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const { error } = await supabase.from('private_messages').insert([
      {
        sender_id: currentUserId,
        receiver_id: selectedUser.id,
        content: newMessage.trim(),
      },
    ]);

    if (!error) {
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedUser) {
    return (
      <div className="private-chat-empty">
        <div className="empty-state">
          <span className="empty-icon">💬</span>
          <h2>Select a user to start chatting</h2>
          <p>Choose someone from the sidebar to begin a private conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="private-chat">
      <div className="chat-header">
        <div className="header-content">
          <div className="user-avatar-large">
            {selectedUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{selectedUser.username}</h2>
            <p>Private conversation</p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            No messages yet. Start the conversation with {selectedUser.username}!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.sender_id === currentUserId ? 'own-message' : ''
              }`}
            >
              <div className="message-header">
                <span className="message-username">
                  {message.sender_id === currentUserId
                    ? 'You'
                    : message.sender?.username || 'Unknown'}
                </span>
                <span className="message-time">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${selectedUser.username}...`}
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default PrivateChat;
