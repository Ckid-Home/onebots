# 客户端SDK使用指南

imhelper 是 onebots 的客户端SDK，提供统一的接口来连接标准协议（OneBot V11/V12、Satori、Milky）和机器人框架，抹平不同协议的差异。

## 什么是 imhelper？

imhelper 是 onebots 项目的客户端SDK核心，提供：

- **统一接口**：无论使用哪种协议（OneBot V11/V12、Satori、Milky），都使用相同的 API
- **多种接收方式**：支持 WebSocket、Webhook、SSE 等多种事件接收方式
- **类型安全**：完整的 TypeScript 类型支持
- **事件驱动**：基于 EventEmitter 的事件系统

## 架构位置

```
平台 API (微信、QQ、钉钉...)
        ↓
    onebots (服务端) ← 本项目服务端
        ↓
标准协议 (OneBot、Satori...)
        ↓
    imhelper (客户端SDK) ← 本项目客户端
        ↓
机器人框架 (Koishi、NoneBot...)
```

## 安装

### 安装核心包

```bash
npm install imhelper
# 或
pnpm add imhelper
```

### 安装协议客户端包

根据你要连接的协议，安装对应的客户端包：

```bash
# OneBot V11 客户端
npm install @imhelper/onebot-v11

# OneBot V12 客户端
npm install @imhelper/onebot-v12

# Satori 客户端
npm install @imhelper/satori-v1

# Milky 客户端
npm install @imhelper/milky-v1
```

## 快速开始

### 1. 创建适配器

```typescript
import { createOnebot11Adapter } from '@imhelper/onebot-v11';

const adapter = createOnebot11Adapter({
  baseUrl: 'http://localhost:6727',
  selfId: 'zhin',
  accessToken: 'your_token',
  receiveMode: 'ws', // 'ws' | 'wss' | 'webhook' | 'sse'
  path: '/kook/zhin/onebot/v11',
  wsUrl: 'ws://localhost:6727/kook/zhin/onebot/v11',
  platform: 'kook',
});
```

### 2. 创建 ImHelper 实例

```typescript
import { createImHelper } from 'imhelper';

const helper = createImHelper(adapter);
```

### 3. 监听事件

```typescript
// 监听私聊消息
helper.on('message.private', (message) => {
  console.log('收到私聊消息:', message.content);
  // 自动回复
  message.reply('收到！');
});

// 监听群聊消息
helper.on('message.group', (message) => {
  console.log('收到群聊消息:', message.content);
});

// 监听频道消息
helper.on('message.channel', (message) => {
  console.log('收到频道消息:', message.content);
});

// 监听所有事件
helper.on('event', (event) => {
  console.log('收到事件:', event);
});
```

### 4. 连接并启动

```typescript
// 连接（WebSocket/SSE 模式）
await adapter.connect();

// 或启动 Webhook 服务器（Webhook 模式）
await adapter.connect(8080); // 监听 8080 端口
```

### 5. 发送消息

```typescript
// 发送私聊消息
await helper.sendPrivateMessage('123456', 'Hello!');

// 发送群聊消息
await helper.sendGroupMessage('789012', 'Hello Group!');

// 发送频道消息
await helper.sendChannelMessage('345678', 'Hello Channel!');

// 使用 pick 方法获取对象
const user = helper.pickUser('123456');
await user.sendMessage('Hello!');

const group = helper.pickGroup('789012');
await group.sendMessage('Hello Group!');
```

## 完整示例

```typescript
import { createImHelper } from 'imhelper';
import { createOnebot11Adapter } from '@imhelper/onebot-v11';

async function main() {
  // 1. 创建适配器
  const adapter = createOnebot11Adapter({
    baseUrl: 'http://localhost:6727',
    selfId: 'zhin',
    accessToken: 'your_token',
    receiveMode: 'ws',
    path: '/kook/zhin/onebot/v11',
    wsUrl: 'ws://localhost:6727/kook/zhin/onebot/v11',
    platform: 'kook',
  });

  // 2. 创建 ImHelper 实例
  const helper = createImHelper(adapter);

  // 3. 监听消息事件
  helper.on('message.private', (message) => {
    console.log(`收到私聊消息 [${message.sender.id}]:`, message.content);
    // 自动回复
    message.reply('收到你的消息了！');
  });

  helper.on('message.group', (message) => {
    console.log(`收到群聊消息 [${message.scene_id}]:`, message.content);
    // 如果消息包含 @机器人，则回复
    if (message.content.includes('@机器人')) {
      message.reply('我在！');
    }
  });

  // 4. 连接
  await adapter.connect();
  console.log('✅ 客户端已连接');

  // 5. 优雅关闭
  process.on('SIGINT', async () => {
    console.log('正在关闭...');
    await adapter.stop();
    process.exit(0);
  });
}

main().catch(console.error);
```

## 接收方式

imhelper 支持多种事件接收方式：

### WebSocket (推荐)

```typescript
const adapter = createOnebot11Adapter({
  // ...
  receiveMode: 'ws',
  wsUrl: 'ws://localhost:6727/kook/zhin/onebot/v11',
});
await adapter.connect();
```

### WebSocket Secure (WSS)

```typescript
const adapter = createOnebot11Adapter({
  // ...
  receiveMode: 'wss',
  wsUrl: 'wss://localhost:6727/kook/zhin/onebot/v11',
});
await adapter.connect();
```

### Webhook

```typescript
const adapter = createOnebot11Adapter({
  // ...
  receiveMode: 'webhook',
  // webhook 需要服务器端配置回调地址
});
await adapter.connect(8080); // 启动本地 Webhook 服务器
```

### Server-Sent Events (SSE)

```typescript
const adapter = createOnebot11Adapter({
  // ...
  receiveMode: 'sse',
  sseUrl: 'http://localhost:6727/kook/zhin/onebot/v11/events',
});
await adapter.connect();
```

## API 参考

### ImHelper 类

#### 事件

- `message.private` - 私聊消息事件
- `message.group` - 群聊消息事件
- `message.channel` - 频道消息事件
- `event` - 所有原始事件

#### 方法

- `sendPrivateMessage(userId, message)` - 发送私聊消息
- `sendGroupMessage(groupId, message)` - 发送群聊消息
- `sendChannelMessage(channelId, message)` - 发送频道消息
- `pickUser(userId)` - 获取用户对象
- `pickGroup(groupId)` - 获取群组对象
- `pickChannel(channelId)` - 获取频道对象

### Message 类

#### 属性

- `id` - 消息ID
- `scene_type` - 场景类型（'private' | 'group' | 'channel'）
- `scene_id` - 场景ID
- `content` - 消息内容
- `sender` - 发送者（User 对象）
- `time` - 时间戳

#### 方法

- `reply(message)` - 回复消息

### User 类

#### 方法

- `sendMessage(message)` - 发送消息给该用户

### Group 类

#### 方法

- `sendMessage(message)` - 发送消息到该群组

### Channel 类

#### 方法

- `sendMessage(message)` - 发送消息到该频道

## 支持的协议

- ✅ **OneBot V11** - 通过 `@imhelper/onebot-v11`
- ✅ **OneBot V12** - 通过 `@imhelper/onebot-v12`
- ✅ **Satori** - 通过 `@imhelper/satori-v1`
- ✅ **Milky** - 通过 `@imhelper/milky-v1`

## 下一步

- 📚 [服务端快速开始](/guide/start)
- 🔌 [适配器开发指南](/guide/adapter)
- 📡 [协议说明](/protocol/onebot-v11)

