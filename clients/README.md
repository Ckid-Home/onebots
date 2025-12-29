# imhelper 客户端 SDK

提供快速连接各协议的客户端 SDK，支持多种接收方式（WebSocket、SSE、Webhook）。

## 包列表

- `@imhelper/onebot11` - OneBot V11 协议客户端
- `@imhelper/onebot12` - OneBot V12 协议客户端
- `@imhelper/milky` - Milky 协议客户端（待实现）
- `@imhelper/satori` - Satori 协议客户端（待实现）
- `imhelper` - 统一的消息助手

## 安装

```bash
pnpm add @imhelper/onebot11 @imhelper/onebot12 imhelper
```

## 使用示例

```typescript
import { createOnebot11Adapter } from '@imhelper/onebot11';
import { createOnebot12Adapter } from '@imhelper/onebot12';
import { createImHelper } from 'imhelper';

// 创建 OneBot V11 适配器
const onebot11Adapter = createOnebot11Adapter({
  baseUrl: 'http://localhost:6727/hook/zhin/onebot/v11',
  selfId: 'zhin',
  accessToken: 'your_token',
  receiveMode: 'ws', // ws | wss | webhook | sse
  path: '/onebot/v11', // webhook 模式使用
});

// 创建 OneBot V12 适配器
const onebot12Adapter = createOnebot12Adapter({
  baseUrl: 'http://localhost:6727/hook/zhin/onebot/v12',
  selfId: 'zhin',
  accessToken: 'your_token',
  receiveMode: 'ws', // ws | wss | webhook | sse
  wsUrl: 'ws://localhost:6727/hook/zhin/onebot/v12', // 可选
});

// 创建统一的消息助手
const imHelper = createImHelper(onebot11Adapter);

// 启动服务（根据 receiveMode 自动处理）
await imHelper.start(8080);

// 监听私信
imHelper.on('message.private', (message) => {
  console.log('收到私信:', message);
  message.reply('Hello, world!');
});

// 监听群消息
imHelper.on('message.group', (message) => {
  console.log('收到群消息:', message);
  message.reply('Hello, group!');
});

// 监听频道消息
imHelper.on('message.channel', (message) => {
  console.log('收到频道消息:', message);
  message.reply('Hello, channel!');
});

// 发送消息
await imHelper.sendPrivateMessage('1234567890', 'Hello!');
await imHelper.sendGroupMessage('789012', 'Hello Group!');
await imHelper.sendChannelMessage('channel123', 'Hello Channel!');
```

## 接收模式说明

### WebSocket (ws/wss)

- **ws**: 普通 WebSocket 连接
- **wss**: 安全 WebSocket 连接（TLS）
- 自动连接服务器，接收实时事件
- 支持自动重连

### Webhook

- 启动本地 HTTP 服务器
- 接收路径：`/{selfId}/{protocol}/{version}`
- 例如：`/zhin/onebot/v11`
- 服务器会将事件 POST 到此路径

### SSE (Server-Sent Events)

- 仅支持浏览器环境
- 自动连接 SSE 端点
- 接收实时事件流

## API 文档

### Adapter 接口

所有适配器都实现以下接口：

```typescript
interface Adapter extends EventEmitter {
  selfId: string;
  sendPrivateMessage(userId: any, message: string | any[]): Promise<any>;
  sendGroupMessage(groupId: any, message: string | any[]): Promise<any>;
  sendChannelMessage(channelId: any, message: string | any[]): Promise<any>;
  sendChannelMessage(guildId: any, channelId: any, message: string | any[]): Promise<any>; // 重载
  start(port?: number): Promise<void>;
  stop(): Promise<void>;
}
```

### ImHelper 接口

统一的消息助手接口：

```typescript
interface ImHelper extends EventEmitter {
  sendPrivateMessage(userId: any, message: string | any[]): Promise<any>;
  sendGroupMessage(groupId: any, message: string | any[]): Promise<any>;
  sendChannelMessage(channelId: any, message: string | any[]): Promise<any>;
  sendChannelMessage(guildId: any, channelId: any, message: string | any[]): Promise<any>;
  start(port?: number): Promise<void>;
  stop(): Promise<void>;
}
```

### 事件类型

消息事件对象包含以下字段：

```typescript
{
  id: string | number;        // 消息ID
  userId: string | number;    // 用户ID
  groupId?: string | number;  // 群ID（群消息）
  channelId?: string | number;// 频道ID（频道消息）
  guildId?: string | number;  // 服务器ID（频道消息，V12）
  content: any[];             // 消息内容（消息段数组）
  raw: string;                // 原始消息文本
  reply: (message: string | any[]) => Promise<any>; // 回复方法
  event: any;                 // 原始事件对象
}
```

## 开发状态

- ✅ OneBot V11 客户端（完整实现）
- ✅ OneBot V12 客户端（完整实现）
- ⏳ Milky 客户端（基础结构）
- ⏳ Satori 客户端（基础结构）

## License

MIT

