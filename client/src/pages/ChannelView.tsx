import React, { useEffect, useState } from 'react';

export function ChannelView({ token, channelId, socket }: { token: string; channelId: string; socket: any; }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    socket.auth = { token };
    socket.connect();
    socket.on('message:new', (payload: any) => setMessages((prev) => [...prev, payload.content]));
    return () => { socket.off('message:new'); };
  }, [socket, token]);

  const send = () => {
    socket.emit('message:new', { channelId, content: text });
    setText('');
  };

  return (
    <div>
      <h2>Канал: {channelId}</h2>
      <div style={{ minHeight: 240, border: '1px solid #ddd', marginBottom: 8, padding: 8 }}>
        {messages.map((m, idx) => <div key={idx}>{m}</div>)}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder='Сообщение' />
      <button onClick={send}>Отправить</button>
    </div>
  );
}
