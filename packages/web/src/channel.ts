import { ImHelper } from './imhelper.js';
export class Channel<Id extends string | number=string|number,Content extends string | any[]=string | any[],Response extends any=any> {
    #id: Id;
    constructor(public helper: ImHelper<Id, Content, Response>, channelId: Id) {
        this.#id = channelId;
    }
    sendMessage(message: Content) {
        return this.helper.adapter.sendMessage({
            scene_type: 'channel',
            scene_id: this.#id,
            message: message,
        });
    }
}
export namespace Channel {
    export interface Data<Id extends string | number=string|number> {
        id: Id;
        name: string;
        avatar: string;
    }
}