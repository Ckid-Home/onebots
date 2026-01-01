/**
 * Discord 适配器类型定义
 * 轻量版 - 不依赖 discord.js
 */

/**
 * 代理配置
 */
export interface ProxyConfig {
    /** 代理服务器地址，如 http://127.0.0.1:7890 */
    url: string;
    /** 代理用户名（可选） */
    username?: string;
    /** 代理密码（可选） */
    password?: string;
}

/**
 * Gateway Intents 名称
 */
export type GatewayIntentName = 
    | 'Guilds'
    | 'GuildMembers'
    | 'GuildModeration'
    | 'GuildEmojisAndStickers'
    | 'GuildIntegrations'
    | 'GuildWebhooks'
    | 'GuildInvites'
    | 'GuildVoiceStates'
    | 'GuildPresences'
    | 'GuildMessages'
    | 'GuildMessageReactions'
    | 'GuildMessageTyping'
    | 'DirectMessages'
    | 'DirectMessageReactions'
    | 'DirectMessageTyping'
    | 'MessageContent'
    | 'GuildScheduledEvents'
    | 'AutoModerationConfiguration'
    | 'AutoModerationExecution';

/**
 * 在线状态
 */
export type PresenceStatus = 'online' | 'idle' | 'dnd' | 'invisible';

/**
 * 活动类型
 */
export enum ActivityType {
    Playing = 0,
    Streaming = 1,
    Listening = 2,
    Watching = 3,
    Custom = 4,
    Competing = 5,
}

/**
 * Discord 配置类型
 */
export interface DiscordConfig {
    /** 账号标识 */
    account_id: string;
    /** Discord Bot Token */
    token: string;
    /** 代理配置（用于访问 Discord API） */
    proxy?: ProxyConfig;
    /** Gateway Intents - 可选，默认包含常用intents */
    intents?: GatewayIntentName[];
    /** 机器人初始状态 */
    presence?: {
        status?: PresenceStatus;
        activities?: Array<{
            name: string;
            type?: ActivityType;
            url?: string;
        }>;
    };
}

/**
 * 频道类型
 */
export enum ChannelType {
    GuildText = 0,
    DM = 1,
    GuildVoice = 2,
    GroupDM = 3,
    GuildCategory = 4,
    GuildAnnouncement = 5,
    AnnouncementThread = 10,
    PublicThread = 11,
    PrivateThread = 12,
    GuildStageVoice = 13,
    GuildDirectory = 14,
    GuildForum = 15,
    GuildMedia = 16,
}

/**
 * 消息类型
 */
export enum MessageType {
    Default = 0,
    RecipientAdd = 1,
    RecipientRemove = 2,
    Call = 3,
    ChannelNameChange = 4,
    ChannelIconChange = 5,
    ChannelPinnedMessage = 6,
    UserJoin = 7,
    GuildBoost = 8,
    GuildBoostTier1 = 9,
    GuildBoostTier2 = 10,
    GuildBoostTier3 = 11,
    ChannelFollowAdd = 12,
    GuildDiscoveryDisqualified = 14,
    GuildDiscoveryRequalified = 15,
    ThreadCreated = 18,
    Reply = 19,
    ChatInputCommand = 20,
    ThreadStarterMessage = 21,
    GuildInviteReminder = 22,
    ContextMenuCommand = 23,
    AutoModerationAction = 24,
}

/**
 * Discord 事件类型
 */
export type DiscordEventType = 
    | 'ready'
    | 'messageCreate'
    | 'messageUpdate'
    | 'messageDelete'
    | 'guildMemberAdd'
    | 'guildMemberRemove'
    | 'guildMemberUpdate'
    | 'guildCreate'
    | 'guildDelete'
    | 'channelCreate'
    | 'channelDelete'
    | 'channelUpdate'
    | 'messageReactionAdd'
    | 'messageReactionRemove'
    | 'interactionCreate'
    | 'error';
