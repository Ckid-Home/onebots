import { Adapter } from './adapter.js';
export abstract class Receiver<Id extends string | number=string|number,Content extends string | any[]=string | any[],Response extends any=any> {
    constructor(public adapter: Adapter<Id, Content, Response>) {
    }
    abstract connect(port?: number): Promise<void>;
    abstract disconnect(): Promise<void>;
}