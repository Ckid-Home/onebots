import { EventEmitter } from 'events';
import { OneBotV12ClientConfig, OneBotV12Event, OneBotV12Response, OneBotV12Segment, EventHandler } from './types.js';
import { HttpClient } from './http-client.js';
import { WebSocketReceiver } from './receivers/websocket.js';
import { WebhookReceiver } from './receivers/webhook.js';
import { SSEReceiver } from './receivers/sse.js';

/**
 * OneBot V12 客户端
 * 提供发送和接收消息的功能
 */
export class OneBotV12Client extends EventEmitter {
  private config: Required<OneBotV12ClientConfig>;
  private httpClient: HttpClient;
  private receiver?: WebSocketReceiver | WebhookReceiver | SSEReceiver;

  constructor(config: OneBotV12ClientConfig) {
    super();
    
    this.config = {
      receiveMode: 'websocket',
      accessToken: '',
      webhookUrl: '',
      webhookPort: 8080,
      ...config,
    };

    this.httpClient = new HttpClient({
      baseUrl: this.config.baseUrl,
      accessToken: this.config.accessToken,
      platform: this.config.platform,
      accountId: this.config.accountId,
      protocol: 'onebot',
      version: 'v12',
    });

    this.setupReceiver();
  }

  /**
   * 设置接收器
   */
  private setupReceiver(): void {
    const wsPath = `/${this.config.platform}/${this.config.accountId}/onebot/v12`;
    const wsUrl = this.config.baseUrl.replace(/^http/, 'ws') + wsPath;

    switch (this.config.receiveMode) {
      case 'websocket':
        this.receiver = new WebSocketReceiver({
          url: wsUrl,
          accessToken: this.config.accessToken,
          onEvent: (event) => { this.emit('event', event); },
        });
        break;
      case 'webhook':
        this.receiver = new WebhookReceiver({
          port: this.config.webhookPort,
          path: '/onebot/v12',
          onEvent: (event) => { this.emit('event', event); },
        });
        break;
      case 'sse':
        const sseUrl = `${this.config.baseUrl}${wsPath}/events`;
        this.receiver = new SSEReceiver({
          url: sseUrl,
          accessToken: this.config.accessToken,
          onEvent: (event) => { this.emit('event', event); },
        });
        break;
    }
  }

  /**
   * 连接并开始接收事件
   */
  async connect(): Promise<void> {
    if (this.receiver) {
      await this.receiver.connect();
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.receiver) {
      await this.receiver.disconnect();
    }
  }

  /**
   * 监听事件
   */
  onEvent(handler: EventHandler): void {
    this.on('event', handler);
  }

  /**
   * 发送消息
   */
  async sendMessage(params: {
    detail_type: 'private' | 'group' | 'channel';
    user_id?: string;
    group_id?: string;
    guild_id?: string;
    channel_id?: string;
    message: OneBotV12Segment[];
  }): Promise<OneBotV12Response> {
    return this.httpClient.post('/send_message', params);
  }

  /**
   * 撤回消息
   */
  async deleteMessage(messageId: string): Promise<OneBotV12Response> {
    return this.httpClient.post('/delete_message', {
      message_id: messageId,
    });
  }

  /**
   * 获取机器人自身信息
   */
  async getSelfInfo(): Promise<OneBotV12Response> {
    return this.httpClient.post('/get_self_info', {});
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<OneBotV12Response> {
    return this.httpClient.post('/get_user_info', {
      user_id: userId,
    });
  }

  /**
   * 获取好友列表
   */
  async getFriendList(): Promise<OneBotV12Response> {
    return this.httpClient.post('/get_friend_list', {});
  }

  /**
   * 获取群信息
   */
  async getGroupInfo(groupId: string): Promise<OneBotV12Response> {
    return this.httpClient.post('/get_group_info', {
      group_id: groupId,
    });
  }

  /**
   * 获取群列表
   */
  async getGroupList(): Promise<OneBotV12Response> {
    return this.httpClient.post('/get_group_list', {});
  }

  /**
   * 获取群成员信息
   */
  async getGroupMemberInfo(groupId: string, userId: string): Promise<OneBotV12Response> {
    return this.httpClient.post('/get_group_member_info', {
      group_id: groupId,
      user_id: userId,
    });
  }

  /**
   * 获取群成员列表
   */
  async getGroupMemberList(groupId: string): Promise<OneBotV12Response> {
    return this.httpClient.post('/get_group_member_list', {
      group_id: groupId,
    });
  }

  /**
   * 调用自定义 API
   */
  async call(action: string, params?: any): Promise<OneBotV12Response> {
    return this.httpClient.post(`/${action}`, params || {});
  }
}

export * from './types.js';
export * from './adapter.js';
export { createOnebot12Adapter } from './adapter.js';

