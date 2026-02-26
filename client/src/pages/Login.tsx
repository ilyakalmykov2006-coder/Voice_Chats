import React, { useState } from 'react';

export function Login({ onSuccess, onGoRegister }: { onSuccess: (jwt: string) => void; onGoRegister: () => void; }) {
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('Password123!');

  const submit = async () => {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.accessToken) onSuccess(data.accessToken);
  };

  return (
    <div>
      <h2>Вход</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='E-mail' /><br/>
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Пароль' type='password' /><br/>
      <button onClick={submit}>Войти</button>
      <button onClick={onGoRegister}>Регистрация</button>
    </div>
  );
}
