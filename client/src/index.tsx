import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ServerList } from './pages/ServerList';
import { ChannelView } from './pages/ChannelView';
import { FriendsView } from './pages/FriendsView';
import { VoiceRoom } from './pages/VoiceRoom';
import { createSocket } from './renderer/socket';

type Screen = 'login' | 'register' | 'servers' | 'channel' | 'friends' | 'voice';

function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [token, setToken] = useState<string>('');
  const [activeChannelId, setActiveChannelId] = useState<string>('general');

  const socket = useMemo(() => createSocket(), []);

  if (screen === 'login') {
    return <Login onSuccess={(jwt) => { setToken(jwt); setScreen('servers'); }} onGoRegister={() => setScreen('register')} />;
  }

  if (screen === 'register') {
    return <Register onGoLogin={() => setScreen('login')} />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ borderRight: '1px solid #ddd', padding: 12 }}>
        <ServerList onOpenChannel={(channelId) => { setActiveChannelId(channelId); setScreen('channel'); }} onOpenFriends={() => setScreen('friends')} onOpenVoice={() => setScreen('voice')} />
      </div>
      <div style={{ padding: 12 }}>
        {screen === 'channel' && <ChannelView token={token} channelId={activeChannelId} socket={socket} />}
        {screen === 'friends' && <FriendsView token={token} />}
        {screen === 'voice' && <VoiceRoom token={token} channelId={activeChannelId} socket={socket} />}
        {screen === 'servers' && <div>Выберите раздел слева.</div>}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
