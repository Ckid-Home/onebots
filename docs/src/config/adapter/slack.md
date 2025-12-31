# Slack 适配器配置

Slack 适配器配置说明。

## 配置项

### token

- **类型**: `string`
- **必填**: ✅
- **说明**: Slack Bot Token（格式：`xoxb-...`）

### signing_secret

- **类型**: `string`
- **必填**: ❌
- **说明**: Signing Secret（用于验证 Events API 请求）

### app_token

- **类型**: `string`
- **必填**: ❌
- **说明**: App-Level Token（格式：`xapp-...`，用于 Socket Mode）

### socket_mode

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否使用 Socket Mode（需要 app_token）

## 配置示例

### 基础配置（Events API）

```yaml
slack.my_bot:
  token: 'xoxb-your-bot-token'
  signing_secret: 'your_signing_secret'  # 可选，但推荐配置
```

### Socket Mode 配置

```yaml
slack.my_bot:
  token: 'xoxb-your-bot-token'
  app_token: 'xapp-your-app-token'
  socket_mode: true
```

## 获取应用凭证

1. 访问 [Slack API](https://api.slack.com/)
2. 创建应用（Create New App）
3. 在 "OAuth & Permissions" 中配置权限：
   - `chat:write` - 发送消息
   - `channels:read` - 读取频道信息
   - `channels:history` - 读取频道历史
   - `users:read` - 读取用户信息
   - `im:read` - 读取私聊
   - `im:write` - 发送私聊消息
4. 安装应用到工作区
5. 获取 Bot User OAuth Token（`xoxb-...`）
6. 在 "Event Subscriptions" 中配置 Webhook URL：`http://your-server:port/slack/{account_id}/webhook`
7. 获取 Signing Secret（用于验证请求）

## Webhook 地址

配置事件订阅 URL 为：

```
http://your-domain:port/slack/{account_id}/webhook
```

例如：
```
http://bot.example.com:6727/slack/my_bot/webhook
```

## 相关链接

- [适配器配置指南](/guide/adapter)
- [Slack 平台文档](/platform/slack)

