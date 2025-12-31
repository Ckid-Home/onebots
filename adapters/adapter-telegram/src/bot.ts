/**
 * Telegram Bot 客户端
 * 基于 grammy 封装
 */
import { EventEmitter } from 'events';
import { Bot, Context, InputFile } from 'grammy';
import type { RouterContext, Next } from 'onebots';
import type { TelegramConfig } from './types.js';

export class TelegramBot extends EventEmitter {
    private bot: Bot;
    private config: TelegramConfig;
    private me: any = null;

    constructor(config: TelegramConfig) {
        super();
        this.config = config;
        
        // 创建 grammy Bot 实例
        this.bot = new Bot(config.token);

        // 设置事件监听
        this.setupEventHandlers();
    }

    /**
     * 设置事件处理器
     */
    private setupEventHandlers(): void {
        // 监听所有消息
        this.bot.on('message', async (ctx: Context) => {
            const message = ctx.message;
            if (!message) return;

            // 忽略自己发送的消息
            if (message.from?.is_bot && message.from.id === this.me?.id) return;

            // 转换消息格式
            const event = this.transformMessage(message, ctx);
            
            // 判断是私聊还是群组/频道
            if (message.chat.type === 'private') {
                this.emit('private_message', event);
            } else {
                this.emit('group_message', event);
            }
        });

        // 监听编辑的消息
        this.bot.on('edited_message', async (ctx: Context) => {
            const message = ctx.editedMessage;
            if (!message) return;

            const event = this.transformMessage(message, ctx);
            this.emit('message_edited', event);
        });

        // 监听频道消息
        this.bot.on('channel_post', async (ctx: Context) => {
            const message = ctx.channelPost;
            if (!message) return;

            const event = this.transformMessage(message, ctx);
            this.emit('channel_message', event);
        });

        // 监听回调查询（Inline Keyboard 按钮点击）
        this.bot.on('callback_query', async (ctx: Context) => {
            const query = ctx.callbackQuery;
            if (!query) return;

            this.emit('callback_query', {
                id: query.id,
                from: query.from,
                message: query.message,
                data: query.data,
                chat_instance: query.chat_instance,
            });
        });

        // 监听错误
        this.bot.catch((err) => {
            this.emit('error', err);
        });
    }

    /**
     * 转换消息为内部格式
     */
    private transformMessage(message: any, ctx: Context): any {
        return {
            message_id: message.message_id,
            from: message.from,
            date: message.date,
            chat: message.chat,
            text: message.text,
            caption: message.caption,
            photo: message.photo,
            video: message.video,
            audio: message.audio,
            document: message.document,
            sticker: message.sticker,
            location: message.location,
            contact: message.contact,
            reply_to_message: message.reply_to_message,
            entities: message.entities,
            caption_entities: message.caption_entities,
            _original: message,
            _ctx: ctx,
        };
    }

    /**
     * 启动 Bot
     */
    async start(): Promise<void> {
        try {
            // 获取 Bot 信息
            this.me = await this.bot.api.getMe();
            
            // 根据配置选择启动方式
            if (this.config.webhook?.url) {
                // Webhook 模式
                await this.bot.api.setWebhook(this.config.webhook.url, {
                    secret_token: this.config.webhook.secret_token,
                    allowed_updates: this.config.webhook.allowed_updates,
                });
                this.emit('ready');
            } else if (this.config.polling?.enabled !== false) {
                // 轮询模式（默认）
                const pollingOptions: any = {};
                if (this.config.polling?.allowed_updates) {
                    pollingOptions.allowed_updates = this.config.polling.allowed_updates;
                }
                await this.bot.start(pollingOptions);
                this.emit('ready');
            } else {
                throw new Error('必须启用 webhook 或 polling 模式之一');
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
        try {
            if (this.config.webhook?.url) {
                // Webhook 模式：删除 webhook
                await this.bot.api.deleteWebhook();
            } else {
                // 轮询模式：停止轮询
                await this.bot.stop();
            }
            this.emit('stopped');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 处理 Webhook 请求
     */
    async handleWebhook(ctx: RouterContext, next: Next): Promise<void> {
        // grammy 会自动处理 webhook，这里只需要确保中间件正确设置
        await next();
    }

    /**
     * 获取缓存的 Bot 信息
     */
    getCachedMe(): any {
        return this.me;
    }

    // ============================================
    // API 方法代理到 grammy
    // ============================================

    /**
     * 获取 Bot 信息
     */
    async getMe(): Promise<any> {
        this.me = await this.bot.api.getMe();
        return this.me;
    }

    /**
     * 发送消息
     */
    async sendMessage(chatId: number | string, text: string, options?: any): Promise<any> {
        return await this.bot.api.sendMessage(chatId, text, options);
    }

    /**
     * 发送图片
     */
    async sendPhoto(chatId: number | string, photo: string | InputFile, options?: any): Promise<any> {
        return await this.bot.api.sendPhoto(chatId, photo, options);
    }

    /**
     * 发送视频
     */
    async sendVideo(chatId: number | string, video: string | InputFile, options?: any): Promise<any> {
        return await this.bot.api.sendVideo(chatId, video, options);
    }

    /**
     * 发送音频
     */
    async sendAudio(chatId: number | string, audio: string | InputFile, options?: any): Promise<any> {
        return await this.bot.api.sendAudio(chatId, audio, options);
    }

    /**
     * 发送文档
     */
    async sendDocument(chatId: number | string, document: string | InputFile, options?: any): Promise<any> {
        return await this.bot.api.sendDocument(chatId, document, options);
    }

    /**
     * 编辑消息
     */
    async editMessageText(chatId: number | string, messageId: number, text: string, options?: any): Promise<any> {
        return await this.bot.api.editMessageText(chatId, messageId, text, options);
    }

    /**
     * 删除消息
     */
    async deleteMessage(chatId: number | string, messageId: number): Promise<boolean> {
        return await this.bot.api.deleteMessage(chatId, messageId);
    }

    /**
     * 获取聊天信息
     */
    async getChat(chatId: number | string): Promise<any> {
        return await this.bot.api.getChat(chatId);
    }

    /**
     * 获取聊天成员
     */
    async getChatMember(chatId: number | string, userId: number): Promise<any> {
        return await this.bot.api.getChatMember(chatId, userId);
    }

    /**
     * 获取聊天成员列表
     */
    async getChatAdministrators(chatId: number | string): Promise<any[]> {
        return await this.bot.api.getChatAdministrators(chatId);
    }

    /**
     * 获取聊天成员数量
     */
    async getChatMemberCount(chatId: number | string): Promise<number> {
        return await this.bot.api.getChatMemberCount(chatId);
    }

    /**
     * 踢出成员
     */
    async banChatMember(chatId: number | string, userId: number, options?: any): Promise<boolean> {
        return await this.bot.api.banChatMember(chatId, userId, options);
    }

    /**
     * 取消封禁成员
     */
    async unbanChatMember(chatId: number | string, userId: number, options?: any): Promise<boolean> {
        return await this.bot.api.unbanChatMember(chatId, userId, options);
    }

    /**
     * 离开群组
     */
    async leaveChat(chatId: number | string): Promise<boolean> {
        return await this.bot.api.leaveChat(chatId);
    }

    /**
     * 获取 Bot 实例（用于高级用法）
     */
    getBot(): Bot {
        return this.bot;
    }
}

