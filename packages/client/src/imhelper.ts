import { EventEmitter } from 'events';
import { Adapter } from './adapter.js';
import { Group } from './group.js';
import { Channel } from './channel.js';
import { User } from './user.js';
export class ImHelper<Id extends string | number=string|number,Content extends string | any[]=string | any[],Response extends any=any> extends EventEmitter {
    #adapter: Adapter<Id, Content, Response>;
    constructor(adapter: Adapter<Id>) {
        super();
        this.#adapter = adapter;
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