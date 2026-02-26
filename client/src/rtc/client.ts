export class RtcClient {
  private muted = false;

  constructor(private socket: any, private token: string) {}

  joinVoice(channelId: string) {
    this.socket.auth = { token: this.token };
    this.socket.connect();
    this.socket.emit('voice:join', { channelId });
  }

  toggleMute() {
    this.muted = !this.muted;
    this.socket.emit('voice:mute', { muted: this.muted });
  }

  async startScreenShare() {
    this.socket.emit('screen:start');
  }
}
