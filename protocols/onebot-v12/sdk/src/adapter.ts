import { Adapter, WebSocketReceiver, WSSReceiver, WebhookReceiver, SSEReceiver, Message } from 'imhelper';
import { OneBotV12Event, OneBotV12Response, OneBotV12Segment } from './types.js';
import { HttpClient } from './http-client.js';

export interface OneBotV12AdapterConfig {
  baseUrl: string;
  selfId: string;
  accessToken?: string;
  receiveMode: 'ws' | 'wss' | 'webhook' | 'sse';
  wsUrl?: string; // WebSocket URL（可选，自动构建）
  platform?: string; // 平台名称（可选，用于构建 HTTP 路径）
}

export function createOnebot12Adapter(config: OneBotV12AdapterConfig): Adapter<string, string | OneBotV12Segment[], OneBotV12Response> {
  const { baseUrl, selfId, accessToken, receiveMode, wsUrl, platform } = config;
  const url = new URL(baseUrl);
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const defaultWsUrl = wsUrl || `${protocol}//${url.host}${url.pathname}`;

  class OneBotV12AdapterImpl extends Adapter<string, string | OneBotV12Segment[], OneBotV12Response> {
    public readonly selfId: string = selfId;
    private httpClient: HttpClient;
    private receiver?: WebSocketReceiver<string, string | OneBotV12Segment[], OneBotV12Response> | 
                       WSSReceiver<string, string | OneBotV12Segment[], OneBotV12Response> | 
                       WebhookReceiver<string, string | OneBotV12Segment[], OneBotV12Response> | 
                       SSEReceiver<string, string | OneBotV12Segment[], OneBotV12Response>;

    constructor() {
      super();
      
      // 优先使用传入的 platform，否则从 baseUrl 解析，最后使用默认值
      let resolvedPlatform = platform || 'unknown';
      let accountId = selfId;
      
      // 如果 baseUrl 包含路径且没有传入 platform，尝试解析
      if (!platform && url.pathname && url.pathname !== '/') {
        const parts = url.pathname.split('/').filter(p => p);
        if (parts.length >= 2) {
          resolvedPlatform = parts[0];
          accountId = parts[1];
        }
      }
      
      this.httpClient = new HttpClient({
        baseUrl,
        accessToken,
        platform: resolvedPlatform,
        accountId,
        protocol: 'onebot',
        version: 'v12',
      });
      this.setupReceiver();
      // 不需要监听 'event'，因为 receiver 会直接调用 transformEvent
    }

    private setupReceiver(): void {
      switch (receiveMode) {
        case 'ws':
          this.receiver = new WebSocketReceiver(this, defaultWsUrl, accessToken);
          break;
        case 'wss':
          // WSS 需要路径和端口，这里使用路径
          const wssPath = new URL(defaultWsUrl).pathname;
          this.receiver = new WSSReceiver(this, wssPath, accessToken);
          break;
        case 'sse':
          const sseUrl = `${baseUrl.replace(/\/$/, '')}/events`;
          this.receiver = new SSEReceiver(this, sseUrl, accessToken);
          break;
        case 'webhook':
          const webhookPath = `/${selfId}/onebot/v12`;
          this.receiver = new WebhookReceiver(this, webhookPath, accessToken);
          break;
      }
    }

    transformEvent(event: OneBotV12Event): void {
      this.transformAndEmit(event);
    }

    private transformAndEmit(event: OneBotV12Event): void {
      if (event.type === 'message') {
        const detailType = event.detail_type as 'private' | 'group' | 'channel';
        const messageData: Message.Data<string, typeof detailType, string | OneBotV12Segment[]> = {
          id: event.message_id,
          scene_type: detailType,
          scene_id: detailType === 'private' 
            ? event.user_id 
            : detailType === 'group' 
              ? (event as any).group_id 
              : (event as any).channel_id,
          content: event.message,
          sender: event.user_id,
          time: event.time,
        };
        // Message 需要 ImHelper，这里直接 emit messageData
        // 实际使用时应该通过 ImHelper 来创建 Message
        (this as any).emit(`message.${detailType}`, messageData);
      }
      (this as any).emit('event', event);
    }

    async sendMessage(options: { scene_type: 'private' | 'group' | 'channel'; scene_id: string; message: string | OneBotV12Segment[] }): Promise<OneBotV12Response> {
      const { scene_type, scene_id, message } = options;
      const segments = typeof message === 'string' 
        ? [{ type: 'text', data: { text: message } }]
        : message;
      
      return this.httpClient.post('/send_message', {
        detail_type: scene_type,
        ...(scene_type === 'private' ? { user_id: scene_id } : {}),
        ...(scene_type === 'group' ? { group_id: scene_id } : {}),
        ...(scene_type === 'channel' ? { channel_id: scene_id } : {}),
        message: segments,
      });
    }

    async start(port?: number): Promise<void> {
      if (this.receiver) {
        if (receiveMode === 'wss' || receiveMode === 'webhook') {
          await this.receiver.connect(port || 8080);
        } else {
          // ws 和 sse 模式不需要 port 参数
          await this.receiver.connect();
        }
      }
    }

    async stop(): Promise<void> {
      if (this.receiver) {
        await this.receiver.disconnect();
      }
    }
  }

  return new OneBotV12AdapterImpl();
}
