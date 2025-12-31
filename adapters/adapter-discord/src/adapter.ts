/**
 * Discord 适配器
 * 继承 Adapter 基类，实现 Discord 平台功能
 */
import { Account, AdapterRegistry, AccountStatus } from "onebots";
import { Adapter } from "onebots";
import { BaseApp } from "onebots";
import { DiscordBot } from "./bot.js";
import { CommonEvent, CommonTypes } from "onebots";
import type { DiscordConfig } from "./types.js";
import {
    Message,
    GuildMember,
    PartialGuildMember,
    Guild,
    Channel,
    MessageReaction,
    PartialMessageReaction,
    User,
    PartialUser,
    ChannelType,
    EmbedBuilder,
    AttachmentBuilder,
} from 'discord.js';

export class DiscordAdapter extends Adapter<DiscordBot, "discord"> {
    constructor(app: BaseApp) {
        super(app, "discord");
        this.icon = "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png";
    }

    // ============================================
    // 消息相关方法
    // ============================================

    /**
     * 发送消息
     * 支持私聊(DM)、群组(Guild)和频道(Channel)消息
     */
    async sendMessage(uin: string, params: Adapter.SendMessageParams): Promise<Adapter.SendMessageResult> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const { scene_id, scene_type, message } = params;

        let messageId: string;
        const channelId = scene_id.string;

        // 构建消息内容
        const { content, embeds, files } = this.buildDiscordMessage(message);

        try {
            let sentMessage: Message;

            if (scene_type === "private") {
                // 私信消息 - scene_id 是用户 ID
                sentMessage = await bot.sendDM(channelId, { content, embeds, files });
            } else if (scene_type === "channel" || scene_type === "group") {
                // 频道消息 - scene_id 是频道 ID
                sentMessage = await bot.sendMessage(channelId, { content, embeds, files });
            } else {
                throw new Error(`不支持的消息类型: ${scene_type}`);
            }

            messageId = sentMessage.id;
        } catch (error: any) {
            this.logger.error(`发送消息失败:`, error);
            throw error;
        }

