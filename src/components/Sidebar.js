import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import UserList from './UserList';
import './Sidebar.css';

function Sidebar({ chatType, setChatType, selectedUser, setSelectedUser, currentUserId, onSignOut }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, [currentUserId]);

  const fetchCurrentUser = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single();
    
    if (data) setCurrentUser(data);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chat App</h2>
        {currentUser && (
          <div className="current-user">
            <span className="username">{currentUser.username}</span>
          </div>
        )}
      </div>

      <div className="chat-type-selector">
        <button
          className={`chat-type-btn ${chatType === 'public' ? 'active' : ''}`}
          onClick={() => {
            setChatType('public');
            setSelectedUser(null);
          }}
        >
          <span className="icon">🌐</span>
          Public Chat
        </button>
        <button
          className={`chat-type-btn ${chatType === 'private' ? 'active' : ''}`}
          onClick={() => setChatType('private')}
        >
          <span className="icon">💬</span>
          Private Chat
        </button>
      </div>

      {chatType === 'private' && (
        <UserList
          currentUserId={currentUserId}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      )}

      <button className="signout-btn" onClick={onSignOut}>
        Sign Out
      </button>
    </div>
  );
}

export default Sidebar;
