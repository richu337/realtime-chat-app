import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import './PublicChat.css';

function PublicChat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('public_messages')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('public_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_messages',
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from('public_messages')
            .select(`
              *,
              profiles:user_id (username)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((current) => [...current, data]);
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
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('public_messages').insert([
      {
        user_id: userId,
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

  if (loading) {
    return <div className="chat-loading">Loading messages...</div>;
  }

  return (
    <div className="public-chat">
      <div className="chat-header">
        <h2>🌐 Public Chat</h2>
        <p>Everyone can see messages here</p>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.user_id === userId ? 'own-message' : ''}`}
            >
              <div className="message-header">
                <span className="message-username">
                  {message.profiles?.username || 'Unknown'}
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
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default PublicChat;
