import { ImHelper } from './imhelper.js';
import { User } from './user.js';
export class Message<Id extends string | number,Content extends string | any[],Scene extends 'private' | 'group' | 'channel',Response extends any> {
    #id: Id;
    #scene_type: Scene;
    #scene_id: Id;
    #content: Content;
    #sender: User<Id>;
    #time: number;
    constructor(public helper: ImHelper<Id, Content, Response>, data: Message.Data<Id, Scene, Content>) {
        this.#id = data.id;
        this.#scene_type = data.scene_type;
        this.#scene_id = data.scene_id;
        this.#content = data.content;
        this.#sender = new User(helper, data.sender);
        this.#time = data.time;
    }
    reply(message: Content) {
        return this.helper.adapter.sendMessage({
            scene_type: this.#scene_type,
            scene_id: this.#scene_id,
            message: message,
        });
    }
}
export namespace Message {
    export interface Data<Id extends string | number=string|number, Scene extends 'private' | 'group' | 'channel'= 'private' | 'group' | 'channel',Content extends string | any[]=string | any[]> {
        id: Id;
        scene_type: Scene;
        content: Content;
        sender: Id;
        scene_id: Id;
        time: number;
    }
}