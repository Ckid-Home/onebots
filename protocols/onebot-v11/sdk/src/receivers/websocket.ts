import WebSocket from 'ws';
import { BaseReceiver } from './base.js';
import { OneBotV11Event } from '../types.js';

export interface WebSocketReceiverConfig {
  url: string;
  accessToken?: string;
  onEvent: (event: OneBotV11Event) => void | Promise<void>;
}

/**
 * WebSocket 接收器
 */
export class WebSocketReceiver extends BaseReceiver {
  private wsConfig: WebSocketReceiverConfig;
  private ws?: WebSocket;
  private reconnectTimer?: NodeJS.Timeout;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(config: WebSocketReceiverConfig) {
    super({ onEvent: config.onEvent });
    this.wsConfig = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(this.wsConfig.url);
        if (this.wsConfig.accessToken) {
          url.searchParams.set('access_token', this.wsConfig.accessToken);
        }

        this.ws = new WebSocket(url.toString());

        this.ws.on('open', () => {
          this.reconnectAttempts = 0;
          resolve();
        });

        this.ws.on('message', (data: Buffer) => {
          try {
            const event = JSON.parse(data.toString()) as OneBotV11Event;
            this.wsConfig.onEvent(event);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        });

        this.ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });

        this.ws.on('close', () => {
          this.scheduleReconnect();
        });
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

    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }
}

