import { ImHelper } from './imhelper.js';
export class User<Id extends string | number=string|number,Content extends string | any[]=string | any[],Response extends any=any> {
    #id: Id;
    constructor(public helper: ImHelper<Id, Content, Response>, userId: Id) {
        this.#id = userId;
    }
    sendMessage(message: Content) {
        return this.helper.adapter.sendMessage({
            scene_type: 'private',
            scene_id: this.#id,
            message: message,
        });
    }
}
export namespace User {
    export interface Data<Id extends string | number=string|number> {
        id: Id;
        name: string;
        avatar: string;
    }
}