import { EventEmitter } from 'events';

export interface MilkyAdapter extends EventEmitter {
  selfId: string;
  sendPrivateMessage(userId: string, message: string | any[]): Promise<any>;
  sendGroupMessage(groupId: string, message: string | any[]): Promise<any>;
  sendChannelMessage(channelId: string, message: string | any[]): Promise<any>;
  start(port?: number): Promise<void>;
  stop(): Promise<void>;
}

export interface MilkyAdapterConfig {
  baseUrl: string;
  selfId: string;
  accessToken?: string;
  receiveMode: 'sse' | 'ws' | 'wss' | 'webhook';
  sseUrl?: string;
  wsUrl?: string;
}

export function createMilkyAdapter(config: MilkyAdapterConfig): MilkyAdapter {
  // TODO: 实现 Milky 适配器
  throw new Error('Milky adapter not implemented yet');
}

