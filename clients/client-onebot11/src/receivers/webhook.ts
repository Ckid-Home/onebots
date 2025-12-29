import http from 'http';
import { BaseReceiver } from './base.js';
import { OneBotV11Event } from '../types.js';

export interface WebhookReceiverConfig {
  port: number;
  path: string;
  onEvent: (event: OneBotV11Event) => void | Promise<void>;
}

/**
 * Webhook 接收器
 */
export class WebhookReceiver extends BaseReceiver {
  private config: WebhookReceiverConfig;
  private server?: http.Server;

  constructor(config: WebhookReceiverConfig) {
    super({ onEvent: config.onEvent });
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        if (req.url === this.config.path && req.method === 'POST') {
          let body = '';

          req.on('data', (chunk) => {
            body += chunk.toString();
          });

          req.on('end', () => {
            try {
              const event = JSON.parse(body) as OneBotV11Event;
              this.config.onEvent(event);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'ok' }));
            } catch (error) {
              console.error('Failed to parse webhook payload:', error);
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
            }
          });
        } else {
          res.writeHead(404);
          res.end();
        }
      });

      this.server.listen(this.config.port, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

