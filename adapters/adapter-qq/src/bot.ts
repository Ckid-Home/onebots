/**
 * QQ官方机器人客户端
 * 使用WebSocket连接QQ官方API，处理消息收发
 */
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import type {
    QQConfig,
    QQIntent,
    IntentBits,
    WSPayload,
    OpCode,
    GatewayResponse,
    ReadyEvent,
    QQUser,
    QQGuild,
    QQChannel,
    QQMember,
    QQMessage,
    SendMessageParams,
    SendGroupMessageParams,
    MessageSendResult,
    DMS,
    MediaUploadParams,
    MediaUploadResult,
    QQApiResponse,
} from './types.js';

export class QQBot extends EventEmitter {
    private config: QQConfig;
    private accessToken: string = '';
    private tokenExpireTime: number = 0;
    private ws: WebSocket | null = null;
    private sessionId: string = '';
    private lastSeq: number = 0;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private reconnectAttempts: number = 0;
    private isResuming: boolean = false;
    private user: QQUser | null = null;
    
    private readonly baseURL: string;
    private readonly wsURL: string;
    
    constructor(config: QQConfig) {
        super();
        this.config = {
            sandbox: false,
            removeAt: true,
            maxRetry: 10,
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_MESSAGE_REACTIONS',
                'DIRECT_MESSAGE',
                'GROUP_AT_MESSAGE_CREATE',
                'C2C_MESSAGE_CREATE',
                'PUBLIC_GUILD_MESSAGES',
            ],
            ...config,
        };
        
