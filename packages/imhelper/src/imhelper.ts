import { EventEmitter } from 'events';
import { Adapter } from './adapter.js';
import { Group } from './group.js';
import { Channel } from './channel.js';
import { User } from './user.js';
import { Message } from './message.js';
export class ImHelper<Id extends string | number=string|number,Content extends string | any[]=string | any[],Response extends any=any> extends EventEmitter {
    #adapter: Adapter<Id, Content, Response>;
    constructor(adapter: Adapter<Id>) {
        super();
        this.#adapter = adapter;
        
        // 转发 adapter 的所有事件到 ImHelper
        // 这样用户可以直接在 ImHelper 上监听事件
        // 转发 adapter 的消息事件，将 Message.Data 转换为 Message 对象
        (adapter as any).on('message.private', (data: any) => {
            console.log('[ImHelper] Received message.private from adapter, converting to Message object');
            this.emit('message.private', new Message(this, data));
        });
        (adapter as any).on('message.group', (data: any) => {
            console.log('[ImHelper] Received message.group from adapter, converting to Message object');
            this.emit('message.group', new Message(this, data));
        });
        (adapter as any).on('message.channel', (data: any) => {
            console.log('[ImHelper] Received message.channel from adapter, converting to Message object');
            this.emit('message.channel', new Message(this, data));
        });
        // 转发 adapter 的原始事件
        (adapter as any).on('event', (event: any) => {
            this.emit('event', event);
        });
    }
    get adapter() {
        return this.#adapter;
    }
    pickUser(userId: Id) {
        return new User(this, userId);
    }
    pickGroup(groupId: Id) {
        return new Group(this, groupId);
    }
    pickChannel(channelId: Id) {
        return new Channel(this, channelId);
    }
    sendPrivateMessage(userId: Id, message: Content) {
        return this.#adapter.sendMessage({
            scene_type: 'private',
            scene_id: userId,
            message: message,
        });
    }
    sendGroupMessage(groupId: Id, message: Content) {
        return this.#adapter.sendMessage({
            scene_type: 'group',
            scene_id: groupId,
            message: message,
        });
    }
    sendChannelMessage(channelId: Id, message: Content) {
        return this.#adapter.sendMessage({
            scene_type: 'channel',
            scene_id: channelId,
            message: message,
        });
    }
    async start(port?: number): Promise<void> {
        return this.#adapter.start?.(port);
    }

    async stop(): Promise<void> {
        return this.#adapter.stop?.();
    }
}