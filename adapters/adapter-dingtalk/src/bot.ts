/**
 * 钉钉 Bot 客户端
 * 基于钉钉开放平台 API
 */
import { EventEmitter } from 'events';
import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';
import type { RouterContext, Next } from 'onebots';
import type { 
    DingTalkConfig, 
    DingTalkTokenResponse, 
    DingTalkSendMessageRequest,
    DingTalkSendMessageResponse,
    DingTalkEvent,
    DingTalkUser,
    DingTalkChat,
    DingTalkWebhookMessage,
    DingTalkWebhookResponse
} from './types.js';

export class DingTalkBot extends EventEmitter {
    private config: DingTalkConfig;
    private http: AxiosInstance;
    private webhookHttp?: AxiosInstance;
    private accessToken: string = '';
    private tokenExpireTime: number = 0;
    private me: DingTalkUser | null = null;
    private mode: 'internal' | 'webhook' = 'internal'; // 企业内部应用 或 自定义机器人

    constructor(config: DingTalkConfig) {
        super();
        this.config = config;
        
        // 判断使用模式
        if (config.webhook_url) {
            this.mode = 'webhook';
        } else {
            this.mode = 'internal';
        }
        
        // 创建 HTTP 客户端（企业内部应用）
        this.http = axios.create({
            baseURL: 'https://oapi.dingtalk.com',
            timeout: 30000,
        });

        // 创建 Webhook HTTP 客户端（自定义机器人）
        if (this.mode === 'webhook' && config.webhook_url) {
            this.webhookHttp = axios.create({
                baseURL: config.webhook_url,
                timeout: 30000,
            });
        }

        // 设置请求拦截器，自动添加 token（仅企业内部应用）
        if (this.mode === 'internal') {
            this.http.interceptors.request.use(async (config) => {
                if (config.url?.includes('/gettoken')) {
                    return config;
                }
                
                // 自动获取并添加 token
                const token = await this.getAccessToken();
                config.params = config.params || {};
                config.params.access_token = token;
                return config;
            });
        }
    }

    /**
     * 获取访问令牌（企业内部应用）
     */
    async getAccessToken(): Promise<string> {
        if (this.mode === 'webhook') {
            // Webhook 模式不需要 token
            return '';
        }

        if (this.accessToken && Date.now() < this.tokenExpireTime) {
            return this.accessToken;
        }

        const response = await this.http.get<DingTalkTokenResponse>('/gettoken', {
            params: {
                appkey: this.config.app_key,
                appsecret: this.config.app_secret,
            },
        });

        if (response.data.errcode !== 0) {
            throw new Error(`获取访问令牌失败: ${response.data.errmsg}`);
        }

        this.accessToken = response.data.access_token || '';
        this.tokenExpireTime = Date.now() + ((response.data.expires_in || 7200) - 60) * 1000; // 提前60秒刷新

        return this.accessToken;
    }

