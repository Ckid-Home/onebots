/**
 * Discord Lite Bot 客户端
 * 轻量版实现，不依赖 discord.js，支持 Cloudflare Workers
 */

import { EventEmitter } from 'events';
import { DiscordLite, GatewayIntents, type DiscordLiteOptions } from './index.js';
import type { DiscordREST } from './rest.js';

export interface DiscordLiteBotConfig {
    /** 账号标识 */
    account_id: string;
    /** Discord Bot Token */
    token: string;
    /** Application ID (用于 Interactions 模式) */
    application_id?: string;
    /** Public Key (用于 Interactions 验证) */
    public_key?: string;
    /** 代理配置 */
    proxy?: {
        url: string;
        username?: string;
        password?: string;
    };
    /** 运行模式: gateway (Node.js) 或 interactions (Serverless) */
    mode?: 'gateway' | 'interactions' | 'auto';
    /** Gateway Intents (数值或字符串数组) */
    intents?: number | string[];
}

// Discord API 返回的类型
export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    global_name?: string | null;
    avatar: string | null;
    bot?: boolean;
}

export interface DiscordMessage {
    id: string;
    channel_id: string;
    guild_id?: string;
    author: DiscordUser;
    content: string;
    timestamp: string;
    edited_timestamp?: string | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: DiscordUser[];
    attachments: DiscordAttachment[];
    embeds: any[];
    pinned: boolean;
    type: number;
}

export interface DiscordAttachment {
    id: string;
    filename: string;
    size: number;
    url: string;
    proxy_url: string;
    height?: number;
    width?: number;
    content_type?: string;
}

export interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner_id: string;
    member_count?: number;
}

export interface DiscordChannel {
    id: string;
    type: number;
    guild_id?: string;
    name?: string;
    topic?: string | null;
    nsfw?: boolean;
    parent_id?: string | null;
}

export interface DiscordMember {
    user: DiscordUser;
    nick?: string | null;
    roles: string[];
    joined_at: string;
    premium_since?: string | null;
    pending?: boolean;
    communication_disabled_until?: string | null;
}

/**
 * Discord Lite Bot
 * 基于轻量客户端实现，兼容 Node.js 和 Cloudflare Workers
 */
export class DiscordLiteBot extends EventEmitter {
    private client: DiscordLite;
    private config: DiscordLiteBotConfig;
    private ready: boolean = false;
    private user: DiscordUser | null = null;
    private guilds: Map<string, DiscordGuild> = new Map();

    constructor(config: DiscordLiteBotConfig) {
        super();
        this.config = config;
        
        // 解析 intents
        const intents = this.parseIntents(config.intents);

        const clientOptions: DiscordLiteOptions = {
            token: config.token,
            intents,
            proxy: config.proxy,
            mode: config.mode,
            applicationId: config.application_id,
            publicKey: config.public_key,
        };

        this.client = new DiscordLite(clientOptions);
        this.setupEventListeners();
    }

