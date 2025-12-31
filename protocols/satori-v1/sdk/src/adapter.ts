import { EventEmitter } from 'events';
import http from 'http';

export interface SatoriAdapter extends EventEmitter {
  selfId: string;
  sendPrivateMessage(userId: string, message: string | any[]): Promise<any>;
  sendGroupMessage(groupId: string, message: string | any[]): Promise<any>;
  sendChannelMessage(channelId: string, message: string | any[]): Promise<any>;
  start(port?: number): Promise<void>;
  stop(): Promise<void>;
}

export interface SatoriAdapterConfig {
  baseUrl: string;
  selfId: string;
  accessToken?: string;
  receiveMode: 'webhook';
  path?: string;
}

export function createSatoriAdapter(config: SatoriAdapterConfig): SatoriAdapter {
  // TODO: 实现 Satori 适配器
  throw new Error('Satori adapter not implemented yet');
}

