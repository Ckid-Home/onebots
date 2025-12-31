import { MilkyV1Event } from '../types.js';

export interface ReceiverConfig {
  onEvent: (event: MilkyV1Event) => void | Promise<void>;
}

/**
 * 接收器基类
 */
export abstract class BaseReceiver {
  protected config: ReceiverConfig;

  constructor(config: ReceiverConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
}

