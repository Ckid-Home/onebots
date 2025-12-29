import { Receiver } from '../receiver.js';
import { Adapter } from '../adapter.js';
import http from 'http';

export class WebhookReceiver<Id extends string | number = string | number, Content extends string | any[] = string | any[], Response extends any = any> extends Receiver<Id, Content, Response> {
    private server?: http.Server;
    private accessToken?: string;

    async connect(port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                if (req.url === this.path && req.method === 'POST') {
                    // 验证 access_token
                    if (this.accessToken) {
                        const token = req.headers.authorization?.replace('Bearer ', '') ||
                                     new URL(req.url || '', `http://localhost`).searchParams.get('access_token');
                        
                        if (token !== this.accessToken) {
                            res.writeHead(401, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'error', message: 'Unauthorized' }));
                            return;
                        }
                    }

                    let body = '';

                    req.on('data', (chunk) => {
                        body += chunk.toString();
                    });

                    req.on('end', () => {
                        try {
                            const event = JSON.parse(body);
                            this.handleEvent(event);
                            
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'ok' }));
                        } catch (error) {
                            console.error('[WebhookReceiver] Failed to parse payload:', error);
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
                        }
                    });
                } else {
                    res.writeHead(404);
                    res.end();
                }
            });

            this.server.listen(port, (error?: Error) => {
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

    private handleEvent(event: any): void {
        // 触发 adapter 的原始事件
        (this.adapter as any).emit('event', event);
        
        // 尝试转换为消息事件
        this.transformToMessage(event);
    }

    private transformToMessage(event: any): void {
        // 如果 adapter 有 transformEvent 方法，使用它
        if (typeof (this.adapter as any).transformEvent === 'function') {
            (this.adapter as any).transformEvent(event);
            return;
        }

        // 否则尝试通用转换并触发原始事件
        // adapter 应该监听 'event' 事件并自行转换
    }

    constructor(adapter: Adapter<Id, Content, Response>, public path: string, accessToken?: string) {
        super(adapter);
        this.accessToken = accessToken;
    }
}
