# @onebots/adapter-zulip

onebots Zulip 适配器，基于 Zulip REST API 和 WebSocket API。

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

## 配置

### 前置要求

1. **Zulip 服务器**
   - 自托管 Zulip 服务器或使用 Zulip Cloud
   - 获取服务器地址，如 `https://chat.zulip.org`

2. **获取 API Key**
   - 登录 Zulip 服务器
   - 访问 Settings → Your bots → Add a new bot
   - 创建 Bot 并获取 API Key

### 配置示例

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
  
  # 代理配置（可选）
  proxy:
    url: 'http://127.0.0.1:7890'
  
  # 协议配置
  onebot.v11:
    access_token: 'your_token'
```

## 使用示例

### 发送流消息

```javascript
// 发送到流 "general" 的话题 "test"
await bot.sendMessage('general/test', {
  scene_id: bot.createId('general/test'),
  scene_type: 'group',
  message: [
    { type: 'text', data: { text: 'Hello from Zulip!' } }
  ]
});
```

### 发送私聊消息

```javascript
// 发送给用户
await bot.sendMessage('user@example.com', {
  scene_id: bot.createId('user@example.com'),
  scene_type: 'private',
  message: [
    { type: 'text', data: { text: 'Hello!' } }
  ]
});
```

### 接收消息

适配器会自动接收 WebSocket 事件并转换为消息事件：

```javascript
bot.on('message', (event) => {
  if (event.platform === 'zulip') {
    console.log('收到 Zulip 消息:', event.sender.name, event.message);
  }
});
```

## 消息类型支持

| 消息类型 | 支持 | 说明 |
|---------|------|------|
| 文本 | ✅ | 支持 Markdown 格式 |
| 图片 | ✅ | 通过 Markdown 图片语法 |
| 文件 | ✅ | 通过 Markdown 链接语法 |

## 注意事项

1. **流消息格式**：`scene_id` 格式为 `stream_name` 或 `stream_name/topic`
2. **私聊消息格式**：`scene_id` 格式为邮箱地址或逗号分隔的邮箱列表
3. **Markdown 支持**：Zulip 支持 Markdown 格式，可以在消息中使用
4. **WebSocket 重连**：自动重连机制，可配置重连间隔和最大次数

## 相关链接

- [Zulip API 文档](https://zulip.com/api)
- [适配器配置指南](/guide/adapter)
- [Zulip 平台文档](/platform/zulip)