        // 根据是否为沙箱环境选择API地址
        this.baseURL = this.config.sandbox 
            ? 'https://sandbox.api.sgroup.qq.com'
            : 'https://api.sgroup.qq.com';
        this.wsURL = this.config.sandbox
            ? 'wss://sandbox.api.sgroup.qq.com'
            : 'wss://api.sgroup.qq.com';
    }
    
    // ============================================
    // 认证相关
    // ============================================
    
    /**
     * 获取Access Token
     */
    async getAccessToken(): Promise<string> {
        const now = Date.now();
        
        // Token有效期检查（提前5分钟刷新）
        if (this.accessToken && this.tokenExpireTime - now > 5 * 60 * 1000) {
            return this.accessToken;
        }
        
        try {
            const response = await fetch('https://bots.qq.com/app/getAppAccessToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appId: this.config.appId,
                    clientSecret: this.config.secret,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`获取Access Token失败: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.access_token) {
                throw new Error(`获取Access Token失败: ${JSON.stringify(data)}`);
            }
            
            this.accessToken = data.access_token;
            this.tokenExpireTime = now + (data.expires_in - 300) * 1000;
            
            this.emit('token_refreshed', this.accessToken);
            return this.accessToken;
        } catch (error: any) {
            this.emit('error', new Error(`获取Access Token失败: ${error.message}`));
            throw error;
        }
    }
    
    /**
     * 构建请求头
     */
    private async getHeaders(): Promise<Record<string, string>> {
        const token = await this.getAccessToken();
        return {
            'Authorization': `QQBot ${token}`,
            'Content-Type': 'application/json',
            'X-Union-Appid': this.config.appId,
        };
    }
    
    // ============================================
    // API调用
    // ============================================
    
    /**
     * 调用QQ API
     */
    private async callApi<T = any>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        path: string,
        body?: any,
        formData?: FormData
    ): Promise<T> {
        const headers = await this.getHeaders();
        const url = `${this.baseURL}${path}`;
        
        try {
            const options: RequestInit = {
                method,
                headers: formData ? { ...headers, 'Content-Type': undefined as any } : headers,
            };
            
            if (body && !formData) {
                options.body = JSON.stringify(body);
            }
            if (formData) {
                options.body = formData;
                delete (options.headers as any)['Content-Type'];
            }
            
            const response = await fetch(url, options);
            const text = await response.text();
            
            let data: any;
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = { raw: text };
            }
            
            if (!response.ok) {
                const error = new Error(`QQ API错误 [${response.status}]: ${data.message || text}`);
                (error as any).code = data.code;
                (error as any).status = response.status;
                throw error;
            }
            
            return data as T;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
    
    // ============================================
    // WebSocket连接
    // ============================================
    
    /**
     * 获取WebSocket网关地址
     */
    async getGateway(): Promise<GatewayResponse> {
        return this.callApi<GatewayResponse>('GET', '/gateway');
    }
    
    /**
     * 计算intent值
     */
    private calculateIntents(): number {
        const IntentBitsMap: Record<string, number> = {
            'GUILDS': 1 << 0,
            'GUILD_MEMBERS': 1 << 1,
            'GUILD_MESSAGES': 1 << 9,
            'GUILD_MESSAGE_REACTIONS': 1 << 10,
            'DIRECT_MESSAGE': 1 << 12,
            'OPEN_FORUMS_EVENT': 1 << 18,
            'INTERACTION': 1 << 26,
            'MESSAGE_AUDIT': 1 << 27,
            'GROUP_AT_MESSAGE_CREATE': 1 << 25,
            'C2C_MESSAGE_CREATE': 1 << 25,
            'PUBLIC_GUILD_MESSAGES': 1 << 30,
        };
        
        let intents = 0;
        for (const intent of (this.config.intents || [])) {
            if (IntentBitsMap[intent]) {
                intents |= IntentBitsMap[intent];
            }
        }
        return intents;
    }
    
    /**
     * 连接WebSocket
     */
    async connect(): Promise<void> {
        try {
            const gateway = await this.getGateway();
            this.ws = new WebSocket(gateway.url);
            
            this.ws.on('open', () => {
                this.emit('ws_open');
            });
            
            this.ws.on('message', (data: WebSocket.Data) => {
                this.handleMessage(data.toString());
            });
            
            this.ws.on('close', (code, reason) => {
                this.emit('ws_close', code, reason.toString());
                this.stopHeartbeat();
                this.handleReconnect();
            });
            
            this.ws.on('error', (error) => {
                this.emit('error', error);
            });
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * 处理WebSocket消息
     */
    private handleMessage(data: string): void {
        try {
            const payload: WSPayload = JSON.parse(data);
            
            if (payload.s) {
                this.lastSeq = payload.s;
            }
            
            switch (payload.op) {
                case 10: // HELLO
                    this.handleHello(payload.d);
                    break;
                case 0: // DISPATCH
                    this.handleDispatch(payload);
                    break;
                case 11: // HEARTBEAT_ACK
                    this.emit('heartbeat_ack');
                    break;
                case 7: // RECONNECT
                    this.handleReconnect();
                    break;
                case 9: // INVALID_SESSION
                    this.handleInvalidSession(payload.d);
                    break;
            }
        } catch (error) {
            this.emit('error', error);
        }
    }
    
    /**
     * 处理Hello消息
     */
    private handleHello(d: { heartbeat_interval: number }): void {
        this.startHeartbeat(d.heartbeat_interval);
        
        if (this.isResuming && this.sessionId) {
            this.sendResume();
        } else {
            this.sendIdentify();
        }
    }
    
    /**
     * 发送鉴权
     */
    private async sendIdentify(): Promise<void> {
        const token = await this.getAccessToken();
        
        const payload: WSPayload = {
            op: 2,
            d: {
                token: `QQBot ${token}`,
                intents: this.calculateIntents(),
                shard: [0, 1],
                properties: {
                    $os: 'linux',
                    $browser: 'onebots',
                    $device: 'onebots',
                },
            },
        };
        
        this.send(payload);
    }
    
    /**
     * 发送恢复连接
     */
    private sendResume(): void {
        const payload: WSPayload = {
            op: 6,
            d: {
                token: `QQBot ${this.accessToken}`,
                session_id: this.sessionId,
                seq: this.lastSeq,
            },
        };
        
        this.send(payload);
    }
    
    /**
     * 处理Dispatch事件
     */
    private handleDispatch(payload: WSPayload): void {
        const eventType = payload.t;
        const data = payload.d;
        
        if (eventType === 'READY') {
            this.handleReady(data);
            return;
        }
        
        if (eventType === 'RESUMED') {
            this.isResuming = false;
            this.reconnectAttempts = 0;
            this.emit('resumed');
            return;
        }
        
        // 移除@机器人内容
        if (this.config.removeAt && data?.content) {
            data.content = this.removeAtBot(data.content);
        }
        
        // 发出事件
        this.emit('dispatch', eventType, data);
        this.emit(eventType || 'unknown', data);
        
        // 消息类事件
        if (eventType === 'AT_MESSAGE_CREATE' || eventType === 'MESSAGE_CREATE') {
            this.emit('message.guild', data);
        } else if (eventType === 'DIRECT_MESSAGE_CREATE') {
            this.emit('message.direct', data);
        } else if (eventType === 'GROUP_AT_MESSAGE_CREATE') {
            this.emit('message.group', data);
        } else if (eventType === 'C2C_MESSAGE_CREATE') {
            this.emit('message.private', data);
        }
    }
    
    /**
     * 处理Ready事件
     */
    private handleReady(data: ReadyEvent): void {
        this.sessionId = data.session_id;
        this.user = data.user;
        this.reconnectAttempts = 0;
        this.isResuming = false;
        
        this.emit('ready', data);
    }
    
    /**
     * 处理无效会话
     */
    private handleInvalidSession(resumable: boolean): void {
        if (resumable) {
            this.isResuming = true;
            setTimeout(() => this.connect(), 1000);
        } else {
            this.sessionId = '';
            this.lastSeq = 0;
            setTimeout(() => this.connect(), 5000);
        }
    }
    
    /**
     * 处理重连
     */
    private handleReconnect(): void {
        if (this.reconnectAttempts >= (this.config.maxRetry || 10)) {
            this.emit('error', new Error('重连次数超过最大限制'));
            return;
        }
        
        this.reconnectAttempts++;
        this.isResuming = !!this.sessionId;
        
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    /**
     * 发送WebSocket消息
     */
    private send(payload: WSPayload): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        }
    }
    
    /**
     * 开始心跳
     */
    private startHeartbeat(interval: number): void {
        this.stopHeartbeat();
        
        this.heartbeatInterval = setInterval(() => {
            this.send({
                op: 1,
                d: this.lastSeq || null,
            });
        }, interval);
    }
    
    /**
     * 停止心跳
     */
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    /**
     * 移除@机器人内容
     */
    private removeAtBot(content: string): string {
        return content.replace(/<@!?\d+>/g, '').trim();
    }
    
    // ============================================
    // 机器人信息
    // ============================================
    
    /**
     * 获取机器人信息
     */
    async getSelfInfo(): Promise<QQUser> {
        return this.callApi<QQUser>('GET', '/users/@me');
    }
    
    /**
     * 获取机器人加入的频道列表
     */
    async getGuilds(): Promise<QQGuild[]> {
        return this.callApi<QQGuild[]>('GET', '/users/@me/guilds');
    }
    
    // ============================================
    // 频道管理
    // ============================================
    
    /**
     * 获取频道信息
     */
    async getGuild(guildId: string): Promise<QQGuild> {
        return this.callApi<QQGuild>('GET', `/guilds/${guildId}`);
    }
    
    /**
     * 获取子频道列表
     */
    async getChannels(guildId: string): Promise<QQChannel[]> {
        return this.callApi<QQChannel[]>('GET', `/guilds/${guildId}/channels`);
    }
    
    /**
     * 获取子频道信息
     */
    async getChannel(channelId: string): Promise<QQChannel> {
        return this.callApi<QQChannel>('GET', `/channels/${channelId}`);
    }
    
    /**
     * 创建子频道
     */
    async createChannel(guildId: string, data: Partial<QQChannel>): Promise<QQChannel> {
        return this.callApi<QQChannel>('POST', `/guilds/${guildId}/channels`, data);
    }
    
    /**
     * 修改子频道
     */
    async updateChannel(channelId: string, data: Partial<QQChannel>): Promise<QQChannel> {
        return this.callApi<QQChannel>('PATCH', `/channels/${channelId}`, data);
    }
    
    /**
     * 删除子频道
     */
    async deleteChannel(channelId: string): Promise<void> {
        await this.callApi('DELETE', `/channels/${channelId}`);
    }
    
    // ============================================
    // 成员管理
    // ============================================
    
    /**
     * 获取频道成员列表
     */
    async getGuildMembers(guildId: string, limit: number = 100, after?: string): Promise<QQMember[]> {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (after) params.set('after', after);
        return this.callApi<QQMember[]>('GET', `/guilds/${guildId}/members?${params}`);
    }
    
    /**
     * 获取频道成员信息
     */
    async getGuildMember(guildId: string, userId: string): Promise<QQMember> {
        return this.callApi<QQMember>('GET', `/guilds/${guildId}/members/${userId}`);
    }
    
    /**
     * 删除频道成员
     */
    async kickGuildMember(guildId: string, userId: string, addBlacklist?: boolean, deleteHistoryMsgDays?: number): Promise<void> {
        const params = new URLSearchParams();
        if (addBlacklist !== undefined) params.set('add_blacklist', String(addBlacklist));
        if (deleteHistoryMsgDays !== undefined) params.set('delete_history_msg_days', String(deleteHistoryMsgDays));
        
        const query = params.toString() ? `?${params}` : '';
        await this.callApi('DELETE', `/guilds/${guildId}/members/${userId}${query}`);
    }
    
    /**
     * 禁言成员
     */
    async muteGuildMember(guildId: string, userId: string, muteEndTimestamp?: string, muteSeconds?: string): Promise<void> {
        await this.callApi('PATCH', `/guilds/${guildId}/members/${userId}/mute`, {
            mute_end_timestamp: muteEndTimestamp,
            mute_seconds: muteSeconds,
        });
    }
    
    /**
     * 全员禁言
     */
    async muteGuild(guildId: string, muteEndTimestamp?: string, muteSeconds?: string): Promise<void> {
        await this.callApi('PATCH', `/guilds/${guildId}/mute`, {
            mute_end_timestamp: muteEndTimestamp,
            mute_seconds: muteSeconds,
        });
    }
    
    // ============================================
    // 消息发送 - 频道
    // ============================================
    
    /**
     * 发送频道消息
     */
    async sendChannelMessage(channelId: string, params: SendMessageParams): Promise<MessageSendResult> {
        return this.callApi<MessageSendResult>('POST', `/channels/${channelId}/messages`, params);
    }
    
    /**
     * 撤回频道消息
     */
    async recallChannelMessage(channelId: string, messageId: string, hidetip?: boolean): Promise<void> {
        const params = hidetip !== undefined ? `?hidetip=${hidetip}` : '';
        await this.callApi('DELETE', `/channels/${channelId}/messages/${messageId}${params}`);
    }
    
    // ============================================
    // 消息发送 - 私信
    // ============================================
    
    /**
     * 创建私信会话
     */
    async createDMS(recipientId: string, sourceGuildId: string): Promise<DMS> {
        return this.callApi<DMS>('POST', '/users/@me/dms', {
            recipient_id: recipientId,
            source_guild_id: sourceGuildId,
        });
    }
    
    /**
     * 发送私信消息
     */
    async sendDMSMessage(guildId: string, params: SendMessageParams): Promise<MessageSendResult> {
        return this.callApi<MessageSendResult>('POST', `/dms/${guildId}/messages`, params);
    }
    
    /**
     * 撤回私信消息
     */
    async recallDMSMessage(guildId: string, messageId: string, hidetip?: boolean): Promise<void> {
        const params = hidetip !== undefined ? `?hidetip=${hidetip}` : '';
        await this.callApi('DELETE', `/dms/${guildId}/messages/${messageId}${params}`);
    }
    
    // ============================================
    // 消息发送 - 群聊
    // ============================================
    
    /**
     * 发送群消息
     */
    async sendGroupMessage(groupOpenId: string, params: SendGroupMessageParams): Promise<MessageSendResult> {
        return this.callApi<MessageSendResult>('POST', `/v2/groups/${groupOpenId}/messages`, params);
    }
    
    /**
     * 上传群文件
     */
    async uploadGroupFile(groupOpenId: string, params: MediaUploadParams): Promise<MediaUploadResult> {
        return this.callApi<MediaUploadResult>('POST', `/v2/groups/${groupOpenId}/files`, params);
    }
    
    // ============================================
    // 消息发送 - 单聊（C2C）
    // ============================================
    
    /**
     * 发送单聊消息
     */
    async sendC2CMessage(userOpenId: string, params: SendMessageParams): Promise<MessageSendResult> {
        return this.callApi<MessageSendResult>('POST', `/v2/users/${userOpenId}/messages`, params);
    }
    
    /**
     * 上传单聊文件
     */
    async uploadC2CFile(userOpenId: string, params: MediaUploadParams): Promise<MediaUploadResult> {
        return this.callApi<MediaUploadResult>('POST', `/v2/users/${userOpenId}/files`, params);
    }
    
    // ============================================
    // 表态API
    // ============================================
    
    /**
     * 添加表情表态
     */
    async addReaction(channelId: string, messageId: string, type: number, emojiId: string): Promise<void> {
        await this.callApi('PUT', `/channels/${channelId}/messages/${messageId}/reactions/${type}/${emojiId}`);
    }
    
    /**
     * 删除表情表态
     */
    async removeReaction(channelId: string, messageId: string, type: number, emojiId: string): Promise<void> {
        await this.callApi('DELETE', `/channels/${channelId}/messages/${messageId}/reactions/${type}/${emojiId}`);
    }
    
    // ============================================
    // 角色管理
    // ============================================
    
    /**
     * 获取频道身份组列表
     */
    async getGuildRoles(guildId: string): Promise<{ guild_id: string; roles: any[]; role_num_limit: string }> {
        return this.callApi('GET', `/guilds/${guildId}/roles`);
    }
    
    /**
     * 创建频道身份组
     */
    async createGuildRole(guildId: string, name: string, color?: number, hoist?: boolean): Promise<{ role_id: string; role: any }> {
        return this.callApi('POST', `/guilds/${guildId}/roles`, {
            name,
            color,
            hoist: hoist ? 1 : 0,
        });
    }
    
    /**
     * 删除频道身份组
     */
    async deleteGuildRole(guildId: string, roleId: string): Promise<void> {
        await this.callApi('DELETE', `/guilds/${guildId}/roles/${roleId}`);
    }
    
    /**
     * 添加成员到身份组
     */
    async addMemberToRole(guildId: string, userId: string, roleId: string, channelId?: string): Promise<void> {
        const body = channelId ? { channel: { id: channelId } } : undefined;
        await this.callApi('PUT', `/guilds/${guildId}/members/${userId}/roles/${roleId}`, body);
    }
    
    /**
     * 从身份组移除成员
     */
    async removeMemberFromRole(guildId: string, userId: string, roleId: string, channelId?: string): Promise<void> {
        const body = channelId ? { channel: { id: channelId } } : undefined;
        await this.callApi('DELETE', `/guilds/${guildId}/members/${userId}/roles/${roleId}`, body);
    }
    
    // ============================================
    // 公告管理
    // ============================================
    
    /**
     * 创建频道公告
     */
    async createAnnounce(guildId: string, messageId: string, channelId: string): Promise<any> {
        return this.callApi('POST', `/guilds/${guildId}/announces`, {
            message_id: messageId,
            channel_id: channelId,
        });
    }
    
    /**
     * 删除频道公告
     */
    async deleteAnnounce(guildId: string, messageId: string): Promise<void> {
        await this.callApi('DELETE', `/guilds/${guildId}/announces/${messageId}`);
    }
    
    // ============================================
    // 精华消息
    // ============================================
    
    /**
     * 添加精华消息
     */
    async addPin(channelId: string, messageId: string): Promise<any> {
        return this.callApi('PUT', `/channels/${channelId}/pins/${messageId}`);
    }
    
    /**
     * 删除精华消息
     */
    async removePin(channelId: string, messageId: string): Promise<void> {
        await this.callApi('DELETE', `/channels/${channelId}/pins/${messageId}`);
    }
    
    /**
     * 获取精华消息
     */
    async getPins(channelId: string): Promise<{ guild_id: string; channel_id: string; message_ids: string[] }> {
        return this.callApi('GET', `/channels/${channelId}/pins`);
    }
    
    // ============================================
    // 日程管理
    // ============================================
    
    /**
     * 获取日程列表
     */
    async getSchedules(channelId: string, since?: number): Promise<any[]> {
        const params = since ? `?since=${since}` : '';
        return this.callApi('GET', `/channels/${channelId}/schedules${params}`);
    }
    
    /**
     * 获取日程详情
     */
    async getSchedule(channelId: string, scheduleId: string): Promise<any> {
        return this.callApi('GET', `/channels/${channelId}/schedules/${scheduleId}`);
    }
    
    /**
     * 创建日程
     */
    async createSchedule(channelId: string, schedule: any): Promise<any> {
        return this.callApi('POST', `/channels/${channelId}/schedules`, { schedule });
    }
    
    /**
     * 修改日程
     */
    async updateSchedule(channelId: string, scheduleId: string, schedule: any): Promise<any> {
        return this.callApi('PATCH', `/channels/${channelId}/schedules/${scheduleId}`, { schedule });
    }
    
    /**
     * 删除日程
     */
    async deleteSchedule(channelId: string, scheduleId: string): Promise<void> {
        await this.callApi('DELETE', `/channels/${channelId}/schedules/${scheduleId}`);
    }
    
    // ============================================
    // 生命周期
    // ============================================
    
    /**
     * 启动Bot
     */
    async start(): Promise<void> {
        try {
            await this.getAccessToken();
            await this.connect();
            this.emit('start');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * 停止Bot
     */
    async stop(): Promise<void> {
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close(1000, 'Normal closure');
            this.ws = null;
        }
        
        this.sessionId = '';
        this.lastSeq = 0;
        this.accessToken = '';
        this.tokenExpireTime = 0;
        
        this.emit('stop');
    }
    
    /**
     * 获取当前用户信息
     */
    get currentUser(): QQUser | null {
        return this.user;
    }
}
