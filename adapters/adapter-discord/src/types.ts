/**
 * Discord 适配器类型定义
 */
import type { 
    GatewayIntentBits, 
    Partials,
    PresenceStatusData,
    ActivityType
} from 'discord.js';

/**
 * 代理配置
 */
export interface ProxyConfig {
    /** 代理服务器地址，如 http://127.0.0.1:7890 或 socks5://127.0.0.1:1080 */
    url: string;
    /** 代理用户名（可选） */
    username?: string;
    /** 代理密码（可选） */
    password?: string;
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
    intents?: (keyof typeof GatewayIntentBits)[];
    /** Partials - 可选，用于接收部分消息等 */
    partials?: (keyof typeof Partials)[];
    /** 机器人初始状态 */
    presence?: {
        status?: PresenceStatusData;
        activities?: Array<{
            name: string;
            type?: ActivityType;
            url?: string;
        }>;
    };
}

/**
 * Discord 用户信息
 */
export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    globalName: string | null;
    avatar: string | null;
    bot?: boolean;
    system?: boolean;
    banner?: string | null;
    accentColor?: number | null;
}

/**
 * Discord 服务器（Guild）信息
 */
export interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    ownerId: string;
    memberCount: number;
    description: string | null;
    features: string[];
    banner: string | null;
}

/**
 * Discord 频道信息
 */
export interface DiscordChannel {
    id: string;
    name: string | null;
    type: number;
    guildId: string | null;
    parentId: string | null;
    position?: number;
    topic?: string | null;
    nsfw?: boolean;
}

/**
 * Discord 成员信息
 */
export interface DiscordMember {
    id: string;
    guildId: string;
    nickname: string | null;
    displayName: string;
    joinedAt: Date | null;
    roles: string[];
    premiumSince: Date | null;
    pending: boolean;
    communicationDisabledUntil: Date | null;
}

/**
 * Discord 消息信息
 */
export interface DiscordMessage {
    id: string;
    channelId: string;
    guildId: string | null;
    content: string;
    author: DiscordUser;
    timestamp: Date;
    editedTimestamp: Date | null;
    tts: boolean;
    mentionEveryone: boolean;
    attachments: DiscordAttachment[];
    embeds: DiscordEmbed[];
    reactions?: DiscordReaction[];
    pinned: boolean;
    type: number;
}

/**
 * Discord 附件信息
 */
export interface DiscordAttachment {
    id: string;
    filename: string;
    size: number;
    url: string;
    proxyUrl: string;
    height?: number;
    width?: number;
    contentType?: string;
}

/**
 * Discord Embed 信息
 */
export interface DiscordEmbed {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: {
        text: string;
        iconUrl?: string;
    };
    image?: {
        url: string;
        height?: number;
        width?: number;
    };
    thumbnail?: {
        url: string;
        height?: number;
        width?: number;
    };
    author?: {
        name: string;
        url?: string;
        iconUrl?: string;
    };
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
}

/**
 * Discord 反应信息
 */
export interface DiscordReaction {
    count: number;
    me: boolean;
    emoji: {
        id: string | null;
        name: string | null;
        animated?: boolean;
    };
}

/**
 * Discord 角色信息
 */
export interface DiscordRole {
    id: string;
    name: string;
    color: number;
    hoist: boolean;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
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

/**
 * 消息类型映射
 */
export const MessageTypeMap = {
    DEFAULT: 0,
    RECIPIENT_ADD: 1,
    RECIPIENT_REMOVE: 2,
    CALL: 3,
    CHANNEL_NAME_CHANGE: 4,
    CHANNEL_ICON_CHANGE: 5,
    CHANNEL_PINNED_MESSAGE: 6,
    USER_JOIN: 7,
    GUILD_BOOST: 8,
    GUILD_BOOST_TIER_1: 9,
    GUILD_BOOST_TIER_2: 10,
    GUILD_BOOST_TIER_3: 11,
    CHANNEL_FOLLOW_ADD: 12,
    GUILD_DISCOVERY_DISQUALIFIED: 14,
    GUILD_DISCOVERY_REQUALIFIED: 15,
    GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING: 16,
    GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING: 17,
    THREAD_CREATED: 18,
    REPLY: 19,
    CHAT_INPUT_COMMAND: 20,
    THREAD_STARTER_MESSAGE: 21,
    GUILD_INVITE_REMINDER: 22,
    CONTEXT_MENU_COMMAND: 23,
    AUTO_MODERATION_ACTION: 24,
    ROLE_SUBSCRIPTION_PURCHASE: 25,
    INTERACTION_PREMIUM_UPSELL: 26,
    STAGE_START: 27,
    STAGE_END: 28,
    STAGE_SPEAKER: 29,
    STAGE_TOPIC: 31,
    GUILD_APPLICATION_PREMIUM_SUBSCRIPTION: 32,
} as const;

/**
 * 频道类型映射
 */
export const ChannelTypeMap = {
    GUILD_TEXT: 0,
    DM: 1,
    GUILD_VOICE: 2,
    GROUP_DM: 3,
    GUILD_CATEGORY: 4,
    GUILD_ANNOUNCEMENT: 5,
    ANNOUNCEMENT_THREAD: 10,
    PUBLIC_THREAD: 11,
    PRIVATE_THREAD: 12,
    GUILD_STAGE_VOICE: 13,
    GUILD_DIRECTORY: 14,
    GUILD_FORUM: 15,
    GUILD_MEDIA: 16,
} as const;