    /**
     * 解析 intents 配置
     */
    private parseIntents(intentsConfig?: number | string[]): number {
        if (typeof intentsConfig === 'number') {
            return intentsConfig;
        }

        if (!intentsConfig || intentsConfig.length === 0) {
            // 默认 intents
            return (
                GatewayIntents.Guilds |
                GatewayIntents.GuildMessages |
                GatewayIntents.GuildMembers |
                GatewayIntents.GuildMessageReactions |
                GatewayIntents.DirectMessages |
                GatewayIntents.DirectMessageReactions |
                GatewayIntents.MessageContent
            );
        }

        let result = 0;
        const intentMap: Record<string, number> = {
            'Guilds': GatewayIntents.Guilds,
            'GuildMembers': GatewayIntents.GuildMembers,
            'GuildModeration': GatewayIntents.GuildModeration,
            'GuildEmojisAndStickers': GatewayIntents.GuildEmojisAndStickers,
            'GuildIntegrations': GatewayIntents.GuildIntegrations,
            'GuildWebhooks': GatewayIntents.GuildWebhooks,
            'GuildInvites': GatewayIntents.GuildInvites,
            'GuildVoiceStates': GatewayIntents.GuildVoiceStates,
            'GuildPresences': GatewayIntents.GuildPresences,
            'GuildMessages': GatewayIntents.GuildMessages,
            'GuildMessageReactions': GatewayIntents.GuildMessageReactions,
            'GuildMessageTyping': GatewayIntents.GuildMessageTyping,
            'DirectMessages': GatewayIntents.DirectMessages,
            'DirectMessageReactions': GatewayIntents.DirectMessageReactions,
            'DirectMessageTyping': GatewayIntents.DirectMessageTyping,
            'MessageContent': GatewayIntents.MessageContent,
            'GuildScheduledEvents': GatewayIntents.GuildScheduledEvents,
        };

        for (const intent of intentsConfig) {
            if (intent in intentMap) {
                result |= intentMap[intent];
            }
        }

        return result;
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        this.client.on('ready', (user) => {
            this.ready = true;
            this.user = user;
            this.emit('ready', this.wrapUser(user));
        });

        this.client.on('messageCreate', (message) => {
            this.emit('messageCreate', this.wrapMessage(message));
        });

        this.client.on('messageUpdate', (message) => {
            this.emit('messageUpdate', null, this.wrapMessage(message));
        });

        this.client.on('messageDelete', (data) => {
            this.emit('messageDelete', data);
        });

        this.client.on('guildCreate', (guild) => {
            this.guilds.set(guild.id, guild);
            this.emit('guildCreate', guild);
        });

        this.client.on('guildDelete', (guild) => {
            this.guilds.delete(guild.id);
            this.emit('guildDelete', guild);
        });

        this.client.on('guildMemberAdd', (member) => {
            this.emit('guildMemberAdd', member);
        });

        this.client.on('guildMemberRemove', (member) => {
            this.emit('guildMemberRemove', member);
        });

        this.client.on('interactionCreate', (interaction) => {
            this.emit('interactionCreate', interaction);
        });

        this.client.on('error', (error) => {
            this.emit('error', error);
        });

        this.client.on('close', (code, reason) => {
            this.ready = false;
            this.emit('close', code, reason);
        });
    }

    // ============================================
    // 生命周期管理
    // ============================================

