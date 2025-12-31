/**
 * Slack Bot API 类型定义
 * 基于 Slack Web API
 */

// 配置类型
export interface SlackConfig {
    account_id: string;
    token: string;             // Bot Token (xoxb-...)
    signing_secret?: string;    // Signing Secret（用于验证请求）
    app_token?: string;         // App-Level Token（可选，用于 Socket Mode）
    socket_mode?: boolean;      // 是否使用 Socket Mode
}

// Slack 用户类型
export interface SlackUser {
    id: string;
    name: string;
    real_name?: string;
    display_name?: string;
    profile?: {
        image_24?: string;
        image_32?: string;
        image_48?: string;
        image_72?: string;
        image_192?: string;
        image_512?: string;
        email?: string;
    };
    is_bot?: boolean;
    is_admin?: boolean;
    is_owner?: boolean;
}

// Slack 频道类型
export interface SlackChannel {
    id: string;
    name: string;
    is_channel?: boolean;
    is_group?: boolean;
    is_im?: boolean;
    is_private?: boolean;
    is_archived?: boolean;
    is_member?: boolean;
    topic?: {
        value: string;
        creator: string;
        last_set: number;
    };
    purpose?: {
        value: string;
        creator: string;
        last_set: number;
    };
}

// Slack 消息类型
export interface SlackMessage {
    type: string;
    subtype?: string;
    ts: string;
    user?: string;
    text?: string;
    channel: string;
    files?: Array<{
        id: string;
        name: string;
        url_private: string;
        mimetype?: string;
        size?: number;
    }>;
    attachments?: any[];
    blocks?: any[];
    thread_ts?: string;
    reply_count?: number;
    reactions?: Array<{
        name: string;
        users: string[];
        count: number;
    }>;
    [key: string]: any;
}

// Slack 事件类型
export interface SlackEvent {
    type: string;
    event_ts: string;
    user?: string;
    channel?: string;
    text?: string;
    ts?: string;
    [key: string]: any;
}

