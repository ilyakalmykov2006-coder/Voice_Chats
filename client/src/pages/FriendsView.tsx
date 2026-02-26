import React from 'react';

export function FriendsView({ token }: { token: string }) {
  return (
    <div>
      <h2>Друзья и личные сообщения</h2>
      <p>JWT получен: {token ? 'да' : 'нет'}.</p>
      <p>Правило MVP: DM доступны только подтвержденным друзьям.</p>
    </div>
  );
}
