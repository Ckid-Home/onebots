/**
 * 飞书开放平台 API 类型定义
 * 基于飞书开放平台官方 API
 */

// 配置类型
export interface FeishuConfig {
    account_id: string;
    app_id: string;           // 应用 App ID
    app_secret: string;       // 应用 App Secret
    encrypt_key?: string;      // 事件加密密钥（可选）
    verification_token?: string; // 事件验证 Token（可选）
}

// 飞书用户类型
export interface FeishuUser {
    user_id: string;
    union_id?: string;
    open_id: string;
    name: string;
    en_name?: string;
    nickname?: string;
    email?: string;
    avatar_url?: string;
    avatar_thumb?: string;
    avatar_middle?: string;
    avatar_big?: string;
    status?: number;
}

// 飞书群组类型
export interface FeishuChat {
    chat_id: string;
    name?: string;
    description?: string;
    avatar?: string;
    owner_id?: string;
    owner_id_type?: string;
    external?: boolean;
    tenant_key?: string;
}

// 飞书消息类型
export interface FeishuMessage {
    message_id: string;
    root_id?: string;
    parent_id?: string;
    msg_type: string;
    create_time: string;
    update_time?: string;
    deleted?: boolean;
    updated?: boolean;
    chat_id: string;
    sender: {
        id: string;
        id_type: string;
        sender_type: string;
        tenant_key?: string;
    };
    body: {
        content: string;
    };
    mentions?: Array<{
        key: string;
        id: string;
        id_type: string;
        name: string;
        tenant_key?: string;
    }>;
}

// 飞书事件类型
export interface FeishuEvent {
    schema: string;
    header: {
        event_id: string;
        event_type: string;
        create_time: string;
        token?: string;
        app_id: string;
        tenant_key: string;
    };
    event: any;
}

// 访问令牌响应
export interface FeishuTokenResponse {
    code: number;
    msg: string;
    tenant_access_token?: string;
    app_access_token?: string;
    expire: number;
}

// 发送消息请求
export interface FeishuSendMessageRequest {
    receive_id: string;
    receive_id_type: 'open_id' | 'user_id' | 'union_id' | 'email' | 'chat_id';
    msg_type: 'text' | 'post' | 'image' | 'file' | 'audio' | 'media' | 'sticker' | 'interactive' | 'share_chat' | 'share_user';
    content: string | any;
    uuid?: string;
}

// 发送消息响应
export interface FeishuSendMessageResponse {
    code: number;
    msg: string;
    data: {
        message_id: string;
    };
}

