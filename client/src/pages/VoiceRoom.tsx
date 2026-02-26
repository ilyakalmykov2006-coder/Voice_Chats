import React from 'react';
import { RtcClient } from '../rtc/client';

export function VoiceRoom({ token, channelId, socket }: { token: string; channelId: string; socket: any }) {
  const rtc = new RtcClient(socket, token);

  return (
    <div>
      <h2>Голосовая комната: {channelId}</h2>
      <button onClick={() => rtc.joinVoice(channelId)}>Подключиться</button>
      <button onClick={() => rtc.toggleMute()}>Mute/Unmute</button>
      <button onClick={() => rtc.startScreenShare()}>Screen Share</button>
      <p>RTC режим: сначала p2p 1:1, затем mediasoup для групповых комнат.</p>
    </div>
  );
}
