import { Receiver } from '../receiver.js';
import { Adapter } from '../adapter.js';
import WebSocket from 'ws';

export class WebSocketReceiver<Id extends string | number = string | number, Content extends string | any[] = string | any[], Response extends any = any> extends Receiver<Id, Content, Response> {
    private ws?: WebSocket;
    private reconnectTimer?: NodeJS.Timeout;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private accessToken?: string;

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const url = new URL(this.url);
                if (this.accessToken) {
                    url.searchParams.set('access_token', this.accessToken);
                }

                this.ws = new WebSocket(url.toString());

                this.ws.on('open', () => {
                    this.reconnectAttempts = 0;
                    resolve();
                });

                this.ws.on('message', (data: Buffer) => {
                    try {
                        const event = JSON.parse(data.toString());
                        this.handleEvent(event);
                    } catch (error) {
                        console.error('[WebSocketReceiver] Failed to parse message:', error);
                    }
                });

                this.ws.on('error', (error) => {
                    console.error('[WebSocketReceiver] WebSocket error:', error);
                    if (this.reconnectAttempts === 0) {
                        reject(error);
                    }
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
            console.error('[WebSocketReceiver] Max reconnection attempts reached');
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        this.reconnectTimer = setTimeout(() => {
            this.connect().catch((error) => {
                console.error('[WebSocketReceiver] Reconnection failed:', error);
            });
        }, delay);
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

    constructor(adapter: Adapter<Id, Content, Response>, public url: string, accessToken?: string) {
        super(adapter);
        this.accessToken = accessToken;
    }
}