        return {
            message_id: this.createId(messageId),
        };
    }

    /**
     * 删除/撤回消息
     */
    async deleteMessage(uin: string, params: Adapter.DeleteMessageParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const messageId = params.message_id.string;
        const channelId = params.scene_id?.string;

        if (!channelId) {
            throw new Error('删除消息需要提供 scene_id (频道ID)');
        }

        await bot.deleteMessage(channelId, messageId);
    }

    /**
     * 获取消息
     */
    async getMessage(uin: string, params: Adapter.GetMessageParams): Promise<Adapter.MessageInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const messageId = params.message_id.string;
        const channelId = params.scene_id?.string;

        if (!channelId) {
            throw new Error('获取消息需要提供 scene_id (频道ID)');
        }

        const message = await bot.getMessage(channelId, messageId);

        return this.convertMessageToInfo(message);
    }

    /**
     * 获取历史消息
     */
    async getMessageHistory(uin: string, params: Adapter.GetMessageHistoryParams): Promise<Adapter.MessageInfo[]> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const channelId = params.scene_id.string;
        const limit = params.limit || 50;

        const messages = await bot.getMessageHistory(channelId, limit);

        return messages.map(msg => this.convertMessageToInfo(msg));
    }

    // Note: updateMessage is not implemented as Discord requires a channel ID
    // which is not provided in the standard UpdateMessageParams.
    // The base class will throw "updateMessage not implemented" error.

    // ============================================
    // 用户相关方法
    // ============================================

    /**
     * 获取机器人信息
     */
    async getLoginInfo(uin: string): Promise<Adapter.UserInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const user = bot.getBotUser();

        if (!user) {
            throw new Error('Bot 未就绪');
        }

        return {
            user_id: this.createId(user.id),
            user_name: user.username,
            user_displayname: user.globalName || user.username,
            avatar: user.displayAvatarURL(),
        };
    }

    /**
     * 获取用户信息
     */
    async getUserInfo(uin: string, params: Adapter.GetUserInfoParams): Promise<Adapter.UserInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const userId = params.user_id.string;

        const user = await bot.getUser(userId);

        return {
            user_id: this.createId(user.id),
            user_name: user.username,
            user_displayname: user.globalName || user.username,
            avatar: user.displayAvatarURL(),
        };
    }

    // ============================================
    // 好友相关方法
    // Discord 没有好友系统，返回空列表
    // ============================================

    /**
     * 获取好友列表
     * Discord 没有传统好友系统，返回空列表
     */
    async getFriendList(uin: string, params?: Adapter.GetFriendListParams): Promise<Adapter.FriendInfo[]> {
        return [];
    }

    /**
     * 获取好友信息
     * Discord 没有传统好友系统，返回用户信息
     */
    async getFriendInfo(uin: string, params: Adapter.GetFriendInfoParams): Promise<Adapter.FriendInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const userId = params.user_id.string;

        const user = await bot.getUser(userId);

        return {
            user_id: this.createId(user.id),
            user_name: user.username,
        };
    }

    // ============================================
    // 群组（服务器/Guild）相关方法
    // ============================================

    /**
     * 获取群列表（服务器列表）
     */
    async getGroupList(uin: string, params?: Adapter.GetGroupListParams): Promise<Adapter.GroupInfo[]> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guilds = bot.getGuilds();

        return guilds.map(guild => ({
            group_id: this.createId(guild.id),
            group_name: guild.name,
            member_count: guild.memberCount,
            max_member_count: guild.maximumMembers,
        }));
    }

    /**
     * 获取群信息（服务器信息）
     */
    async getGroupInfo(uin: string, params: Adapter.GetGroupInfoParams): Promise<Adapter.GroupInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.group_id.string;

        const guild = await bot.getGuild(guildId);

        return {
            group_id: this.createId(guild.id),
            group_name: guild.name,
            member_count: guild.memberCount,
            max_member_count: guild.maximumMembers,
        };
    }

    /**
     * 退出群组（服务器）
     */
    async leaveGroup(uin: string, params: Adapter.LeaveGroupParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.group_id.string;

        const guild = await bot.getGuild(guildId);
        await guild.leave();
    }

    /**
     * 获取群成员列表
     */
    async getGroupMemberList(uin: string, params: Adapter.GetGroupMemberListParams): Promise<Adapter.GroupMemberInfo[]> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.group_id.string;

        const members = await bot.getGuildMembers(guildId);

        return members.map(member => ({
            group_id: params.group_id,
            user_id: this.createId(member.id),
            user_name: member.user.username,
            card: member.nickname || undefined,
            role: this.getMemberRole(member),
        }));
    }

    /**
     * 获取群成员信息
     */
    async getGroupMemberInfo(uin: string, params: Adapter.GetGroupMemberInfoParams): Promise<Adapter.GroupMemberInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.group_id.string;
        const userId = params.user_id.string;

        const member = await bot.getGuildMember(guildId, userId);

        return {
            group_id: params.group_id,
            user_id: this.createId(member.id),
            user_name: member.user.username,
            card: member.nickname || undefined,
            role: this.getMemberRole(member),
        };
    }

    /**
     * 踢出群成员
     */
    async kickGroupMember(uin: string, params: Adapter.KickGroupMemberParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.group_id.string;
        const userId = params.user_id.string;

        await bot.kickMember(guildId, userId, 'Kicked via onebots');
    }

    /**
     * 群成员禁言（超时）
     */
    async muteGroupMember(uin: string, params: Adapter.MuteGroupMemberParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.group_id.string;
        const userId = params.user_id.string;
        const duration = params.duration;

        if (duration === 0) {
            // 解除禁言
            await bot.removeTimeout(guildId, userId);
        } else {
            // 设置超时
            await bot.timeoutMember(guildId, userId, duration);
        }
    }

    /**
     * 设置群名片（昵称）
     */
    async setGroupCard(uin: string, params: Adapter.SetGroupCardParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.group_id.string;
        const userId = params.user_id.string;

        await bot.setMemberNickname(guildId, userId, params.card || null);
    }

    /**
     * 发送群消息表情回应
     */
    async sendGroupMessageReaction(uin: string, params: Adapter.SendGroupMessageReactionParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        // 需要频道 ID，这里通过 group_id 获取（假设是频道 ID）
        const bot = account.client;
        const channelId = params.group_id.string;
        const messageId = params.message_id.string;
        
        // Discord 使用 Unicode emoji 或自定义 emoji 格式
        const emoji = String.fromCodePoint(params.face_id);
        
        await bot.addReaction(channelId, messageId, emoji);
    }

    // ============================================
    // 频道相关方法
    // ============================================

    /**
     * 获取频道服务器信息
     */
    async getGuildInfo(uin: string, params: Adapter.GetGuildInfoParams): Promise<Adapter.GuildInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.guild_id.string;

        const guild = await bot.getGuild(guildId);

        return {
            guild_id: this.createId(guild.id),
            guild_name: guild.name,
            guild_display_name: guild.name,
        };
    }

    /**
     * 获取频道服务器列表
     */
    async getGuildList(uin: string): Promise<Adapter.GuildInfo[]> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guilds = bot.getGuilds();

        return guilds.map(guild => ({
            guild_id: this.createId(guild.id),
            guild_name: guild.name,
            guild_display_name: guild.name,
        }));
    }

    /**
     * 获取频道成员信息
     */
    async getGuildMemberInfo(uin: string, params: Adapter.GetGuildMemberInfoParams): Promise<Adapter.GuildMemberInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.guild_id.string;
        const userId = params.user_id.string;

        const member = await bot.getGuildMember(guildId, userId);

        return {
            guild_id: params.guild_id,
            user_id: this.createId(member.id),
            user_name: member.user.username,
            nickname: member.nickname || undefined,
            role: this.getMemberRole(member),
        };
    }

    /**
     * 获取频道信息
     */
    async getChannelInfo(uin: string, params: Adapter.GetChannelInfoParams): Promise<Adapter.ChannelInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const channelId = params.channel_id.string;

        const channel = await bot.getChannel(channelId);

        if (!channel) {
            throw new Error(`频道 ${channelId} 不存在`);
        }

        return {
            channel_id: this.createId(channel.id),
            channel_name: 'name' in channel ? channel.name || '' : '',
            channel_type: channel.type,
            parent_id: 'parentId' in channel && channel.parentId ? this.createId(channel.parentId) : undefined,
        };
    }

    /**
     * 获取频道列表
     */
    async getChannelList(uin: string, params?: Adapter.GetChannelListParams): Promise<Adapter.ChannelInfo[]> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        if (!params?.guild_id) {
            throw new Error('获取频道列表需要提供 guild_id');
        }

        const bot = account.client;
        const guildId = params.guild_id.string;

        const channels = await bot.getGuildChannels(guildId);

        return [...channels.values()]
            .filter(channel => channel !== null)
            .map(channel => ({
                channel_id: this.createId(channel!.id),
                channel_name: channel!.name,
                channel_type: channel!.type,
                parent_id: channel!.parentId ? this.createId(channel!.parentId) : undefined,
            }));
    }

    /**
     * 创建频道
     */
    async createChannel(uin: string, params: Adapter.CreateChannelParams): Promise<Adapter.ChannelInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const guildId = params.guild_id.string;

        const channel = await bot.createTextChannel(guildId, params.channel_name, {
            parent: params.parent_id?.string,
        });

        return {
            channel_id: this.createId(channel.id),
            channel_name: channel.name,
            channel_type: channel.type,
            parent_id: channel.parentId ? this.createId(channel.parentId) : undefined,
        };
    }

    /**
     * 删除频道
     */
    async deleteChannel(uin: string, params: Adapter.DeleteChannelParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const channelId = params.channel_id.string;

        await bot.deleteChannel(channelId);
    }

    /**
     * 更新频道
     */
    async updateChannel(uin: string, params: Adapter.UpdateChannelParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const channelId = params.channel_id.string;

        await bot.updateChannel(channelId, {
            name: params.channel_name,
            parent: params.parent_id?.string,
        });
    }

    // ============================================
    // 频道成员相关方法
    // ============================================

    /**
     * 获取频道成员信息
     */
    async getChannelMemberInfo(uin: string, params: Adapter.GetChannelMemberInfoParams): Promise<Adapter.ChannelMemberInfo> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const channelId = params.channel_id.string;
        const userId = params.user_id.string;

        // 获取频道所属的服务器
        const channel = await bot.getChannel(channelId);
        if (!channel || !('guildId' in channel) || !channel.guildId) {
            throw new Error(`频道 ${channelId} 不属于任何服务器`);
        }

        const member = await bot.getGuildMember(channel.guildId, userId);

        return {
            channel_id: params.channel_id,
            user_id: this.createId(member.id),
            user_name: member.user.username,
            role: this.getMemberRole(member),
        };
    }

    /**
     * 获取频道成员列表
     */
    async getChannelMemberList(uin: string, params: Adapter.GetChannelMemberListParams): Promise<Adapter.ChannelMemberInfo[]> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const channelId = params.channel_id.string;

        // 获取频道所属的服务器
        const channel = await bot.getChannel(channelId);
        if (!channel || !('guildId' in channel) || !channel.guildId) {
            throw new Error(`频道 ${channelId} 不属于任何服务器`);
        }

        const members = await bot.getGuildMembers(channel.guildId);

        return members.map(member => ({
            channel_id: params.channel_id,
            user_id: this.createId(member.id),
            user_name: member.user.username,
            role: this.getMemberRole(member),
        }));
    }

    /**
     * 踢出频道成员
     */
    async kickChannelMember(uin: string, params: Adapter.KickChannelMemberParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const channelId = params.channel_id.string;
        const userId = params.user_id.string;

        // 获取频道所属的服务器
        const channel = await bot.getChannel(channelId);
        if (!channel || !('guildId' in channel) || !channel.guildId) {
            throw new Error(`频道 ${channelId} 不属于任何服务器`);
        }

        await bot.kickMember(channel.guildId, userId);
    }

    /**
     * 设置频道成员禁言
     */
    async setChannelMemberMute(uin: string, params: Adapter.SetChannelMemberMuteParams): Promise<void> {
        const account = this.getAccount(uin);
        if (!account) throw new Error(`Account ${uin} not found`);

        const bot = account.client;
        const channelId = params.channel_id.string;
        const userId = params.user_id.string;

        // 获取频道所属的服务器
        const channel = await bot.getChannel(channelId);
        if (!channel || !('guildId' in channel) || !channel.guildId) {
            throw new Error(`频道 ${channelId} 不属于任何服务器`);
        }

        if (params.mute) {
            // Discord 超时最长 28 天
            await bot.timeoutMember(channel.guildId, userId, 28 * 24 * 60 * 60);
        } else {
            await bot.removeTimeout(channel.guildId, userId);
        }
    }

    // ============================================
    // 媒体资源相关方法
    // ============================================

    /**
     * 检查是否可以发送图片
     */
    async canSendImage(uin: string): Promise<boolean> {
        return true; // Discord 支持图片发送
    }

    /**
     * 检查是否可以发送语音
     */
    async canSendRecord(uin: string): Promise<boolean> {
        return true; // Discord 支持音频文件发送
    }

    // ============================================
    // 系统相关方法
    // ============================================

    /**
     * 获取版本信息
     */
    async getVersion(uin: string): Promise<Adapter.VersionInfo> {
        return {
            app_name: 'onebots-discord',
            app_version: '1.0.0',
            impl: 'discord.js',
            version: '14.x',
        };
    }

    /**
     * 获取运行状态
     */
    async getStatus(uin: string): Promise<Adapter.StatusInfo> {
        const account = this.getAccount(uin);
        if (!account) {
            return { good: false };
        }

        const bot = account.client;
        return {
            online: bot.isReady(),
            good: bot.isReady(),
        };
    }

    // ============================================
    // 账号创建
    // ============================================

    createAccount(config: Account.Config<'discord'>): Account<'discord', DiscordBot> {
        const discordConfig: DiscordConfig = {
            account_id: config.account_id,
            token: config.token,
            intents: config.intents,
            partials: config.partials,
            presence: config.presence,
        };

        const bot = new DiscordBot(discordConfig);
        const account = new Account<'discord', DiscordBot>(this, bot, config);

        // 监听 Bot 事件
        bot.on('ready', (user) => {
            this.logger.info(`Discord Bot ${user.tag} 已就绪`);
            account.status = AccountStatus.Online;
            account.nickname = user.username;
            account.avatar = user.displayAvatarURL();
        });

        bot.on('error', (error) => {
            this.logger.error(`Discord Bot 错误:`, error);
        });

        bot.on('warn', (warning) => {
            this.logger.warn(`Discord Bot 警告:`, warning);
        });

        // 监听消息事件
        bot.on('messageCreate', (message: Message) => {
            // 忽略机器人自己的消息
            if (message.author.bot) return;

            // 打印消息接收日志
            const content = message.content || '';
            const contentPreview = content.length > 100 ? content.substring(0, 100) + '...' : content;
            const channelType = message.channel.type === 1 ? '私聊' : message.channel.type === 0 ? '频道' : '群组';
            this.logger.info(
                `[DISCORD] 收到${channelType}消息 | 消息ID: ${message.id} | 频道: ${message.channel.id} | ` +
                `发送者: ${message.author.username}(${message.author.id}) | 内容: ${contentPreview}`
            );

            // 构建消息段
            const messageSegments: CommonTypes.Segment[] = [];

            // 文本内容
            if (message.content) {
                messageSegments.push({
                    type: 'text',
                    data: { text: message.content }
                });
            }

            // 附件（图片、文件等）
            for (const attachment of message.attachments.values()) {
                if (attachment.contentType?.startsWith('image/')) {
                    messageSegments.push({
                        type: 'image',
                        data: {
                            file: attachment.id,
                            url: attachment.url,
                            filename: attachment.name,
                        }
                    });
                } else if (attachment.contentType?.startsWith('audio/')) {
                    messageSegments.push({
                        type: 'voice',
                        data: {
                            file: attachment.id,
                            url: attachment.url,
                            filename: attachment.name,
                        }
                    });
                } else if (attachment.contentType?.startsWith('video/')) {
                    messageSegments.push({
                        type: 'video',
                        data: {
                            file: attachment.id,
                            url: attachment.url,
                            filename: attachment.name,
                        }
                    });
                } else {
                    messageSegments.push({
                        type: 'file',
                        data: {
                            file: attachment.id,
                            url: attachment.url,
                            filename: attachment.name,
                        }
                    });
                }
            }

            // @提及
            for (const mention of message.mentions.users.values()) {
                messageSegments.push({
                    type: 'at',
                    data: {
                        qq: mention.id,
                        name: mention.username,
                    }
                });
            }

            // 确定消息类型
            let messageType: CommonEvent.MessageScene;
            let group: CommonTypes.Group | undefined;

            if (message.channel.type === ChannelType.DM) {
                messageType = 'private';
            } else if (message.channel.type === ChannelType.GroupDM) {
                messageType = 'group';
            } else {
                messageType = 'channel';
                if (message.guild) {
                    group = {
                        id: this.createId(message.guild.id),
                        name: message.guild.name,
                    };
                }
            }

            // 转换为 CommonEvent 格式
            const commonEvent: CommonEvent.Message = {
                id: this.createId(message.id),
                timestamp: message.createdTimestamp,
                platform: 'discord',
                bot_id: this.createId(config.account_id),
                type: 'message',
                message_type: messageType,
                sender: {
                    id: this.createId(message.author.id),
                    name: message.author.username,
                    avatar: message.author.displayAvatarURL(),
                },
                group,
                message_id: this.createId(message.id),
                raw_message: message.content,
                message: messageSegments,
            };

            // 派发到协议层
            account.dispatch(commonEvent);
        });

        // 监听成员加入事件
        bot.on('guildMemberAdd', (member: GuildMember) => {
            this.logger.info(`成员加入: ${member.user.username} -> ${member.guild.name}`);

            const commonEvent: CommonEvent.Notice = {
                id: this.createId(Date.now().toString()),
                timestamp: Date.now(),
                platform: 'discord',
                bot_id: this.createId(config.account_id),
                type: 'notice',
                notice_type: 'group_increase',
                user: {
                    id: this.createId(member.id),
                    name: member.user.username,
                    avatar: member.user.displayAvatarURL(),
                },
                group: {
                    id: this.createId(member.guild.id),
                    name: member.guild.name,
                },
            };

            account.dispatch(commonEvent);
        });

        // 监听成员离开事件
        bot.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) => {
            this.logger.info(`成员离开: ${member.user?.username} <- ${member.guild.name}`);

            const commonEvent: CommonEvent.Notice = {
                id: this.createId(Date.now().toString()),
                timestamp: Date.now(),
                platform: 'discord',
                bot_id: this.createId(config.account_id),
                type: 'notice',
                notice_type: 'group_decrease',
                user: {
                    id: this.createId(member.id),
                    name: member.user?.username || 'Unknown',
                    avatar: member.user?.displayAvatarURL(),
                },
                group: {
                    id: this.createId(member.guild.id),
                    name: member.guild.name,
                },
            };

            account.dispatch(commonEvent);
        });

        // 监听消息反应添加事件
        bot.on('messageReactionAdd', async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
            this.logger.debug(`消息反应添加: ${reaction.emoji.name} by ${user.username}`);

            // 获取完整消息
            if (reaction.partial) {
                try {
                    await reaction.fetch();
                } catch (error) {
                    this.logger.error('无法获取完整反应信息:', error);
                    return;
                }
            }

            const commonEvent: CommonEvent.Notice = {
                id: this.createId(Date.now().toString()),
                timestamp: Date.now(),
                platform: 'discord',
                bot_id: this.createId(config.account_id),
                type: 'notice',
                notice_type: 'custom',
                sub_type: 'reaction_add',
                user: {
                    id: this.createId(user.id),
                    name: user.username || 'Unknown',
                },
                message_id: this.createId(reaction.message.id),
                emoji: reaction.emoji.name || reaction.emoji.id,
            };

            account.dispatch(commonEvent);
        });

        // 监听消息反应移除事件
        bot.on('messageReactionRemove', async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
            this.logger.debug(`消息反应移除: ${reaction.emoji.name} by ${user.username}`);

            const commonEvent: CommonEvent.Notice = {
                id: this.createId(Date.now().toString()),
                timestamp: Date.now(),
                platform: 'discord',
                bot_id: this.createId(config.account_id),
                type: 'notice',
                notice_type: 'custom',
                sub_type: 'reaction_remove',
                user: {
                    id: this.createId(user.id),
                    name: user.username || 'Unknown',
                },
                message_id: this.createId(reaction.message.id),
                emoji: reaction.emoji.name || reaction.emoji.id,
            };

            account.dispatch(commonEvent);
        });

        // 启动时初始化 Bot
        account.on('start', async () => {
            try {
                await bot.start();
            } catch (error) {
                this.logger.error(`启动 Discord Bot 失败:`, error);
                account.status = AccountStatus.OffLine;
            }
        });

        account.on('stop', async () => {
            await bot.stop();
            account.status = AccountStatus.OffLine;
        });

        return account;
    }

    // ============================================
    // 辅助方法
    // ============================================

    /**
     * 构建 Discord 消息内容
     */
    private buildDiscordMessage(message: CommonTypes.Segment[]): {
        content: string;
        embeds: EmbedBuilder[];
        files: AttachmentBuilder[];
    } {
        let content = '';
        const embeds: EmbedBuilder[] = [];
        const files: AttachmentBuilder[] = [];

        for (const seg of message) {
            switch (seg.type) {
                case 'text':
                    content += seg.data.text || '';
                    break;

                case 'at':
                    if (seg.data.qq === 'all') {
                        content += '@everyone';
                    } else {
                        content += `<@${seg.data.qq}>`;
                    }
                    break;

                case 'image':
                    if (seg.data.url) {
                        files.push(new AttachmentBuilder(seg.data.url, {
                            name: seg.data.filename || 'image.png'
                        }));
                    } else if (seg.data.file) {
                        // 假设 file 是本地路径或 base64
                        files.push(new AttachmentBuilder(seg.data.file, {
                            name: seg.data.filename || 'image.png'
                        }));
                    }
                    break;

                case 'voice':
                case 'record':
                    if (seg.data.url) {
                        files.push(new AttachmentBuilder(seg.data.url, {
                            name: seg.data.filename || 'audio.mp3'
                        }));
                    } else if (seg.data.file) {
                        files.push(new AttachmentBuilder(seg.data.file, {
                            name: seg.data.filename || 'audio.mp3'
                        }));
                    }
                    break;

                case 'video':
                    if (seg.data.url) {
                        files.push(new AttachmentBuilder(seg.data.url, {
                            name: seg.data.filename || 'video.mp4'
                        }));
                    } else if (seg.data.file) {
                        files.push(new AttachmentBuilder(seg.data.file, {
                            name: seg.data.filename || 'video.mp4'
                        }));
                    }
                    break;

                case 'file':
                    if (seg.data.url) {
                        files.push(new AttachmentBuilder(seg.data.url, {
                            name: seg.data.filename || 'file'
                        }));
                    } else if (seg.data.file) {
                        files.push(new AttachmentBuilder(seg.data.file, {
                            name: seg.data.filename || 'file'
                        }));
                    }
                    break;

                case 'share':
                    // 使用 Embed 展示分享链接
                    const shareEmbed = new EmbedBuilder()
                        .setTitle(seg.data.title || '分享链接')
                        .setURL(seg.data.url)
                        .setDescription(seg.data.content || '');
                    
                    if (seg.data.image) {
                        shareEmbed.setImage(seg.data.image);
                    }
                    
                    embeds.push(shareEmbed);
                    break;

                case 'face':
                    // Discord 使用 Unicode emoji
                    if (seg.data.id) {
                        try {
                            content += String.fromCodePoint(parseInt(seg.data.id));
                        } catch {
                            content += `[表情:${seg.data.id}]`;
                        }
                    }
                    break;

                default:
                    // 未知类型，转为文本
                    if (seg.data.text) {
                        content += seg.data.text;
                    }
            }
        }

        return { content, embeds, files };
    }

    /**
     * 转换消息为 MessageInfo
     */
    private convertMessageToInfo(message: Message): Adapter.MessageInfo {
        const segments: CommonTypes.Segment[] = [];

        if (message.content) {
            segments.push({
                type: 'text',
                data: { text: message.content }
            });
        }

        for (const attachment of message.attachments.values()) {
            if (attachment.contentType?.startsWith('image/')) {
                segments.push({
                    type: 'image',
                    data: { file: attachment.id, url: attachment.url }
                });
            } else {
                segments.push({
                    type: 'file',
                    data: { file: attachment.id, url: attachment.url }
                });
            }
        }

        // 确定场景类型
        let sceneType: CommonTypes.Scene;
        if (message.channel.type === ChannelType.DM) {
            sceneType = 'private';
        } else {
            sceneType = 'channel';
        }

        return {
            message_id: this.createId(message.id),
            time: Math.floor(message.createdTimestamp / 1000),
            sender: {
                scene_type: sceneType,
                sender_id: this.createId(message.author.id),
                scene_id: this.createId(message.channelId),
                sender_name: message.author.username,
                scene_name: 'name' in message.channel ? message.channel.name || '' : 'DM',
            },
            message: segments,
        };
    }

    /**
     * 获取成员角色
     */
    private getMemberRole(member: GuildMember): 'owner' | 'admin' | 'member' {
        if (member.guild.ownerId === member.id) {
            return 'owner';
        }
        if (member.permissions.has('Administrator')) {
            return 'admin';
        }
        return 'member';
    }
}

declare module "onebots" {
    export namespace Adapter {
        export interface Configs {
            discord: DiscordConfig;
        }
    }
}

AdapterRegistry.register('discord', DiscordAdapter,{
    name: 'discord',
    displayName: 'Discord官方机器人',
    description: 'Discord官方机器人适配器，支持频道、群聊和私聊',
    icon: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
    homepage: 'https://discord.com/',
    author: '凉菜',
});

declare module '@/adapter.js' {
    namespace Adapter {
        interface Configs {
            discord: DiscordConfig;
        }
    }
}
