import { ImHelper } from './imhelper.js';
export class Group<Id extends string | number=string|number,Content extends string | any[]=string | any[],Response extends any=any> {
    #id: Id;
    constructor(public helper: ImHelper<Id, Content, Response>,groupId: Id) {
        this.#id = groupId;
    }
    sendMessage(message: Content) {
        return this.helper.adapter.sendMessage({
            scene_type: 'group',
            scene_id: this.#id,
            message: message,
        });
    }
}
export namespace Group {
    export interface Data<Id extends string | number=string|number> {
        id: Id;
        name: string;
        avatar: string;
    }
}