# @imhelper/client-onebot-11

OneBot V11 协议客户端 SDK，提供快速连接和消息收发功能。

## 功能特性

- ✅ HTTP API 调用（发送消息、获取信息等）
- ✅ WebSocket 事件接收
- ✅ Webhook 事件接收
- ✅ SSE 事件接收（浏览器环境）
- ✅ 自动重连机制
- ✅ TypeScript 支持

## 安装

```bash
npm install @imhelper/client-onebot-11
# 或
pnpm add @imhelper/client-onebot-11
```

## 使用示例

### WebSocket 模式（推荐）

```typescript
import { OneBotV11Client } from '@imhelper/client-onebot-11';

const client = new OneBotV11Client({
  baseUrl: 'http://localhost:6727',
  platform: 'kook',
  accountId: 'zhin',
  accessToken: 'your_token',
  receiveMode: 'websocket', // 默认
});

// 监听事件
client.onEvent((event) => {
  if (event.post_type === 'message') {
    console.log('收到消息:', event);
  }
});

// 连接
await client.connect();

// 发送私聊消息
await client.sendPrivateMsg(123456, 'Hello!');

// 发送群消息
await client.sendGroupMsg(789012, 'Hello Group!');
```

### Webhook 模式

```typescript
const client = new OneBotV11Client({
  baseUrl: 'http://localhost:6727',
  platform: 'kook',
  accountId: 'zhin',
  receiveMode: 'webhook',
  webhookPort: 8080, // Webhook 服务器端口
});

await client.connect();
// 现在客户端会在 http://localhost:8080/onebot/v11 接收事件
```

### SSE 模式（浏览器环境）

```typescript
const client = new OneBotV11Client({
  baseUrl: 'http://localhost:6727',
  platform: 'kook',
  accountId: 'zhin',
  receiveMode: 'sse',
});

await client.connect();
```

## API

### 构造函数

```typescript
new OneBotV11Client(config: OneBotV11ClientConfig)
```

### 配置选项

- `baseUrl`: 服务器地址（必需）
- `platform`: 平台标识（必需）
- `accountId`: 账号ID（必需）
- `accessToken`: 访问令牌（可选）
- `receiveMode`: 接收方式，可选值：`'websocket'` | `'webhook'` | `'sse'`（默认：`'websocket'`）
- `webhookUrl`: Webhook 接收地址（webhook 模式）
- `webhookPort`: Webhook 端口（webhook 模式，默认：8080）

### 方法

#### 连接和断开

- `connect()`: 连接并开始接收事件
- `disconnect()`: 断开连接
- `onEvent(handler)`: 监听事件

#### 消息 API

- `sendPrivateMsg(userId, message)`: 发送私聊消息
- `sendGroupMsg(groupId, message)`: 发送群消息
- `deleteMsg(messageId)`: 撤回消息
- `getMsg(messageId)`: 获取消息

#### 用户和群组 API

- `getLoginInfo()`: 获取登录信息
- `getUserInfo(userId, noCache?)`: 获取用户信息
- `getFriendList()`: 获取好友列表
- `getGroupInfo(groupId, noCache?)`: 获取群信息
- `getGroupList()`: 获取群列表
- `getGroupMemberInfo(groupId, userId, noCache?)`: 获取群成员信息
- `getGroupMemberList(groupId)`: 获取群成员列表

#### 自定义 API

- `call(action, params?)`: 调用自定义 API

## 事件类型

事件对象遵循 OneBot V11 标准：

```typescript
interface OneBotV11Event {
  post_type: 'message' | 'notice' | 'request' | 'meta_event';
  message_type?: 'private' | 'group';
  time: number;
  self_id: number;
  // ... 其他字段
}
```

## License

MIT

