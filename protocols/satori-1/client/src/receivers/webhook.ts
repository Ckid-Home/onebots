import http from 'http';
import { BaseReceiver } from './base.js';
import { SatoriV1Event } from '../types.js';

export interface WebhookReceiverConfig {
  port: number;
  path: string;
  onEvent: (event: SatoriV1Event) => void | Promise<void>;
}

/**
 * Webhook 接收器
 */
export class WebhookReceiver extends BaseReceiver {
  private webhookConfig: WebhookReceiverConfig;
  private server?: http.Server;

  constructor(config: WebhookReceiverConfig) {
    super({ onEvent: config.onEvent });
    this.webhookConfig = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        if (req.url === this.webhookConfig.path && req.method === 'POST') {
          let body = '';

          req.on('data', (chunk) => {
            body += chunk.toString();
          });

          req.on('end', () => {
            try {
              const event = JSON.parse(body) as SatoriV1Event;
              this.webhookConfig.onEvent(event);
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

      this.server.listen(this.webhookConfig.port, (error?: Error) => {
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

