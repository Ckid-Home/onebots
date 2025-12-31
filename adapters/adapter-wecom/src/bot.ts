/**
 * 企业微信 Bot 客户端
 * 基于企业微信开放平台 API
 */
import { EventEmitter } from 'events';
import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';
import type { RouterContext, Next } from 'onebots';
import type { 
    WeComConfig, 
    WeComTokenResponse, 
    WeComSendMessageRequest,
    WeComSendMessageResponse,
    WeComEvent,
    WeComUser,
    WeComDepartment
} from './types.js';

export class WeComBot extends EventEmitter {
    private config: WeComConfig;
    private http: AxiosInstance;
    private accessToken: string = '';
    private tokenExpireTime: number = 0;
    private me: WeComUser | null = null;

    constructor(config: WeComConfig) {
        super();
        this.config = config;
        
        // 创建 HTTP 客户端
        this.http = axios.create({
            baseURL: 'https://qyapi.weixin.qq.com',
            timeout: 30000,
        });

        // 设置请求拦截器，自动添加 token
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

    /**
     * 获取访问令牌
     */
    async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpireTime) {
            return this.accessToken;
        }

        const response = await this.http.get<WeComTokenResponse>('/cgi-bin/gettoken', {
            params: {
                corpid: this.config.corp_id,
                corpsecret: this.config.corp_secret,
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
            // 获取访问令牌
            await this.getAccessToken();
            
            // 获取应用信息（企业微信没有直接的 getBotInfo API）
            this.me = {
                userid: this.config.agent_id,
                name: 'WeCom Bot',
            };
            
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
     * 处理 Webhook 请求（事件回调）
     */
    async handleWebhook(ctx: RouterContext, next: Next): Promise<void> {
        const body = ctx.request.body as any;
        const query = ctx.query;
        
        // 处理 URL 验证（企业微信首次配置 webhook 时会发送验证请求）
        if (query.msg_signature && query.timestamp && query.nonce && query.echostr) {
            // 这里需要验证签名，简化处理直接返回 echostr
            ctx.body = query.echostr;
            return;
        }

        // 处理事件
        if (body.EventType) {
            const event: WeComEvent = body;
            this.emit('event', event);
        }

        ctx.body = { code: 0 };
        await next();
    }

    /**
     * 获取缓存的 Bot 信息
     */
    getCachedMe(): WeComUser | null {
        return this.me;
    }

    /**
     * 发送应用消息
     */
    async sendMessage(request: WeComSendMessageRequest): Promise<WeComSendMessageResponse> {
        const response = await this.http.post<WeComSendMessageResponse>('/cgi-bin/message/send', {
            ...request,
            agentid: parseInt(this.config.agent_id),
        });

        if (response.data.errcode !== 0) {
            throw new Error(`发送消息失败: ${response.data.errmsg}`);
        }

        return response.data;
    }

    /**
     * 获取用户信息
     */
    async getUserInfo(userId: string): Promise<WeComUser> {
        const response = await this.http.get('/cgi-bin/user/get', {
            params: {
                userid: userId,
            },
        });

        if (response.data.errcode !== 0) {
            throw new Error(`获取用户信息失败: ${response.data.errmsg}`);
        }

        return response.data;
    }

    /**
     * 获取部门列表
     */
    async getDepartmentList(departmentId?: number): Promise<WeComDepartment[]> {
        const response = await this.http.get('/cgi-bin/department/list', {
            params: {
                id: departmentId,
            },
        });

        if (response.data.errcode !== 0) {
            throw new Error(`获取部门列表失败: ${response.data.errmsg}`);
        }

        return response.data.department || [];
    }

    /**
     * 获取部门成员列表
     */
    async getDepartmentMembers(departmentId: number, fetchChild?: boolean): Promise<WeComUser[]> {
        const response = await this.http.get('/cgi-bin/user/list', {
            params: {
                department_id: departmentId,
                fetch_child: fetchChild ? 1 : 0,
            },
        });

        if (response.data.errcode !== 0) {
            throw new Error(`获取部门成员列表失败: ${response.data.errmsg}`);
        }

        return response.data.userlist || [];
    }

    /**
     * 获取 HTTP 客户端实例（用于高级用法）
     */
    getHttpClient(): AxiosInstance {
        return this.http;
    }
}

