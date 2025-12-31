/**
 * 飞书 Bot 客户端
 * 基于飞书开放平台 API
 */
import { EventEmitter } from 'events';
import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';
import type { RouterContext, Next } from 'onebots';
import type { 
    FeishuConfig, 
    FeishuTokenResponse, 
    FeishuSendMessageRequest,
    FeishuSendMessageResponse,
    FeishuEvent,
    FeishuUser,
    FeishuChat
} from './types.js';

export class FeishuBot extends EventEmitter {
    private config: FeishuConfig;
    private http: AxiosInstance;
    private appAccessToken: string = '';
    private tenantAccessToken: string = '';
    private tokenExpireTime: number = 0;
    private me: FeishuUser | null = null;

    constructor(config: FeishuConfig) {
        super();
        this.config = config;
        
        // 创建 HTTP 客户端
        this.http = axios.create({
            baseURL: 'https://open.feishu.cn/open-apis',
            timeout: 30000,
        });

        // 设置请求拦截器，自动添加 token
        this.http.interceptors.request.use(async (config) => {
            if (config.url?.includes('/auth/v3/tenant_access_token') || 
                config.url?.includes('/auth/v3/app_access_token')) {
                return config;
            }
            
            // 自动获取并添加 token
            const token = await this.getTenantAccessToken();
            config.headers = config.headers || {} as AxiosRequestHeaders;
            config.headers['Authorization'] = `Bearer ${token}`;
            return config;
        });
    }

    /**
     * 获取应用访问令牌
     */
    async getAppAccessToken(): Promise<string> {
        if (this.appAccessToken && Date.now() < this.tokenExpireTime) {
            return this.appAccessToken;
        }

        const response = await this.http.post<FeishuTokenResponse>('/auth/v3/app_access_token/internal', {
            app_id: this.config.app_id,
            app_secret: this.config.app_secret,
        });

        if (response.data.code !== 0) {
            throw new Error(`获取应用访问令牌失败: ${response.data.msg}`);
        }

        this.appAccessToken = response.data.app_access_token || '';
        this.tokenExpireTime = Date.now() + (response.data.expire - 60) * 1000; // 提前60秒刷新

        return this.appAccessToken;
    }

    /**
     * 获取租户访问令牌
     */
    async getTenantAccessToken(): Promise<string> {
        if (this.tenantAccessToken && Date.now() < this.tokenExpireTime) {
            return this.tenantAccessToken;
        }

        const response = await this.http.post<FeishuTokenResponse>('/auth/v3/tenant_access_token/internal', {
            app_id: this.config.app_id,
            app_secret: this.config.app_secret,
        });

        if (response.data.code !== 0) {
            throw new Error(`获取租户访问令牌失败: ${response.data.msg}`);
        }

        this.tenantAccessToken = response.data.tenant_access_token || '';
        this.tokenExpireTime = Date.now() + (response.data.expire - 60) * 1000; // 提前60秒刷新

        return this.tenantAccessToken;
    }

    /**
     * 启动 Bot
     */
    async start(): Promise<void> {
        try {
            // 获取访问令牌
            await this.getTenantAccessToken();
            
            // 获取 Bot 信息
            this.me = await this.getBotInfo();
            
            this.emit('ready');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 停止 Bot
     */
    async stop(): Promise<void> {
        this.emit('stopped');
    }

    /**
     * 处理 Webhook 请求
     */
    async handleWebhook(ctx: RouterContext, next: Next): Promise<void> {
        const body = ctx.request.body as any;
        
        // 验证事件（如果配置了 verification_token）
        if (this.config.verification_token && body.header?.token !== this.config.verification_token) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid token' };
            return;
        }

        // 处理 URL 验证（飞书首次配置 webhook 时会发送验证请求）
        if (body.type === 'url_verification') {
            ctx.body = { challenge: body.challenge };
            return;
        }

        // 处理事件
        const event: FeishuEvent = body;
        this.emit('event', event);

        ctx.body = { code: 0 };
        await next();
    }

    /**
     * 获取缓存的 Bot 信息
     */
    getCachedMe(): FeishuUser | null {
        return this.me;
    }

    /**
     * 获取 Bot 信息
     */
    async getBotInfo(): Promise<FeishuUser> {
        const response = await this.http.get('/im/v1/bots', {
            params: {
                page_size: 1,
            },
        });

        if (response.data.code !== 0) {
            throw new Error(`获取 Bot 信息失败: ${response.data.msg}`);
        }

        // 飞书没有直接的 getBotInfo API，这里返回一个占位信息
        return {
            user_id: this.config.app_id,
            open_id: this.config.app_id,
            name: 'Feishu Bot',
        };
    }

    /**
     * 发送消息
     */
    async sendMessage(receiveId: string, receiveIdType: 'open_id' | 'user_id' | 'union_id' | 'email' | 'chat_id', content: string | any, msgType: string = 'text'): Promise<FeishuSendMessageResponse> {
        const request: FeishuSendMessageRequest = {
            receive_id: receiveId,
            receive_id_type: receiveIdType,
            msg_type: msgType as any,
            content: typeof content === 'string' ? JSON.stringify({ text: content }) : JSON.stringify(content),
        };

        const response = await this.http.post<FeishuSendMessageResponse>('/im/v1/messages', request, {
            params: {
                receive_id_type: receiveIdType,
            },
        });

        if (response.data.code !== 0) {
            throw new Error(`发送消息失败: ${response.data.msg}`);
        }

        return response.data;
    }

    /**
     * 获取用户信息
     */
    async getUserInfo(userId: string, userIdType: 'open_id' | 'user_id' | 'union_id' = 'open_id'): Promise<FeishuUser> {
        const response = await this.http.get(`/contact/v3/users/${userId}`, {
            params: {
                user_id_type: userIdType,
            },
        });

        if (response.data.code !== 0) {
            throw new Error(`获取用户信息失败: ${response.data.msg}`);
        }

        return response.data.data.user;
    }

    /**
     * 获取群组信息
     */
    async getChatInfo(chatId: string): Promise<FeishuChat> {
        const response = await this.http.get(`/im/v1/chats/${chatId}`);

        if (response.data.code !== 0) {
            throw new Error(`获取群组信息失败: ${response.data.msg}`);
        }

        return response.data.data;
    }

    /**
     * 获取群组成员列表
     */
    async getChatMembers(chatId: string): Promise<FeishuUser[]> {
        const response = await this.http.get(`/im/v1/chats/${chatId}/members`);

        if (response.data.code !== 0) {
            throw new Error(`获取群组成员列表失败: ${response.data.msg}`);
        }

        return response.data.data.items || [];
    }

    /**
     * 获取 HTTP 客户端实例（用于高级用法）
     */
    getHttpClient(): AxiosInstance {
        return this.http;
    }
}