    /**
     * 启动 Bot (Gateway 模式)
     */
    async start(): Promise<void> {
        try {
            await this.client.start();
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 停止 Bot
     */
    async stop(): Promise<void> {
        this.ready = false;
        this.client.stop();
        this.emit('stopped');
    }

    /**
     * 处理 HTTP 请求 (Interactions 模式)
     */
    async handleRequest(request: Request): Promise<Response> {
        return this.client.handleRequest(request);
    }

    /**
     * 获取 Bot 是否就绪
     */
    isReady(): boolean {
        return this.ready;
    }

    // ============================================
    // 消息相关方法
    // ============================================

    /**
     * 发送消息到频道
     */
    async sendMessage(
        channelId: string,
        content: string | { content?: string; embeds?: any[]; files?: any[] }
    ): Promise<DiscordMessage> {
        const body = typeof content === 'string' ? { content } : content;
        const result = await this.getREST().createMessage(channelId, body);
        return this.wrapMessage(result);
    }

    /**
     * 发送私信
     */
    async sendDM(
        userId: string,
        content: string | { content?: string; embeds?: any[]; files?: any[] }
    ): Promise<DiscordMessage> {
        // 首先创建 DM 频道
        const dmChannel = await this.getREST().request<DiscordChannel>('/users/@me/channels', {
            method: 'POST',
            body: { recipient_id: userId },
        });

        return this.sendMessage(dmChannel.id, content);
    }

    /**
     * 发送 Embed 消息
     */
    async sendEmbed(channelId: string, embeds: any[]): Promise<DiscordMessage> {
        return this.sendMessage(channelId, { embeds });
    }

    /**
     * 发送带附件的消息
     */
    async sendWithAttachments(
        channelId: string,
        content: string,
        _attachments: any[]
    ): Promise<DiscordMessage> {
        // 轻量版暂不支持附件上传，仅发送文本
        return this.sendMessage(channelId, content);
    }

    /**
     * 编辑消息
     */
    async editMessage(channelId: string, messageId: string, content: string): Promise<DiscordMessage> {
        const result = await this.getREST().editMessage(channelId, messageId, content);
        return this.wrapMessage(result);
    }

    /**
     * 删除消息
     */
    async deleteMessage(channelId: string, messageId: string): Promise<void> {
        await this.getREST().deleteMessage(channelId, messageId);
    }

    /**
     * 获取消息
     */
    async getMessage(channelId: string, messageId: string): Promise<DiscordMessage> {
        const result = await this.getREST().getMessage(channelId, messageId);
        return this.wrapMessage(result);
    }

    /**
     * 获取消息历史
     */
    async getMessageHistory(channelId: string, limit: number = 50, before?: string): Promise<Map<string, DiscordMessage>> {
        const query: Record<string, string> = { limit: String(limit) };
        if (before) query.before = before;
        const messages = await this.getREST().getMessages(channelId, query as any);
        const map = new Map<string, DiscordMessage>();
        for (const msg of messages) {
            map.set(msg.id, this.wrapMessage(msg));
        }
        return map;
    }

    /**
     * 添加消息反应
     */
    async addReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
        const encodedEmoji = encodeURIComponent(emoji);
        await this.getREST().request(`/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`, {
            method: 'PUT',
        });
    }

    /**
     * 移除消息反应
     */
    async removeReaction(channelId: string, messageId: string, emoji: string, userId?: string): Promise<void> {
        const encodedEmoji = encodeURIComponent(emoji);
        const target = userId || '@me';
        await this.getREST().request(`/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/${target}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // 用户相关方法
    // ============================================

    /**
     * 获取机器人信息
     */
    getBotUser(): DiscordUser | null {
        return this.user ? this.wrapUser(this.user) : null;
    }

    /**
     * 获取用户信息
     */
    async getUser(userId: string): Promise<DiscordUser> {
        const result = await this.getREST().getUser(userId);
        return this.wrapUser(result);
    }

    /**
     * 获取成员信息
     */
    async getMember(guildId: string, userId: string): Promise<DiscordMember> {
        return this.getREST().getGuildMember(guildId, userId);
    }

    // ============================================
    // 服务器（Guild）相关方法
    // ============================================

    /**
     * 获取服务器列表
     */
    getGuilds(): Map<string, DiscordGuild> {
        return this.guilds;
    }

    /**
     * 获取服务器信息
     */
    async getGuild(guildId: string): Promise<DiscordGuild> {
        const result = await this.getREST().getGuild(guildId);
        this.guilds.set(result.id, result);
        return result;
    }

    /**
     * 获取服务器成员列表
     */
    async getGuildMembers(guildId: string, limit?: number): Promise<Map<string, DiscordMember>> {
        const query: Record<string, string> = {};
        if (limit) query.limit = String(limit);
        const members = await this.getREST().getGuildMembers(guildId, query as any);
        const map = new Map<string, DiscordMember>();
        for (const member of members) {
            map.set(member.user.id, member);
        }
        return map;
    }

    /**
     * 获取服务器成员信息
     */
    async getGuildMember(guildId: string, userId: string): Promise<DiscordMember> {
        return this.getREST().getGuildMember(guildId, userId);
    }

    /**
     * 踢出成员
     */
    async kickMember(guildId: string, userId: string, _reason?: string): Promise<void> {
        await this.getREST().removeGuildMember(guildId, userId);
    }

    /**
     * 封禁成员
     */
    async banMember(
        guildId: string,
        userId: string,
        options?: { reason?: string; deleteMessageSeconds?: number }
    ): Promise<void> {
        await this.getREST().banGuildMember(guildId, userId, {
            delete_message_seconds: options?.deleteMessageSeconds,
        });
    }

    /**
     * 解除封禁
     */
    async unbanMember(guildId: string, userId: string, _reason?: string): Promise<void> {
        await this.getREST().request(`/guilds/${guildId}/bans/${userId}`, {
            method: 'DELETE',
        });
    }

    /**
     * 禁言成员（超时）
     */
    async timeoutMember(guildId: string, userId: string, duration: number, _reason?: string): Promise<DiscordMember> {
        const until = new Date(Date.now() + duration * 1000).toISOString();
        return this.getREST().request(`/guilds/${guildId}/members/${userId}`, {
            method: 'PATCH',
            body: { communication_disabled_until: until },
        });
    }

    /**
     * 解除禁言
     */
    async removeTimeout(guildId: string, userId: string, _reason?: string): Promise<DiscordMember> {
        return this.getREST().request(`/guilds/${guildId}/members/${userId}`, {
            method: 'PATCH',
            body: { communication_disabled_until: null },
        });
    }

    /**
     * 修改成员昵称
     */
    async setMemberNickname(guildId: string, userId: string, nickname: string | null, _reason?: string): Promise<DiscordMember> {
        return this.getREST().request(`/guilds/${guildId}/members/${userId}`, {
            method: 'PATCH',
            body: { nick: nickname },
        });
    }

    /**
     * 添加角色
     */
    async addRole(guildId: string, userId: string, roleId: string, _reason?: string): Promise<DiscordMember> {
        await this.getREST().request(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
            method: 'PUT',
        });
        return this.getGuildMember(guildId, userId);
    }

    /**
     * 移除角色
     */
    async removeRole(guildId: string, userId: string, roleId: string, _reason?: string): Promise<DiscordMember> {
        await this.getREST().request(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
            method: 'DELETE',
        });
        return this.getGuildMember(guildId, userId);
    }

    // ============================================
    // 频道相关方法
    // ============================================

    /**
     * 获取频道
     */
    async getChannel(channelId: string): Promise<DiscordChannel | null> {
        try {
            return await this.getREST().getChannel(channelId);
        } catch {
            return null;
        }
    }

    /**
     * 获取服务器频道列表
     */
    async getGuildChannels(guildId: string): Promise<Map<string, DiscordChannel>> {
        const channels = await this.getREST().request<DiscordChannel[]>(`/guilds/${guildId}/channels`);
        const map = new Map<string, DiscordChannel>();
        for (const channel of channels) {
            map.set(channel.id, channel);
        }
        return map;
    }

    /**
     * 创建文本频道
     */
    async createTextChannel(
        guildId: string,
        name: string,
        options?: { topic?: string; parent?: string; nsfw?: boolean }
    ): Promise<DiscordChannel> {
        return this.getREST().request(`/guilds/${guildId}/channels`, {
            method: 'POST',
            body: {
                name,
                type: 0, // GUILD_TEXT
                topic: options?.topic,
                parent_id: options?.parent,
                nsfw: options?.nsfw,
            },
        });
    }

    /**
     * 删除频道
     */
    async deleteChannel(channelId: string): Promise<void> {
        await this.getREST().request(`/channels/${channelId}`, {
            method: 'DELETE',
        });
    }

    /**
     * 更新频道
     */
    async updateChannel(
        channelId: string,
        options: { name?: string; topic?: string; nsfw?: boolean; parent?: string }
    ): Promise<DiscordChannel> {
        return this.getREST().request(`/channels/${channelId}`, {
            method: 'PATCH',
            body: {
                name: options.name,
                topic: options.topic,
                nsfw: options.nsfw,
                parent_id: options.parent,
            },
        });
    }

    // ============================================
    // 角色相关方法
    // ============================================

    /**
     * 获取服务器角色列表
     */
    async getGuildRoles(guildId: string): Promise<Map<string, any>> {
        const roles = await this.getREST().request<any[]>(`/guilds/${guildId}/roles`);
        const map = new Map<string, any>();
        for (const role of roles) {
            map.set(role.id, role);
        }
        return map;
    }

    /**
     * 获取角色信息
     */
    async getRole(guildId: string, roleId: string): Promise<any | null> {
        const roles = await this.getGuildRoles(guildId);
        return roles.get(roleId) || null;
    }

    /**
     * 创建角色
     */
    async createRole(
        guildId: string,
        options: { name: string; color?: number; hoist?: boolean; mentionable?: boolean; permissions?: bigint }
    ): Promise<any> {
        return this.getREST().request(`/guilds/${guildId}/roles`, {
            method: 'POST',
            body: {
                name: options.name,
                color: options.color,
                hoist: options.hoist,
                mentionable: options.mentionable,
                permissions: options.permissions?.toString(),
            },
        });
    }

    /**
     * 删除角色
     */
    async deleteRole(guildId: string, roleId: string): Promise<void> {
        await this.getREST().request(`/guilds/${guildId}/roles/${roleId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // 工具方法
    // ============================================

    /**
     * 获取 REST 客户端
     */
    getREST(): DiscordREST {
        return this.client.getREST();
    }

    /**
     * 获取原始 Discord Lite 客户端
     */
    getClient(): DiscordLite {
        return this.client;
    }

    /**
     * 获取当前运行模式
     */
    getMode(): 'gateway' | 'interactions' {
        return this.client.getMode();
    }

    /**
     * 包装用户对象（添加辅助方法）
     */
    private wrapUser(user: any): DiscordUser & { displayAvatarURL: () => string; tag?: string } {
        return {
            ...user,
            global_name: user.global_name || user.globalName,
            displayAvatarURL: () => {
                if (user.avatar) {
                    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
                }
                const defaultAvatar = parseInt(user.discriminator || '0') % 5;
                return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
            },
            tag: `${user.username}#${user.discriminator || '0'}`,
        };
    }

    /**
     * 包装消息对象
     */
    private wrapMessage(message: any): DiscordMessage & {
        createdTimestamp: number;
        channel: { id: string; type: number };
        guild?: { id: string; name?: string };
    } {
        return {
            ...message,
            createdTimestamp: new Date(message.timestamp).getTime(),
            channel: { id: message.channel_id, type: message.guild_id ? 0 : 1 },
            guild: message.guild_id ? { id: message.guild_id } : undefined,
            author: this.wrapUser(message.author),
        };
    }
}

