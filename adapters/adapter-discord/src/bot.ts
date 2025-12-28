/**
 * Discord Bot 客户端
 * 使用 discord.js 库实现
 */
import { EventEmitter } from 'events';
import {
    Client,
    GatewayIntentBits,
    Partials,
    TextChannel,
    DMChannel,
    NewsChannel,
    ThreadChannel,
    VoiceChannel,
    Message,
    Guild,
    GuildMember,
    User,
    Channel,
    Role,
    EmbedBuilder,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ChannelType,
    PermissionFlagsBits,
    MessagePayload,
    MessageCreateOptions,
    Collection,
} from 'discord.js';
import type { DiscordConfig } from './types.js';

// 可发送消息的频道类型联合
type SendableChannel = TextChannel | DMChannel | NewsChannel | ThreadChannel | VoiceChannel;

export class DiscordBot extends EventEmitter {
    private client: Client;
    private config: DiscordConfig;
    private ready: boolean = false;

    constructor(config: DiscordConfig) {
        super();
        this.config = config;

        // 解析 intents
        const intents = this.parseIntents(config.intents);
        
        // 解析 partials
        const partials = this.parsePartials(config.partials);

        // 创建 Discord 客户端
        this.client = new Client({
            intents,
            partials,
        });

        this.setupEventListeners();
    }

    /**
     * 解析 intents 配置
     */
    private parseIntents(intentsConfig?: (keyof typeof GatewayIntentBits)[]): number[] {
        if (!intentsConfig || intentsConfig.length === 0) {
            // 默认 intents
            return [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
            ];
        }

        return intentsConfig.map(intent => GatewayIntentBits[intent]);
    }

    /**
     * 解析 partials 配置
     */
    private parsePartials(partialsConfig?: (keyof typeof Partials)[]): Partials[] {
        if (!partialsConfig || partialsConfig.length === 0) {
            // 默认 partials
            return [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.User,
                Partials.GuildMember,
            ];
        }

        return partialsConfig.map(partial => Partials[partial]);
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        // 就绪事件
        this.client.once('ready', (client) => {
            this.ready = true;
            this.emit('ready', client.user);
        });

        // 错误事件
        this.client.on('error', (error) => {
            this.emit('error', error);
        });

        // 消息创建事件
        this.client.on('messageCreate', (message) => {
            this.emit('messageCreate', message);
        });

        // 消息更新事件
        this.client.on('messageUpdate', (oldMessage, newMessage) => {
            this.emit('messageUpdate', oldMessage, newMessage);
        });

        // 消息删除事件
        this.client.on('messageDelete', (message) => {
            this.emit('messageDelete', message);
        });

        // 成员加入事件
        this.client.on('guildMemberAdd', (member) => {
            this.emit('guildMemberAdd', member);
        });

        // 成员离开事件
        this.client.on('guildMemberRemove', (member) => {
            this.emit('guildMemberRemove', member);
        });

        // 成员更新事件
        this.client.on('guildMemberUpdate', (oldMember, newMember) => {
            this.emit('guildMemberUpdate', oldMember, newMember);
        });

        // 服务器加入事件
        this.client.on('guildCreate', (guild) => {
            this.emit('guildCreate', guild);
        });

        // 服务器离开事件
        this.client.on('guildDelete', (guild) => {
            this.emit('guildDelete', guild);
        });

        // 频道创建事件
        this.client.on('channelCreate', (channel) => {
            this.emit('channelCreate', channel);
        });

        // 频道删除事件
        this.client.on('channelDelete', (channel) => {
            this.emit('channelDelete', channel);
        });

        // 频道更新事件
        this.client.on('channelUpdate', (oldChannel, newChannel) => {
            this.emit('channelUpdate', oldChannel, newChannel);
        });

        // 消息反应添加事件
        this.client.on('messageReactionAdd', (reaction, user) => {
            this.emit('messageReactionAdd', reaction, user);
        });

        // 消息反应移除事件
        this.client.on('messageReactionRemove', (reaction, user) => {
            this.emit('messageReactionRemove', reaction, user);
        });

        // 交互事件（斜杠命令、按钮等）
        this.client.on('interactionCreate', (interaction) => {
            this.emit('interactionCreate', interaction);
        });

        // 警告事件
        this.client.on('warn', (warning) => {
            this.emit('warn', warning);
        });

        // 调试事件
        this.client.on('debug', (info) => {
            this.emit('debug', info);
        });
    }

    // ============================================
    // 生命周期管理
    // ============================================

    /**
     * 启动 Bot
     */
    async start(): Promise<void> {
        try {
            await this.client.login(this.config.token);
            
            // 设置在线状态
            if (this.config.presence) {
                this.client.user?.setPresence({
                    status: this.config.presence.status || 'online',
                    activities: this.config.presence.activities,
                });
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
        this.ready = false;
        await this.client.destroy();
        this.emit('stopped');
    }

    /**
     * 获取 Bot 是否就绪
     */
    isReady(): boolean {
        return this.ready && this.client.isReady();
    }

    // ============================================
    // 消息相关方法
    // ============================================

    /**
     * 发送消息到频道
     */
    async sendMessage(
        channelId: string,
        content: string | MessagePayload | MessageCreateOptions
    ): Promise<Message> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!this.isTextBasedChannel(channel)) {
            throw new Error(`频道 ${channelId} 不支持发送消息`);
        }

        return (channel as SendableChannel).send(content);
    }

