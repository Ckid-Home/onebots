# Zulip 平台

## 状态

✅ **已实现并可用**

## 简介

Zulip 适配器基于 Zulip REST API 和 WebSocket API，支持流消息（Stream）和私聊消息（Private）。

## 特性

- ✅ 流消息（Stream）和私聊消息（Private）支持
- ✅ REST API 消息发送
- ✅ WebSocket 实时事件接收
- ✅ 消息编辑和删除
- ✅ 流管理
- ✅ 用户信息获取
- ✅ 自动重连支持
- ✅ 代理配置支持

## 安装

```bash
pnpm add @onebots/adapter-zulip
```

## 前置要求

### 1. Zulip 服务器

- 自托管 Zulip 服务器或使用 Zulip Cloud
- 获取服务器地址，如 `https://chat.zulip.org`

### 2. 获取 API Key

1. 登录 Zulip 服务器
2. 访问 Settings → Your bots → Add a new bot
3. 创建 Bot 并获取 API Key

## 配置

### 基础配置

```yaml
zulip.my_bot:
  # Zulip 服务器配置
  serverUrl: 'https://chat.zulip.org'
  email: 'bot@example.com'
  apiKey: 'your_api_key'
  
  # WebSocket 配置（可选）
  websocket:
    enabled: true  # 是否启用 WebSocket，默认 true
    reconnectInterval: 3000  # 重连间隔（毫秒），默认 3000
    maxReconnectAttempts: 10  # 最大重连次数，默认 10
  
  # 协议配置
  onebot.v11:
    access_token: 'your_token'
```

### 配置项说明

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `serverUrl` | string | 是 | Zulip 服务器地址 |
| `email` | string | 是 | Bot 邮箱地址 |
| `apiKey` | string | 是 | API Key |
| `websocket.enabled` | boolean | 否 | 是否启用 WebSocket，默认 true |
| `websocket.reconnectInterval` | number | 否 | 重连间隔（毫秒），默认 3000 |
| `websocket.maxReconnectAttempts` | number | 否 | 最大重连次数，默认 10 |
| `proxy` | object | 否 | 代理配置 |

## 使用客户端 SDK

```typescript
import { ImHelper } from '@onebots/imhelper';
import { OneBotV11Adapter } from '@onebots/protocol-onebot-v11';

const helper = new ImHelper({
  adapter: new OneBotV11Adapter({
    baseUrl: 'http://localhost:6727',
    basePath: '/zulip/my_bot/onebot/v11',
    accessToken: 'your_token',
    platform: 'zulip',
    accountId: 'my_bot',
  }),
});

// 监听消息
helper.on('message', async (message) => {
  console.log('收到 Zulip 消息:', message.sender.name, message.content);
  
  // 自动回复
  await helper.sendMessage({
    scene_id: message.sender.id,
    scene_type: message.message_type,
    message: [
      { type: 'text', data: { text: '已收到您的消息！' } }
    ],
  });
});

await helper.start();
```

## 消息类型

### 流消息（Stream）

流消息类似于群组消息，需要指定流名称和话题：

```yaml
# scene_id 格式: stream_name 或 stream_name/topic
scene_id: 'general'  # 发送到 general 流的默认话题
scene_id: 'general/test'  # 发送到 general 流的 test 话题
```

### 私聊消息（Private）

私聊消息需要指定收件人邮箱：

```yaml
# scene_id 格式: email 或 email1,email2
scene_id: 'user@example.com'  # 单用户
scene_id: 'user1@example.com,user2@example.com'  # 多用户
```

## 注意事项

1. **流消息格式**：`scene_id` 格式为 `stream_name` 或 `stream_name/topic`
2. **私聊消息格式**：`scene_id` 格式为邮箱地址或逗号分隔的邮箱列表
3. **Markdown 支持**：Zulip 支持 Markdown 格式，可以在消息中使用
4. **WebSocket 重连**：自动重连机制，可配置重连间隔和最大次数

## 相关链接

- [适配器配置](/config/adapter/zulip)
- [快速开始](/guide/start)
- [客户端 SDK](/guide/client-sdk)
- [Zulip API 文档](https://zulip.com/api)