    /**
     * 启动 Bot
     */
    async start(): Promise<void> {
        try {
            if (this.mode === 'internal') {
                // 获取访问令牌
                await this.getAccessToken();
                
                // 获取 Bot 信息
                this.me = await this.getBotInfo();
            } else {
                // Webhook 模式不需要初始化
                this.me = {
                    userid: this.config.account_id,
                    name: 'DingTalk Bot',
                };
            }
            
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
     * 处理 Webhook 请求（事件订阅）
     */
    async handleWebhook(ctx: RouterContext, next: Next): Promise<void> {
        const body = ctx.request.body as any;
        
        // 验证事件（如果配置了 token）
        if (this.config.token && body.token !== this.config.token) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid token' };
            return;
        }

        // 处理 URL 验证（钉钉首次配置 webhook 时会发送验证请求）
        if (body.encrypt) {
            // 这里需要解密，简化处理
            ctx.body = { 
                encrypt: body.encrypt, // 原样返回
            };
            return;
        }

        // 处理事件
        const event: DingTalkEvent = {
            eventType: body.eventType || body.type,
            eventId: body.eventId || body.id,
            eventTime: body.eventTime || body.timestamp || Date.now(),
            eventCorpId: body.eventCorpId || body.corpId,
            eventData: body.data || body,
        };
        
        this.emit('event', event);

        ctx.body = { success: true };
        await next();
    }

    /**
     * 获取缓存的 Bot 信息
     */
    getCachedMe(): DingTalkUser | null {
        return this.me;
    }

    /**
     * 获取 Bot 信息（企业内部应用）
     */
    async getBotInfo(): Promise<DingTalkUser> {
        if (this.mode === 'webhook') {
            return {
                userid: this.config.account_id,
                name: 'DingTalk Bot',
            };
        }

        // 钉钉没有直接的 getBotInfo API，这里返回一个占位信息
        return {
            userid: this.config.agent_id || this.config.account_id,
            name: 'DingTalk Bot',
        };
    }

    /**
     * 发送消息（企业内部应用）
     */
    async sendMessageInternal(request: DingTalkSendMessageRequest): Promise<DingTalkSendMessageResponse> {
        const response = await this.http.post<DingTalkSendMessageResponse>('/topapi/message/corpconversation/asyncsend_v2', {
            agent_id: this.config.agent_id || request.agent_id,
            userid_list: request.userid_list,
            dept_id_list: request.dept_id_list,
            to_all_user: request.to_all_user || false,
            msg: request.msg,
        });

        if (response.data.errcode !== 0) {
            throw new Error(`发送消息失败: ${response.data.errmsg}`);
        }

        return response.data;
    }

    /**
     * 发送消息（自定义机器人 Webhook）
     */
    async sendMessageWebhook(message: DingTalkWebhookMessage): Promise<DingTalkWebhookResponse> {
        if (!this.webhookHttp) {
            throw new Error('Webhook URL 未配置');
        }

        const response = await this.webhookHttp.post<DingTalkWebhookResponse>('', message);

        if (response.data.errcode !== 0) {
            throw new Error(`发送消息失败: ${response.data.errmsg}`);
        }

        return response.data;
    }

    /**
     * 发送消息（统一接口）
     */
    async sendMessage(
        receiveId: string, 
        receiveIdType: 'user' | 'chat', 
        content: string | any, 
        msgType: string = 'text'
    ): Promise<DingTalkSendMessageResponse | DingTalkWebhookResponse> {
        if (this.mode === 'webhook') {
            // Webhook 模式
            const webhookMessage: DingTalkWebhookMessage = {
                msgtype: msgType,
            };

            if (msgType === 'text') {
                webhookMessage.text = {
                    content: typeof content === 'string' ? content : content.text || '',
                };
            } else if (msgType === 'markdown') {
                webhookMessage.markdown = {
                    title: content.title || '消息',
                    text: typeof content === 'string' ? content : content.text || '',
                };
            }

            // 处理 @
            if (receiveIdType === 'chat' && content.at) {
                webhookMessage.at = content.at;
            }

            return await this.sendMessageWebhook(webhookMessage);
        } else {
            // 企业内部应用模式
            const request: DingTalkSendMessageRequest = {
                agent_id: this.config.agent_id,
                msg: {
                    msgtype: msgType,
                },
            };

            if (receiveIdType === 'user') {
                request.userid_list = receiveId;
            } else {
                // 群聊需要通过其他方式
                request.userid_list = receiveId;
            }

            if (msgType === 'text') {
                request.msg.text = {
                    content: typeof content === 'string' ? content : content.text || '',
                };
            } else if (msgType === 'markdown') {
                request.msg.markdown = {
                    title: content.title || '消息',
                    text: typeof content === 'string' ? content : content.text || '',
                };
            }

            return await this.sendMessageInternal(request);
        }
    }

    /**
     * 获取用户信息
     */
    async getUserInfo(userId: string): Promise<DingTalkUser> {
        if (this.mode === 'webhook') {
            throw new Error('Webhook 模式不支持获取用户信息');
        }

        const response = await this.http.get('/topapi/v2/user/get', {
            params: {
                userid: userId,
            },
        });

        if (response.data.errcode !== 0) {
            throw new Error(`获取用户信息失败: ${response.data.errmsg}`);
        }

        return response.data.result;
    }

    /**
     * 获取 HTTP 客户端实例（用于高级用法）
     */
    getHttpClient(): AxiosInstance {
        return this.http;
    }

    /**
     * 获取模式
     */
    getMode(): 'internal' | 'webhook' {
        return this.mode;
    }
}

