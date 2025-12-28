/**
 * KOOK (开黑了) Bot 客户端
 * 支持 WebSocket 和 Webhook 两种连接模式
 */
import { EventEmitter } from 'events';
import { Context, Next } from 'koa';
import WebSocket from 'ws';
import type {
    KookConfig,
    KookUser,
    KookGuild,
    KookChannel,
    KookRole,
    KookChannelMessage,
    KookDirectMessage,
    KookApiResponse,
    KookListResponse,
    KookSignal,
    KookEvent,
    KookUserChat,
    KookSendMessageParams,
    KookSendDirectMessageParams,
    KookMessageType,
} from './types.js';
import { KookSignalType } from './types.js';
import {
    verifyWebhook,
    decryptWebhookMessage,
    generateNonce,
} from './utils.js';

export class KookBot extends EventEmitter {
    private config: KookConfig;
    private baseURL: string = 'https://www.kookapp.cn/api/v3';
    private ws: WebSocket | null = null;
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private sessionId: string = '';
    private lastSn: number = 0;
    private isReconnecting: boolean = false;
    private me: KookUser | null = null;

    constructor(config: KookConfig) {
        super();
        this.config = config;
    }

    /**
     * 获取 API 请求头
     */
    private getHeaders(): Record<string, string> {
        return {
            'Authorization': `Bot ${this.config.token}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * 调用 KOOK API
     */
    private async callApi<T = any>(
        method: 'GET' | 'POST',
        path: string,
        body?: any,
        params?: Record<string, string>
    ): Promise<T> {
        const url = new URL(path, this.baseURL);
        
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.set(key, value);
                }
            });
        }

        try {
            const options: RequestInit = {
                method,
                headers: this.getHeaders(),
            };

            if (body && method === 'POST') {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url.toString(), options);
            const data = await response.json() as KookApiResponse<T>;

            if (data.code !== 0) {
                throw new Error(`KOOK API 错误 [${data.code}]: ${data.message}`);
            }

            return data.data;
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    // ============================================
    // WebSocket 连接管理
    // ============================================

    /**
     * 获取 WebSocket Gateway
     */
    private async getGateway(): Promise<string> {
        const data = await this.callApi<{ url: string }>('GET', '/gateway/index', undefined, {
            compress: '0',  // 不压缩
        });
        return data.url;
    }

    /**
     * 连接 WebSocket
     */
    private async connectWebSocket(): Promise<void> {
        try {
            const gatewayUrl = await this.getGateway();
            
            this.ws = new WebSocket(gatewayUrl);
            
            this.ws.on('open', () => {
                this.emit('ws_open');
            });

            this.ws.on('message', (data: Buffer) => {
                try {
                    const signal: KookSignal = JSON.parse(data.toString());
                    this.handleSignal(signal);
                } catch (error: any) {
                    this.emit('error', new Error(`解析 WebSocket 消息失败: ${error.message}`));
                }
            });

            this.ws.on('close', (code, reason) => {
                this.emit('ws_close', code, reason.toString());
                this.stopHeartbeat();
                
                // 非主动关闭时尝试重连
                if (!this.isReconnecting && code !== 1000) {
                    this.scheduleReconnect();
                }
            });

            this.ws.on('error', (error) => {
                this.emit('error', error);
            });
        } catch (error) {
            this.emit('error', error);
            this.scheduleReconnect();
        }
    }

    /**
     * 处理 WebSocket 信令
     */
    private handleSignal(signal: KookSignal): void {
        switch (signal.s) {
            case KookSignalType.EVENT:
                // 事件消息
                if (signal.sn !== undefined) {
                    this.lastSn = signal.sn;
                }
                this.handleEvent(signal.d);
                break;
                
            case KookSignalType.HELLO:
                // Hello 消息，保存 session_id
                if (signal.d && signal.d.session_id) {
                    this.sessionId = signal.d.session_id;
                    this.startHeartbeat();
                    this.emit('ready');
                }
                break;
                
            case KookSignalType.PONG:
                // Pong 消息
                this.emit('pong');
                break;
                
            case KookSignalType.RECONNECT:
                // 服务端要求重连
                this.reconnect();
                break;
                
            case KookSignalType.RESUME_ACK:
                // 恢复成功
                this.emit('resume_ack');
                break;
        }
    }

    /**
     * 处理事件
     */
    private handleEvent(event: KookEvent): void {
        // 系统消息
        if (event.type === 255) {
            const eventType = event.extra?.type;
            this.emit(`system.${eventType}`, event);
            this.emit('system', event);
            return;
        }

        // 普通消息
        if (event.channel_type === 'GROUP') {
            // 频道消息
            this.emit('channel_message', event);
        } else if (event.channel_type === 'PERSON') {
            // 私聊消息
            this.emit('direct_message', event);
        } else if (event.channel_type === 'BROADCAST') {
            // 广播消息
            this.emit('broadcast_message', event);
        }

        // 通用消息事件
        this.emit('message', event);
    }

    /**
     * 发送 Ping
     */
    private sendPing(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const ping: KookSignal = {
                s: KookSignalType.PING,
                d: {},
                sn: this.lastSn,
            };
            this.ws.send(JSON.stringify(ping));
        }
    }

    /**
     * 发送 Resume
     */
    private sendResume(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const resume: KookSignal = {
                s: KookSignalType.RESUME,
                d: {
                    sn: this.lastSn,
                    session_id: this.sessionId,
                },
            };
            this.ws.send(JSON.stringify(resume));
        }
    }

    /**
     * 启动心跳
     */
    private startHeartbeat(): void {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            this.sendPing();
        }, 30000);  // 30 秒一次
    }

    /**
     * 停止心跳
     */
    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 安排重连
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimer) return;
        
        this.isReconnecting = true;
        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null;
            await this.reconnect();
        }, 5000);  // 5 秒后重连
    }

    /**
     * 重连
     */
    private async reconnect(): Promise<void> {
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        try {
            await this.connectWebSocket();
            this.isReconnecting = false;
        } catch (error) {
            this.emit('error', error);
            this.scheduleReconnect();
        }
    }

    // ============================================
    // Webhook 处理
    // ============================================

    /**
     * 处理 Webhook 请求
     */
    async handleWebhook(ctx: Context, next: Next): Promise<void> {
        if (ctx.method !== 'POST') {
            ctx.status = 405;
            ctx.body = 'Method Not Allowed';
            return;
        }

        try {
            // 读取原始请求体
            const chunks: Buffer[] = [];
            for await (const chunk of ctx.req) {
                chunks.push(chunk as Buffer);
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8');

            if (!rawBody) {
                ctx.status = 400;
                ctx.body = 'Empty request body';
                return;
            }

            let body: any;
            
            // 解析 JSON
            try {
                body = JSON.parse(rawBody);
            } catch {
                ctx.status = 400;
                ctx.body = 'Invalid JSON';
                return;
            }

            // 如果有加密
            if (body.encrypt && this.config.encryptKey) {
                const decrypted = decryptWebhookMessage(body.encrypt, this.config.encryptKey);
                body = JSON.parse(decrypted);
            }

            // 验证 Webhook Token
            if (this.config.verifyToken) {
                if (!verifyWebhook(body, this.config.verifyToken)) {
                    ctx.status = 403;
                    ctx.body = 'Invalid verify_token';
                    return;
                }
            }

            // Challenge 验证
            if (body.d?.channel_type === 'WEBHOOK_CHALLENGE') {
                ctx.body = {
                    challenge: body.d.challenge,
                };
                return;
            }

            // 处理事件
            if (body.s === 0 && body.d) {
                this.handleEvent(body.d as KookEvent);
            }

            ctx.status = 200;
            ctx.body = '';
        } catch (error: any) {
            this.emit('error', error);
            ctx.status = 500;
            ctx.body = `Error: ${error.message}`;
        }
    }

    // ============================================
    // 用户相关 API
    // ============================================

    /**
     * 获取当前用户信息
     */
    async getMe(): Promise<KookUser> {
        const user = await this.callApi<KookUser>('GET', '/user/me');
        this.me = user;
        return user;
    }

    /**
     * 获取用户信息
     */
    async getUser(userId: string, guildId?: string): Promise<KookUser> {
        const params: Record<string, string> = { user_id: userId };
        if (guildId) params.guild_id = guildId;
        return this.callApi<KookUser>('GET', '/user/view', undefined, params);
    }

    // ============================================
    // 服务器相关 API
    // ============================================

    /**
     * 获取服务器列表
     */
    async getGuildList(page?: number, pageSize?: number): Promise<KookListResponse<KookGuild>> {
        const params: Record<string, string> = {};
        if (page !== undefined) params.page = String(page);
        if (pageSize !== undefined) params.page_size = String(pageSize);
        return this.callApi<KookListResponse<KookGuild>>('GET', '/guild/list', undefined, params);
    }

    /**
     * 获取服务器详情
     */
    async getGuild(guildId: string): Promise<KookGuild> {
        return this.callApi<KookGuild>('GET', '/guild/view', undefined, { guild_id: guildId });
    }

    /**
     * 获取服务器成员列表
     */
    async getGuildMemberList(
        guildId: string,
        channelId?: string,
        search?: string,
        roleId?: number,
        mobileVerified?: boolean,
        activeTime?: number,
        joinedAt?: number,
        page?: number,
        pageSize?: number
    ): Promise<KookListResponse<KookUser>> {
        const params: Record<string, string> = { guild_id: guildId };
        if (channelId) params.channel_id = channelId;
        if (search) params.search = search;
        if (roleId !== undefined) params.role_id = String(roleId);
        if (mobileVerified !== undefined) params.mobile_verified = mobileVerified ? '1' : '0';
        if (activeTime !== undefined) params.active_time = String(activeTime);
        if (joinedAt !== undefined) params.joined_at = String(joinedAt);
        if (page !== undefined) params.page = String(page);
        if (pageSize !== undefined) params.page_size = String(pageSize);
        return this.callApi<KookListResponse<KookUser>>('GET', '/guild/user-list', undefined, params);
    }

    /**
     * 修改服务器昵称
     */
    async setGuildNickname(guildId: string, nickname?: string, userId?: string): Promise<void> {
        await this.callApi('POST', '/guild/nickname', {
            guild_id: guildId,
            nickname,
            user_id: userId,
        });
    }

    /**
     * 离开服务器
     */
    async leaveGuild(guildId: string): Promise<void> {
        await this.callApi('POST', '/guild/leave', { guild_id: guildId });
    }

    /**
     * 踢出用户
     */
    async kickGuildMember(guildId: string, targetId: string): Promise<void> {
        await this.callApi('POST', '/guild/kickout', {
            guild_id: guildId,
            target_id: targetId,
        });
    }

    // ============================================
    // 频道相关 API
    // ============================================

    /**
     * 获取频道列表
     */
    async getChannelList(guildId: string, type?: 1 | 2, page?: number, pageSize?: number): Promise<KookListResponse<KookChannel>> {
        const params: Record<string, string> = { guild_id: guildId };
        if (type !== undefined) params.type = String(type);
        if (page !== undefined) params.page = String(page);
        if (pageSize !== undefined) params.page_size = String(pageSize);
        return this.callApi<KookListResponse<KookChannel>>('GET', '/channel/list', undefined, params);
    }

    /**
     * 获取频道详情
     */
    async getChannel(channelId: string): Promise<KookChannel> {
        return this.callApi<KookChannel>('GET', '/channel/view', undefined, { target_id: channelId });
    }

    /**
     * 创建频道
     */
    async createChannel(
        guildId: string,
        name: string,
        type?: 1 | 2,
        parentId?: string,
        limitAmount?: number,
        voiceQuality?: 1 | 2 | 3
    ): Promise<KookChannel> {
        return this.callApi<KookChannel>('POST', '/channel/create', {
            guild_id: guildId,
            name,
            type,
            parent_id: parentId,
            limit_amount: limitAmount,
            voice_quality: voiceQuality,
        });
    }

    /**
     * 更新频道
     */
    async updateChannel(
        channelId: string,
        name?: string,
        topic?: string,
        slowMode?: number
    ): Promise<KookChannel> {
        return this.callApi<KookChannel>('POST', '/channel/update', {
            channel_id: channelId,
            name,
            topic,
            slow_mode: slowMode,
        });
    }

    /**
     * 删除频道
     */
    async deleteChannel(channelId: string): Promise<void> {
        await this.callApi('POST', '/channel/delete', { channel_id: channelId });
    }

    /**
     * 获取频道用户列表
     */
    async getChannelUserList(channelId: string): Promise<KookUser[]> {
        return this.callApi<KookUser[]>('GET', '/channel/user-list', undefined, { channel_id: channelId });
    }

    // ============================================
    // 消息相关 API
    // ============================================

    /**
     * 发送频道消息
     */
    async sendChannelMessage(params: KookSendMessageParams): Promise<{ msg_id: string; msg_timestamp: number; nonce: string }> {
        return this.callApi('POST', '/message/create', {
            type: params.type || 1,
            target_id: params.target_id,
            content: params.content,
            quote: params.quote,
            nonce: params.nonce || generateNonce(),
            temp_target_id: params.temp_target_id,
        });
    }

    /**
     * 更新频道消息
     */
    async updateChannelMessage(msgId: string, content: string, quote?: string, tempTargetId?: string): Promise<void> {
        await this.callApi('POST', '/message/update', {
            msg_id: msgId,
            content,
            quote,
            temp_target_id: tempTargetId,
        });
    }

    /**
     * 删除频道消息
     */
    async deleteChannelMessage(msgId: string): Promise<void> {
        await this.callApi('POST', '/message/delete', { msg_id: msgId });
    }

    /**
     * 获取频道消息列表
     */
    async getChannelMessageList(
        targetId: string,
        msgId?: string,
        pin?: 0 | 1,
        flag?: 'before' | 'around' | 'after',
        pageSize?: number
    ): Promise<KookChannelMessage[]> {
        const params: Record<string, string> = { target_id: targetId };
        if (msgId) params.msg_id = msgId;
        if (pin !== undefined) params.pin = String(pin);
        if (flag) params.flag = flag;
        if (pageSize !== undefined) params.page_size = String(pageSize);
        return this.callApi<KookChannelMessage[]>('GET', '/message/list', undefined, params);
    }

    /**
     * 获取频道消息详情
     */
    async getChannelMessage(msgId: string): Promise<KookChannelMessage> {
        return this.callApi<KookChannelMessage>('GET', '/message/view', undefined, { msg_id: msgId });
    }

    /**
     * 添加表情回应
     */
    async addReaction(msgId: string, emoji: string): Promise<void> {
        await this.callApi('POST', '/message/add-reaction', {
            msg_id: msgId,
            emoji,
        });
    }

    /**
     * 删除表情回应
     */
    async deleteReaction(msgId: string, emoji: string, userId?: string): Promise<void> {
        await this.callApi('POST', '/message/delete-reaction', {
            msg_id: msgId,
            emoji,
            user_id: userId,
        });
    }

    // ============================================
    // 私聊相关 API
    // ============================================

    /**
     * 获取私聊会话列表
     */
    async getUserChatList(page?: number, pageSize?: number): Promise<KookListResponse<KookUserChat>> {
        const params: Record<string, string> = {};
        if (page !== undefined) params.page = String(page);
        if (pageSize !== undefined) params.page_size = String(pageSize);
        return this.callApi<KookListResponse<KookUserChat>>('GET', '/user-chat/list', undefined, params);
    }

    /**
     * 获取私聊会话详情
     */
    async getUserChat(chatCode: string): Promise<KookUserChat> {
        return this.callApi<KookUserChat>('GET', '/user-chat/view', undefined, { chat_code: chatCode });
    }

    /**
     * 创建私聊会话
     */
    async createUserChat(targetId: string): Promise<KookUserChat> {
        return this.callApi<KookUserChat>('POST', '/user-chat/create', { target_id: targetId });
    }

    /**
     * 删除私聊会话
     */
    async deleteUserChat(chatCode: string): Promise<void> {
        await this.callApi('POST', '/user-chat/delete', { chat_code: chatCode });
    }

    /**
     * 发送私聊消息
     */
    async sendDirectMessage(params: KookSendDirectMessageParams): Promise<{ msg_id: string; msg_timestamp: number; nonce: string }> {
        return this.callApi('POST', '/direct-message/create', {
            type: params.type || 1,
            target_id: params.target_id,
            chat_code: params.chat_code,
            content: params.content,
            quote: params.quote,
            nonce: params.nonce || generateNonce(),
        });
    }

    /**
     * 更新私聊消息
     */
    async updateDirectMessage(msgId: string, content: string, quote?: string): Promise<void> {
        await this.callApi('POST', '/direct-message/update', {
            msg_id: msgId,
            content,
            quote,
        });
    }

    /**
     * 删除私聊消息
     */
    async deleteDirectMessage(msgId: string): Promise<void> {
        await this.callApi('POST', '/direct-message/delete', { msg_id: msgId });
    }

    /**
     * 获取私聊消息列表
     */
    async getDirectMessageList(
        chatCode?: string,
        targetId?: string,
        msgId?: string,
        flag?: 'before' | 'around' | 'after',
        pageSize?: number
    ): Promise<KookDirectMessage[]> {
        const params: Record<string, string> = {};
        if (chatCode) params.chat_code = chatCode;
        if (targetId) params.target_id = targetId;
        if (msgId) params.msg_id = msgId;
        if (flag) params.flag = flag;
        if (pageSize !== undefined) params.page_size = String(pageSize);
        return this.callApi<KookDirectMessage[]>('GET', '/direct-message/list', undefined, params);
    }

    /**
     * 添加私聊表情回应
     */
    async addDirectReaction(msgId: string, emoji: string): Promise<void> {
        await this.callApi('POST', '/direct-message/add-reaction', {
            msg_id: msgId,
            emoji,
        });
    }

    /**
     * 删除私聊表情回应
     */
    async deleteDirectReaction(msgId: string, emoji: string): Promise<void> {
        await this.callApi('POST', '/direct-message/delete-reaction', {
            msg_id: msgId,
            emoji,
        });
    }

    // ============================================
    // 角色相关 API
    // ============================================

    /**
     * 获取服务器角色列表
     */
    async getRoleList(guildId: string, page?: number, pageSize?: number): Promise<KookListResponse<KookRole>> {
        const params: Record<string, string> = { guild_id: guildId };
        if (page !== undefined) params.page = String(page);
        if (pageSize !== undefined) params.page_size = String(pageSize);
        return this.callApi<KookListResponse<KookRole>>('GET', '/guild-role/list', undefined, params);
    }

    /**
     * 创建服务器角色
     */
    async createRole(guildId: string, name?: string): Promise<KookRole> {
        return this.callApi<KookRole>('POST', '/guild-role/create', {
            guild_id: guildId,
            name,
        });
    }

    /**
     * 更新服务器角色
     */
    async updateRole(
        guildId: string,
        roleId: number,
        name?: string,
        color?: number,
        hoist?: 0 | 1,
        mentionable?: 0 | 1,
        permissions?: number
    ): Promise<KookRole> {
        return this.callApi<KookRole>('POST', '/guild-role/update', {
            guild_id: guildId,
            role_id: roleId,
            name,
            color,
            hoist,
            mentionable,
            permissions,
        });
    }

    /**
     * 删除服务器角色
     */
    async deleteRole(guildId: string, roleId: number): Promise<void> {
        await this.callApi('POST', '/guild-role/delete', {
            guild_id: guildId,
            role_id: roleId,
        });
    }

    /**
     * 赋予用户角色
     */
    async grantRole(guildId: string, userId: string, roleId: number): Promise<{ user_id: string; guild_id: string; roles: number[] }> {
        return this.callApi('POST', '/guild-role/grant', {
            guild_id: guildId,
            user_id: userId,
            role_id: roleId,
        });
    }

    /**
     * 移除用户角色
     */
    async revokeRole(guildId: string, userId: string, roleId: number): Promise<{ user_id: string; guild_id: string; roles: number[] }> {
        return this.callApi('POST', '/guild-role/revoke', {
            guild_id: guildId,
            user_id: userId,
            role_id: roleId,
        });
    }

    // ============================================
    // 亲密度相关 API
    // ============================================

    /**
     * 获取亲密度信息
     */
    async getIntimacy(userId: string): Promise<any> {
        return this.callApi('GET', '/intimacy/index', undefined, { user_id: userId });
    }

    /**
     * 更新亲密度
     */
    async updateIntimacy(userId: string, score?: number, socialInfo?: string, imgId?: string): Promise<void> {
        await this.callApi('POST', '/intimacy/update', {
            user_id: userId,
            score,
            social_info: socialInfo,
            img_id: imgId,
        });
    }

    // ============================================
    // 媒体相关 API
    // ============================================

    /**
     * 上传文件（获取 URL）
     */
    async uploadAsset(fileBuffer: Buffer, filename: string): Promise<{ url: string }> {
        const formData = new FormData();
        // Convert Buffer to ArrayBuffer and then to Blob
        const arrayBuffer = fileBuffer.buffer.slice(
            fileBuffer.byteOffset,
            fileBuffer.byteOffset + fileBuffer.byteLength
        ) as ArrayBuffer;
        formData.append('file', new Blob([arrayBuffer]), filename);

        const response = await fetch(`${this.baseURL}/asset/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${this.config.token}`,
            },
            body: formData,
        });

        const data = await response.json() as KookApiResponse<{ url: string }>;
        
        if (data.code !== 0) {
            throw new Error(`上传文件失败 [${data.code}]: ${data.message}`);
        }

        return data.data;
    }

    // ============================================
    // 禁言相关 API
    // ============================================

    /**
     * 获取服务器禁言列表
     */
    async getGuildMuteList(guildId: string): Promise<{ mic: { type: number; user_ids: string[] }; headset: { type: number; user_ids: string[] } }> {
        return this.callApi('GET', '/guild-mute/list', undefined, { guild_id: guildId });
    }

    /**
     * 添加禁言
     */
    async createGuildMute(guildId: string, userId: string, type: 1 | 2): Promise<void> {
        await this.callApi('POST', '/guild-mute/create', {
            guild_id: guildId,
            user_id: userId,
            type,  // 1=麦克风 2=耳机
        });
    }

    /**
     * 移除禁言
     */
    async deleteGuildMute(guildId: string, userId: string, type: 1 | 2): Promise<void> {
        await this.callApi('POST', '/guild-mute/delete', {
            guild_id: guildId,
            user_id: userId,
            type,
        });
    }

    // ============================================
    // 邀请相关 API
    // ============================================

    /**
     * 获取邀请列表
     */
    async getInviteList(guildId?: string, channelId?: string, page?: number, pageSize?: number): Promise<KookListResponse<any>> {
        const params: Record<string, string> = {};
        if (guildId) params.guild_id = guildId;
        if (channelId) params.channel_id = channelId;
        if (page !== undefined) params.page = String(page);
        if (pageSize !== undefined) params.page_size = String(pageSize);
        return this.callApi('GET', '/invite/list', undefined, params);
    }

    /**
     * 创建邀请链接
     */
    async createInvite(guildId?: string, channelId?: string, duration?: number, settingTimes?: number): Promise<{ url: string }> {
        return this.callApi('POST', '/invite/create', {
            guild_id: guildId,
            channel_id: channelId,
            duration,
            setting_times: settingTimes,
        });
    }

    /**
     * 删除邀请链接
     */
    async deleteInvite(urlCode: string, guildId?: string, channelId?: string): Promise<void> {
        await this.callApi('POST', '/invite/delete', {
            url_code: urlCode,
            guild_id: guildId,
            channel_id: channelId,
        });
    }

    // ============================================
    // 黑名单相关 API
    // ============================================

    /**
     * 获取黑名单列表
     */
    async getBlacklist(guildId: string): Promise<KookListResponse<{ user_id: string; created_time: number; remark: string; user: KookUser }>> {
        return this.callApi('GET', '/blacklist/list', undefined, { guild_id: guildId });
    }

    /**
     * 添加黑名单
     */
    async addBlacklist(guildId: string, targetId: string, remark?: string, delMsgDays?: number): Promise<void> {
        await this.callApi('POST', '/blacklist/create', {
            guild_id: guildId,
            target_id: targetId,
            remark,
            del_msg_days: delMsgDays,
        });
    }

    /**
     * 移除黑名单
     */
    async removeBlacklist(guildId: string, targetId: string): Promise<void> {
        await this.callApi('POST', '/blacklist/delete', {
            guild_id: guildId,
            target_id: targetId,
        });
    }

    // ============================================
    // 生命周期
    // ============================================

    /**
     * 启动 Bot
     */
    async start(): Promise<void> {
        try {
            // 获取自身信息
            await this.getMe();
            
            // 根据模式连接
            if (this.config.mode === 'webhook') {
                // Webhook 模式不需要主动连接
                this.emit('ready');
            } else {
                // WebSocket 模式
                await this.connectWebSocket();
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 停止 Bot
     */
    async stop(): Promise<void> {
        this.stopHeartbeat();
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            this.ws.close(1000);
            this.ws = null;
        }

        this.emit('stopped');
    }

    /**
     * 获取缓存的用户信息
     */
    getCachedMe(): KookUser | null {
        return this.me;
    }
}
