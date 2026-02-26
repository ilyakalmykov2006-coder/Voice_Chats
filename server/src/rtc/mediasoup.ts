import * as mediasoup from 'mediasoup';

let worker: mediasoup.types.Worker | null = null;
let router: mediasoup.types.Router | null = null;

export async function getRouter() {
  if (router) return router;

  worker = await mediasoup.createWorker({
    rtcMinPort: Number(process.env.MEDIASOUP_RTP_MIN_PORT || 40000),
    rtcMaxPort: Number(process.env.MEDIASOUP_RTP_MAX_PORT || 40100)
  });

  router = await worker.createRouter({
    mediaCodecs: [
      { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
      { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 }
    ]
  });

  return router;
}
