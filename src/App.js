import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import PublicChat from './components/PublicChat';
import PrivateChat from './components/PrivateChat';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatType, setChatType] = useState('public'); // 'public' or 'private'
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setChatType('public');
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      <Sidebar
        chatType={chatType}
        setChatType={setChatType}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        currentUserId={session.user.id}
        onSignOut={handleSignOut}
      />
      <div className="chat-container">
        {chatType === 'public' ? (
          <PublicChat userId={session.user.id} />
        ) : (
          <PrivateChat
            currentUserId={session.user.id}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        )}
      </div>
    </div>
  );
}

export default App;
