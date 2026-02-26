import React, { useState } from 'react';

export function Register({ onGoLogin }: { onGoLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    onGoLogin();
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='E-mail' /><br/>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' /><br/>
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Пароль' type='password' /><br/>
      <button onClick={submit}>Создать аккаунт</button>
      <button onClick={onGoLogin}>Назад ко входу</button>
    </div>
  );
}
