/**
 * Discord Interactions Webhook 处理器
 * 用于 Cloudflare Workers / Vercel 等 Serverless 环境
 */

import { DiscordREST } from './rest.js';

// Interaction Types
export enum InteractionType {
    Ping = 1,
    ApplicationCommand = 2,
    MessageComponent = 3,
    ApplicationCommandAutocomplete = 4,
    ModalSubmit = 5,
}

// Interaction Callback Types
export enum InteractionCallbackType {
    Pong = 1,
    ChannelMessageWithSource = 4,
    DeferredChannelMessageWithSource = 5,
    DeferredUpdateMessage = 6,
    UpdateMessage = 7,
    ApplicationCommandAutocompleteResult = 8,
    Modal = 9,
    PremiumRequired = 10,
}

export interface InteractionWebhookOptions {
    publicKey: string;
    token: string;
    applicationId: string;
}

/**
 * 验证 Discord Interaction 请求签名
 * 使用 Web Crypto API，兼容所有运行时
 */
export async function verifyInteractionSignature(
    publicKey: string,
    signature: string,
    timestamp: string,
    body: string
): Promise<boolean> {
    try {
        // 将 hex 字符串转换为 Uint8Array
        const hexToUint8Array = (hex: string) => {
            const matches = hex.match(/.{1,2}/g);
            return new Uint8Array(matches ? matches.map(byte => parseInt(byte, 16)) : []);
        };

        const publicKeyBytes = hexToUint8Array(publicKey);
        const signatureBytes = hexToUint8Array(signature);
        const messageBytes = new TextEncoder().encode(timestamp + body);

        // 使用 Web Crypto API（兼容 Node.js 和 Cloudflare Workers）
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            publicKeyBytes,
            { name: 'Ed25519', namedCurve: 'Ed25519' },
            false,
            ['verify']
        );

        return await crypto.subtle.verify(
            'Ed25519',
            cryptoKey,
            signatureBytes,
            messageBytes
        );
    } catch (error) {
        console.error('签名验证失败:', error);
        return false;
    }
}

/**
 * Discord Interactions Webhook 处理器
 */
export class InteractionsHandler {
    private publicKey: string;
    private token: string;
    private applicationId: string;
    private rest: DiscordREST;
    private handlers: Map<string, (interaction: any) => Promise<any>> = new Map();

    constructor(options: InteractionWebhookOptions) {
        this.publicKey = options.publicKey;
        this.token = options.token;
        this.applicationId = options.applicationId;
        this.rest = new DiscordREST({ token: options.token });
    }

    /**
     * 注册命令处理器
     */
    onCommand(name: string, handler: (interaction: any) => Promise<any>) {
        this.handlers.set(`command:${name}`, handler);
    }

    /**
     * 注册消息组件处理器
     */
    onComponent(customId: string, handler: (interaction: any) => Promise<any>) {
        this.handlers.set(`component:${customId}`, handler);
    }

    /**
     * 注册模态框提交处理器
     */
    onModalSubmit(customId: string, handler: (interaction: any) => Promise<any>) {
        this.handlers.set(`modal:${customId}`, handler);
    }

    /**
     * 处理 HTTP 请求
     * 适用于 Cloudflare Workers / Vercel Edge Functions
     */
    async handleRequest(request: Request): Promise<Response> {
        // 验证签名
        const signature = request.headers.get('x-signature-ed25519');
        const timestamp = request.headers.get('x-signature-timestamp');
        const body = await request.text();

        if (!signature || !timestamp) {
            return new Response('Missing signature', { status: 401 });
        }

        const isValid = await verifyInteractionSignature(
            this.publicKey,
            signature,
            timestamp,
            body
        );

        if (!isValid) {
            return new Response('Invalid signature', { status: 401 });
        }

        // 解析并处理 Interaction
        const interaction = JSON.parse(body);
        const response = await this.handleInteraction(interaction);

        return new Response(JSON.stringify(response), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    /**
     * 处理 Interaction
     */
    async handleInteraction(interaction: any): Promise<any> {
        const { type, data } = interaction;

        // Ping/Pong 健康检查
        if (type === InteractionType.Ping) {
            return { type: InteractionCallbackType.Pong };
        }

        // 应用命令
        if (type === InteractionType.ApplicationCommand) {
            const handler = this.handlers.get(`command:${data.name}`);
            if (handler) {
                return handler(interaction);
            }
            return this.defaultResponse('命令未找到');
        }

        // 消息组件
        if (type === InteractionType.MessageComponent) {
            // 尝试精确匹配
            let handler = this.handlers.get(`component:${data.custom_id}`);
            
            // 尝试前缀匹配
            if (!handler) {
                for (const [key, h] of this.handlers) {
                    if (key.startsWith('component:') && data.custom_id.startsWith(key.slice(10))) {
                        handler = h;
                        break;
                    }
                }
            }

            if (handler) {
                return handler(interaction);
            }
            return this.defaultResponse('组件处理器未找到');
        }

        // 模态框提交
        if (type === InteractionType.ModalSubmit) {
            const handler = this.handlers.get(`modal:${data.custom_id}`);
            if (handler) {
                return handler(interaction);
            }
            return this.defaultResponse('模态框处理器未找到');
        }

        // 自动补全
        if (type === InteractionType.ApplicationCommandAutocomplete) {
            const handler = this.handlers.get(`autocomplete:${data.name}`);
            if (handler) {
                return handler(interaction);
            }
            return {
                type: InteractionCallbackType.ApplicationCommandAutocompleteResult,
                data: { choices: [] },
            };
        }

        return this.defaultResponse('未知的 Interaction 类型');
    }

    /**
     * 默认响应
     */
    private defaultResponse(message: string) {
        return {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
                content: message,
                flags: 64, // Ephemeral
            },
        };
    }

    /**
     * 创建延迟响应
     */
    static deferResponse(ephemeral = false) {
        return {
            type: InteractionCallbackType.DeferredChannelMessageWithSource,
            data: ephemeral ? { flags: 64 } : {},
        };
    }

    /**
     * 创建消息响应
     */
    static messageResponse(content: string | { content?: string; embeds?: any[]; components?: any[] }, ephemeral = false) {
        const data = typeof content === 'string' ? { content } : content;
        return {
            type: InteractionCallbackType.ChannelMessageWithSource,
            data: {
                ...data,
                flags: ephemeral ? 64 : 0,
            },
        };
    }

    /**
     * 创建更新消息响应
     */
    static updateResponse(content: string | { content?: string; embeds?: any[]; components?: any[] }) {
        const data = typeof content === 'string' ? { content } : content;
        return {
            type: InteractionCallbackType.UpdateMessage,
            data,
        };
    }

    /**
     * 创建模态框响应
     */
    static modalResponse(customId: string, title: string, components: any[]) {
        return {
            type: InteractionCallbackType.Modal,
            data: {
                custom_id: customId,
                title,
                components,
            },
        };
    }

    /**
     * 获取 REST 客户端
     */
    getREST(): DiscordREST {
        return this.rest;
    }

    /**
     * 编辑后续消息（用于延迟响应后）
     */
    async editFollowup(interactionToken: string, content: any) {
        return this.rest.editOriginalInteractionResponse(
            this.applicationId,
            interactionToken,
            content
        );
    }

    /**
     * 发送后续消息
     */
    async sendFollowup(interactionToken: string, content: any) {
        return this.rest.createFollowupMessage(
            this.applicationId,
            interactionToken,
            content
        );
    }
}