    /**
     * 发送私信
     */
    async sendDM(userId: string, content: string | MessagePayload | MessageCreateOptions): Promise<Message> {
        const user = await this.client.users.fetch(userId);
        
        if (!user) {
            throw new Error(`用户 ${userId} 不存在`);
        }

        const dmChannel = await user.createDM();
        return dmChannel.send(content);
    }

    /**
     * 发送 Embed 消息
     */
    async sendEmbed(
        channelId: string,
        embed: EmbedBuilder | EmbedBuilder[]
    ): Promise<Message> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!this.isTextBasedChannel(channel)) {
            throw new Error(`频道 ${channelId} 不支持发送消息`);
        }

        const embeds = Array.isArray(embed) ? embed : [embed];
        return (channel as SendableChannel).send({ embeds });
    }

    /**
     * 发送带附件的消息
     */
    async sendWithAttachments(
        channelId: string,
        content: string,
        attachments: AttachmentBuilder[]
    ): Promise<Message> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!this.isTextBasedChannel(channel)) {
            throw new Error(`频道 ${channelId} 不支持发送消息`);
        }

        return (channel as SendableChannel).send({ content, files: attachments });
    }

    /**
     * 编辑消息
     */
    async editMessage(
        channelId: string,
        messageId: string,
        content: string
    ): Promise<Message> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!this.isTextBasedChannel(channel)) {
            throw new Error(`频道 ${channelId} 不支持编辑消息`);
        }

        const message = await (channel as SendableChannel).messages.fetch(messageId);
        return message.edit(content);
    }

    /**
     * 删除消息
     */
    async deleteMessage(channelId: string, messageId: string): Promise<void> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!this.isTextBasedChannel(channel)) {
            throw new Error(`频道 ${channelId} 不支持删除消息`);
        }

        const message = await (channel as SendableChannel).messages.fetch(messageId);
        await message.delete();
    }

    /**
     * 获取消息
     */
    async getMessage(channelId: string, messageId: string): Promise<Message> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!this.isTextBasedChannel(channel)) {
            throw new Error(`频道 ${channelId} 不支持获取消息`);
        }

        return (channel as SendableChannel).messages.fetch(messageId);
    }

    /**
     * 获取消息历史
     */
    async getMessageHistory(
        channelId: string,
        limit: number = 50,
        before?: string
    ): Promise<Collection<string, Message>> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!this.isTextBasedChannel(channel)) {
            throw new Error(`频道 ${channelId} 不支持获取消息历史`);
        }

        return (channel as SendableChannel).messages.fetch({ limit, before });
    }

    /**
     * 添加消息反应
     */
    async addReaction(
        channelId: string,
        messageId: string,
        emoji: string
    ): Promise<void> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!this.isTextBasedChannel(channel)) {
            throw new Error(`频道 ${channelId} 不支持消息反应`);
        }

        const message = await (channel as SendableChannel).messages.fetch(messageId);
        await message.react(emoji);
    }

    /**
     * 移除消息反应
     */
    async removeReaction(
        channelId: string,
        messageId: string,
        emoji: string,
        userId?: string
    ): Promise<void> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!this.isTextBasedChannel(channel)) {
            throw new Error(`频道 ${channelId} 不支持消息反应`);
        }

        const message = await (channel as SendableChannel).messages.fetch(messageId);
        const reaction = message.reactions.cache.get(emoji);
        
        if (reaction) {
            if (userId) {
                await reaction.users.remove(userId);
            } else {
                await reaction.users.remove(this.client.user!.id);
            }
        }
    }

    // ============================================
    // 用户相关方法
    // ============================================

    /**
     * 获取机器人信息
     */
    getBotUser(): User | null {
        return this.client.user;
    }

    /**
     * 获取用户信息
     */
    async getUser(userId: string): Promise<User> {
        return this.client.users.fetch(userId);
    }

    /**
     * 获取成员信息
     */
    async getMember(guildId: string, userId: string): Promise<GuildMember> {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.members.fetch(userId);
    }

    // ============================================
    // 服务器（Guild）相关方法
    // ============================================

    /**
     * 获取服务器列表
     */
    getGuilds(): Collection<string, Guild> {
        return this.client.guilds.cache;
    }

    /**
     * 获取服务器信息
     */
    async getGuild(guildId: string): Promise<Guild> {
        return this.client.guilds.fetch(guildId);
    }

    /**
     * 获取服务器成员列表
     */
    async getGuildMembers(guildId: string, limit?: number): Promise<Collection<string, GuildMember>> {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.members.fetch({ limit });
    }

    /**
     * 获取服务器成员信息
     */
    async getGuildMember(guildId: string, userId: string): Promise<GuildMember> {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.members.fetch(userId);
    }

    /**
     * 踢出成员
     */
    async kickMember(guildId: string, userId: string, reason?: string): Promise<void> {
        const guild = await this.client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        await member.kick(reason);
    }

    /**
     * 封禁成员
     */
    async banMember(
        guildId: string,
        userId: string,
        options?: { reason?: string; deleteMessageSeconds?: number }
    ): Promise<void> {
        const guild = await this.client.guilds.fetch(guildId);
        await guild.members.ban(userId, options);
    }

    /**
     * 解除封禁
     */
    async unbanMember(guildId: string, userId: string, reason?: string): Promise<void> {
        const guild = await this.client.guilds.fetch(guildId);
        await guild.members.unban(userId, reason);
    }

    /**
     * 禁言成员（超时）
     */
    async timeoutMember(
        guildId: string,
        userId: string,
        duration: number,
        reason?: string
    ): Promise<GuildMember> {
        const guild = await this.client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        return member.timeout(duration * 1000, reason);
    }

    /**
     * 解除禁言
     */
    async removeTimeout(guildId: string, userId: string, reason?: string): Promise<GuildMember> {
        const guild = await this.client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        return member.timeout(null, reason);
    }

    /**
     * 修改成员昵称
     */
    async setMemberNickname(
        guildId: string,
        userId: string,
        nickname: string | null,
        reason?: string
    ): Promise<GuildMember> {
        const guild = await this.client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        return member.setNickname(nickname, reason);
    }

    /**
     * 添加角色
     */
    async addRole(
        guildId: string,
        userId: string,
        roleId: string,
        reason?: string
    ): Promise<GuildMember> {
        const guild = await this.client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        return member.roles.add(roleId, reason);
    }

    /**
     * 移除角色
     */
    async removeRole(
        guildId: string,
        userId: string,
        roleId: string,
        reason?: string
    ): Promise<GuildMember> {
        const guild = await this.client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        return member.roles.remove(roleId, reason);
    }

    // ============================================
    // 频道相关方法
    // ============================================

    /**
     * 获取频道
     */
    async getChannel(channelId: string): Promise<Channel | null> {
        return this.client.channels.fetch(channelId);
    }

    /**
     * 获取服务器频道列表
     */
    async getGuildChannels(guildId: string): Promise<Collection<string, import('discord.js').GuildBasedChannel>> {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.channels.fetch();
    }

    /**
     * 创建文本频道
     */
    async createTextChannel(
        guildId: string,
        name: string,
        options?: {
            topic?: string;
            parent?: string;
            nsfw?: boolean;
        }
    ): Promise<TextChannel> {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.channels.create({
            name,
            type: ChannelType.GuildText,
            topic: options?.topic,
            parent: options?.parent,
            nsfw: options?.nsfw,
        });
    }

    /**
     * 删除频道
     */
    async deleteChannel(channelId: string): Promise<void> {
        const channel = await this.client.channels.fetch(channelId);
        if (channel && 'delete' in channel) {
            await channel.delete();
        }
    }

    /**
     * 更新频道
     */
    async updateChannel(
        channelId: string,
        options: {
            name?: string;
            topic?: string;
            nsfw?: boolean;
            parent?: string;
        }
    ): Promise<Channel> {
        const channel = await this.client.channels.fetch(channelId);
        
        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        if (!('edit' in channel)) {
            throw new Error(`频道 ${channelId} 不支持编辑`);
        }

        return (channel as TextChannel).edit(options);
    }

    // ============================================
    // 角色相关方法
    // ============================================

    /**
     * 获取服务器角色列表
     */
    async getGuildRoles(guildId: string): Promise<Collection<string, Role>> {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.roles.fetch();
    }

    /**
     * 获取角色信息
     */
    async getRole(guildId: string, roleId: string): Promise<Role | null> {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.roles.fetch(roleId);
    }

    /**
     * 创建角色
     */
    async createRole(
        guildId: string,
        options: {
            name: string;
            color?: number;
            hoist?: boolean;
            mentionable?: boolean;
            permissions?: bigint;
        }
    ): Promise<Role> {
        const guild = await this.client.guilds.fetch(guildId);
        return guild.roles.create(options);
    }

    /**
     * 删除角色
     */
    async deleteRole(guildId: string, roleId: string): Promise<void> {
        const guild = await this.client.guilds.fetch(guildId);
        const role = await guild.roles.fetch(roleId);
        if (role) {
            await role.delete();
        }
    }

    // ============================================
    // 工具方法
    // ============================================

    /**
     * 检查是否为文本频道
     */
    private isTextBasedChannel(channel: Channel): boolean {
        return channel.type === ChannelType.GuildText ||
               channel.type === ChannelType.DM ||
               channel.type === ChannelType.GuildAnnouncement ||
               channel.type === ChannelType.PublicThread ||
               channel.type === ChannelType.PrivateThread ||
               channel.type === ChannelType.GuildVoice;
    }

    /**
     * 获取原始 Discord 客户端
     */
    getClient(): Client {
        return this.client;
    }
}
