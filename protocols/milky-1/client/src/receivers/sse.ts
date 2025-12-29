import { BaseReceiver } from './base.js';
import { MilkyV1Event } from '../types.js';

export interface SSEReceiverConfig {
  url: string;
  accessToken?: string;
  onEvent: (event: MilkyV1Event) => void | Promise<void>;
}

/**
 * Server-Sent Events (SSE) 接收器
 */
export class SSEReceiver extends BaseReceiver {
  private sseConfig: SSEReceiverConfig;
  private eventSource?: EventSource;
  private reconnectTimer?: NodeJS.Timeout;

  constructor(config: SSEReceiverConfig) {
    super({ onEvent: config.onEvent });
    this.sseConfig = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(this.sseConfig.url);
        if (this.sseConfig.accessToken) {
          url.searchParams.set('access_token', this.sseConfig.accessToken);
        }

        // 注意：浏览器环境的 EventSource，Node.js 环境需要使用 polyfill
        if (typeof EventSource === 'undefined') {
          reject(new Error('EventSource is not available. Use a polyfill for Node.js environment.'));
          return;
        }

        this.eventSource = new EventSource(url.toString());

        this.eventSource.onopen = () => {
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as MilkyV1Event;
            this.sseConfig.onEvent(data);
          } catch (error) {
            console.error('Failed to parse SSE message:', error);
          }
        };

        this.eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          this.scheduleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect().catch((error) => {
        console.error('SSE reconnection failed:', error);
      });
    }, 5000);
  }
}

