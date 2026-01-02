import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './UserList.css';

function UserList({ currentUserId, selectedUser, setSelectedUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [currentUserId]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId)
      .order('username');

    if (data) {
      setUsers(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="user-list-loading">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="user-list-empty">No users available</div>;
  }

  return (
    <div className="user-list">
      <h3 className="user-list-title">Select User</h3>
      <div className="user-list-items">
        {users.map((user) => (
          <div
            key={user.id}
            className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
            onClick={() => setSelectedUser(user)}
          >
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;
