import React from 'react';

export function ServerList({ onOpenChannel, onOpenFriends, onOpenVoice }: { onOpenChannel: (id: string) => void; onOpenFriends: () => void; onOpenVoice: () => void; }) {
  return (
    <div>
      <h3>Серверы</h3>
      <button onClick={() => onOpenChannel('general')}># general</button>
      <h3>Навигация</h3>
      <button onClick={onOpenFriends}>Друзья / DM</button>
      <button onClick={onOpenVoice}>Голосовой канал</button>
    </div>
  );
}
