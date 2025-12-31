import { EventEmitter } from 'events';
import { Message } from './message.js';

export abstract class Adapter<Id extends string | number = string | number, Content extends string | any[] = string | any[], Response extends any = any> extends EventEmitter<Adapter.EventMap<Id, Content, Response>> {
    /** 机器人自身ID */
    abstract readonly selfId: string;

    /** 发送消息 */
    abstract sendMessage(options: Adapter.SendMessageOptions<Id, Content>): Promise<Response>;

    /** 启动适配器（可选） */
    start?(port?: number): Promise<void>;

    /** 停止适配器（可选） */
    stop?(): Promise<void>;
}
export namespace Adapter {
    export interface EventMap<Id extends string | number,Content extends string | any[],Response extends any>{
        'message.private': [Message<Id,Content,'private',Response>]
        'message.group': [Message<Id,Content,'group',Response>]
        'message.channel': [Message<Id,Content,'channel',Response>]
    }
    export interface SendMessageOptions<Id extends string | number=string|number, Content extends string | any[]=string | any[]> {
        scene_type: SceneType;
        scene_id: Id;
        message: Content;
    }
    export type SceneType = 'private' | 'group' | 'channel';
}