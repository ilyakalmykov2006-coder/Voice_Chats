# WebSocket protocol spec (Socket.IO)

## Client -> Server
- `presence:update`
  - payload: `{ status: "online" | "idle" | "dnd" }`
- `typing:start`
  - payload: `{ channelId: string }`
- `typing:stop`
  - payload: `{ channelId: string }`
- `message:new`
  - payload: `{ channelId: string, content: string }`
- `voice:join`
  - payload: `{ channelId: string }`
- `voice:mute`
  - payload: `{ muted: boolean }`
- `rtc:transport-create`
  - payload: `{ direction: "send" | "recv" }`
- `rtc:produce`
  - payload: `{ transportId: string, kind: "audio" | "video", rtpParameters: object }`
- `rtc:consume`
  - payload: `{ producerId: string, rtpCapabilities: object }`
- `screen:start`
- `screen:stop`

## Server -> Client
- `presence:update`
- `typing:start`
- `typing:stop`
- `message:new`
- `voice:mute`
- `screen:start`
- `screen:stop`

## Auth
- Socket auth done via `socket.auth = { token: <jwt> }` before connect.
