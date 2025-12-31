import { EventEmitter } from 'events';
import { OneBotV11ClientConfig, OneBotV11Response, EventHandler } from './types.js';
import { HttpClient } from './http-client.js';
import { WebSocketReceiver } from './receivers/websocket.js';
import { WebhookReceiver } from './receivers/webhook.js';
import { SSEReceiver } from './receivers/sse.js';

/**
 * OneBot V11 客户端
 * 提供发送和接收消息的功能
 */
export class OneBotV11Client extends EventEmitter {
  private config: Required<OneBotV11ClientConfig>;
  private httpClient: HttpClient;
  private receiver?: WebSocketReceiver | WebhookReceiver | SSEReceiver;

  constructor(config: OneBotV11ClientConfig) {
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
    });

    this.setupReceiver();
  }

  /**
   * 设置接收器
   */
  private setupReceiver(): void {
    const wsPath = `/${this.config.platform}/${this.config.accountId}/onebot/v11`;
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
          path: '/onebot/v11',
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
   * 发送私聊消息
   */
  async sendPrivateMsg(userId: number, message: string | any[]): Promise<OneBotV11Response> {
    return this.httpClient.post('/send_private_msg', {
      user_id: userId,
      message,
    });
  }

  /**
   * 发送群消息
   */
  async sendGroupMsg(groupId: number, message: string | any[]): Promise<OneBotV11Response> {
    return this.httpClient.post('/send_group_msg', {
      group_id: groupId,
      message,
    });
  }

  /**
   * 撤回消息
   */
  async deleteMsg(messageId: number): Promise<OneBotV11Response> {
    return this.httpClient.post('/delete_msg', {
      message_id: messageId,
    });
  }

  /**
   * 获取消息
   */
  async getMsg(messageId: number): Promise<OneBotV11Response> {
    return this.httpClient.post('/get_msg', {
      message_id: messageId,
    });
  }

  /**
   * 获取登录信息
   */
  async getLoginInfo(): Promise<OneBotV11Response> {
    return this.httpClient.post('/get_login_info', {});
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: number, noCache = false): Promise<OneBotV11Response> {
    return this.httpClient.post('/get_user_info', {
      user_id: userId,
      no_cache: noCache,
    });
  }

  /**
   * 获取好友列表
   */
  async getFriendList(): Promise<OneBotV11Response> {
    return this.httpClient.post('/get_friend_list', {});
  }

  /**
   * 获取群信息
   */
  async getGroupInfo(groupId: number, noCache = false): Promise<OneBotV11Response> {
    return this.httpClient.post('/get_group_info', {
      group_id: groupId,
      no_cache: noCache,
    });
  }

  /**
   * 获取群列表
   */
  async getGroupList(): Promise<OneBotV11Response> {
    return this.httpClient.post('/get_group_list', {});
  }

  /**
   * 获取群成员信息
   */
  async getGroupMemberInfo(groupId: number, userId: number, noCache = false): Promise<OneBotV11Response> {
    return this.httpClient.post('/get_group_member_info', {
      group_id: groupId,
      user_id: userId,
      no_cache: noCache,
    });
  }

  /**
   * 获取群成员列表
   */
  async getGroupMemberList(groupId: number): Promise<OneBotV11Response> {
    return this.httpClient.post('/get_group_member_list', {
      group_id: groupId,
    });
  }

  /**
   * 调用自定义 API
   */
  async call(action: string, params?: any): Promise<OneBotV11Response> {
    return this.httpClient.post(`/${action}`, params || {});
  }
}

export * from './types.js';
export * from './adapter.js';

// 导出工厂函数作为默认导出
export { createOnebot11Adapter } from './adapter.js';

