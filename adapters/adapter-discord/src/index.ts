// 导出类型
export type { DiscordConfig, ProxyConfig, GatewayIntentName, PresenceStatus } from './types.js';
export { ChannelType, MessageType, ActivityType } from './types.js';

// 导出适配器
export * from './adapter.js';

// 导出 Bot
export { DiscordBot } from './bot.js';
export type { DiscordUser, DiscordMessage, DiscordGuild, DiscordChannel, DiscordMember, DiscordAttachment } from './bot.js';

// 导出轻量版客户端（用于独立使用或 Serverless）
export * from './lite/index.js';
