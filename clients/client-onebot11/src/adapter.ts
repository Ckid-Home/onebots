import { Adapter, WebSocketReceiver, WSSReceiver, WebhookReceiver, SSEReceiver, Message } from '@imhelper/core';
import { OneBotV11Event, OneBotV11Response } from './types.js';
import { HttpClient } from './http-client.js';

export interface OneBotV11AdapterConfig {
  baseUrl: string;
  selfId: string;
  accessToken?: string;
  receiveMode: 'ws' | 'wss' | 'webhook' | 'sse';
  path?: string; // webhook 路径
  wsUrl?: string; // WebSocket URL（可选，自动构建）
}

/**
 * 创建 OneBot V11 适配器
 */
export function createOnebot11Adapter(config: OneBotV11AdapterConfig): Adapter<number, string | any[], OneBotV11Response> {
  const { baseUrl, selfId, accessToken, receiveMode, path = '/onebot/v11', wsUrl } = config;

  // 解析 baseUrl 获取协议和主机
  const url = new URL(baseUrl);
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = url.host;
  
  // 构建 WebSocket URL
  const defaultWsUrl = wsUrl || `${protocol}//${host}${url.pathname}`;

  class OneBotV11AdapterImpl extends Adapter<number, string | any[], OneBotV11Response> {
    public readonly selfId: string = selfId;
    private httpClient: HttpClient;
    private receiver?: WebSocketReceiver<number, string | any[], OneBotV11Response> | 
                       WSSReceiver<number, string | any[], OneBotV11Response> | 
                       WebhookReceiver<number, string | any[], OneBotV11Response> | 
                       SSEReceiver<number, string | any[], OneBotV11Response>;

    constructor() {
      super();
      
      // HttpClient 会直接从 baseUrl 解析路径
      this.httpClient = new HttpClient({
        baseUrl,
        accessToken,
        platform: 'unknown', // 不再需要，HttpClient 会从 baseUrl 解析
        accountId: selfId,
      });

      this.setupReceiver();
      // 监听 receiver 触发的事件
      (this as any).on('event', (event: OneBotV11Event) => this.transformAndEmit(event));
    }

    private setupReceiver(): void {
      switch (receiveMode) {
        case 'ws':
          this.receiver = new WebSocketReceiver(this, defaultWsUrl, accessToken);
          break;
        case 'wss':
          const wssPath = new URL(defaultWsUrl).pathname;
          this.receiver = new WSSReceiver(this, wssPath, accessToken);
          break;
        case 'webhook':
          const webhookPath = `/${selfId}${path}`;
          this.receiver = new WebhookReceiver(this, webhookPath, accessToken);
          break;
        case 'sse':
          const sseUrl = `${baseUrl.replace(/\/$/, '')}/events`;
          this.receiver = new SSEReceiver(this, sseUrl, accessToken);
          break;
      }
    }

    transformEvent(event: OneBotV11Event): void {
      this.transformAndEmit(event);
    }

    private transformAndEmit(event: OneBotV11Event): void {
      // 转换为统一的事件格式
      if (event.post_type === 'message') {
        const messageType = event.message_type || 'private';
        const messageData: Message.Data<number, typeof messageType, string | any[]> = {
          id: event.message_id,
          scene_type: messageType,
          scene_id: messageType === 'private' ? event.user_id : event.group_id!,
          content: event.message || [],
          sender: event.user_id,
          time: event.time,
        };
        // Message 需要 ImHelper，这里直接 emit messageData
        (this as any).emit(`message.${messageType}`, messageData);
      }
      
      // 转发原始事件
      (this as any).emit('event', event);
    }

    async sendMessage(options: { scene_type: 'private' | 'group' | 'channel'; scene_id: number; message: string | any[] }): Promise<OneBotV11Response> {
      const { scene_type, scene_id, message } = options;
      
      if (scene_type === 'private') {
        return this.httpClient.post('/send_private_msg', {
          user_id: scene_id,
          message,
        });
      } else {
        // group 或 channel（V11 中频道映射为群）
        return this.httpClient.post('/send_group_msg', {
          group_id: scene_id,
          message,
        });
      }
    }

    async start(port?: number): Promise<void> {
      if (this.receiver) {
        if (receiveMode === 'wss' || receiveMode === 'webhook') {
          await this.receiver.connect(port || 8080);
        } else {
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

  return new OneBotV11AdapterImpl();
}
