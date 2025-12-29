import { Receiver } from '../receiver.js';
import { Adapter } from '../adapter.js';

// 获取 EventSource 的辅助函数
async function getEventSource(): Promise<any> {
    // 检查是否在浏览器环境
    if (typeof globalThis !== 'undefined' && 'window' in globalThis && (globalThis as any).window?.EventSource) {
        // 浏览器环境，使用原生 EventSource
        return (globalThis as any).window.EventSource;
    } else {
        // Node.js 环境，使用 eventsource 库
        try {
            // @ts-ignore - eventsource 是 CommonJS 模块，在 ESM 中动态导入时类型定义可能不完整
            const eventsourceModule = await import('eventsource');
            // eventsource 可能是 default export 或 named export
            return eventsourceModule.default || eventsourceModule;
        } catch {
            throw new Error('EventSource is not available. Install "eventsource" package for Node.js environment.');
        }
    }
}

export class SSEReceiver<Id extends string | number = string | number, Content extends string | any[] = string | any[], Response extends any = any> extends Receiver<Id, Content, Response> {
    private eventSource?: any;
    private reconnectTimer?: NodeJS.Timeout;
    private accessToken?: string;

    async connect(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // 动态获取 EventSource
                const EventSource = await getEventSource();
                
                const url = new URL(this.url);
                if (this.accessToken) {
                    url.searchParams.set('access_token', this.accessToken);
                }

                // 对于 Node.js 的 eventsource 库，需要传递 headers
                const headers: Record<string, string> = {};
                if (this.accessToken) {
                    headers['Authorization'] = `Bearer ${this.accessToken}`;
                }

                this.eventSource = new EventSource(url.toString(), { headers });

                this.eventSource.onopen = () => {
                    resolve();
                };

                this.eventSource.onmessage = (event: any) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleEvent(data);
                    } catch (error) {
                        console.error('[SSEReceiver] Failed to parse SSE message:', error);
                    }
                };

                this.eventSource.onerror = (error: any) => {
                    console.error('[SSEReceiver] SSE error:', error);
                    if (this.eventSource?.readyState === 0) {
                        // CONNECTING state, might be initial connection failure
                        reject(error);
                    } else {
                        // Other errors, schedule reconnect
                        this.scheduleReconnect();
                    }
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
                console.error('[SSEReceiver] SSE reconnection failed:', error);
            });
        }, 5000);
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
