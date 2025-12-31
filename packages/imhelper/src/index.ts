export * from './adapter.js';
export * from './imhelper.js';
export * from './message.js';
export * from './user.js';
export * from './group.js';
export * from './channel.js';
export * from './receiver.js';
export * from './receivers/ws.js';
export * from './receivers/wss.js';
export * from './receivers/webhook.js';
export * from './receivers/sse.js';

import { Adapter } from './adapter.js';
import { ImHelper } from './imhelper.js';

/**
 * 创建统一的消息助手
 */
export function createImHelper<Id extends string | number, Content extends string | any[], Response extends any>(
  adapter: Adapter<Id, Content, Response>
): ImHelper<Id, Content, Response> {
  return new ImHelper(adapter);
}

