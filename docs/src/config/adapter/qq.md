# QQ 适配器配置

QQ 官方机器人适配器配置说明。

## 配置格式

```yaml
qq.{account_id}:
  # QQ 平台配置
  appId: 'your_app_id'           # 必填：QQ机器人AppID
  secret: 'your_secret'           # 必填：QQ机器人Secret
  token: 'your_token'             # 必填：QQ机器人Token
  mode: 'websocket'               # 可选：连接模式，'websocket'（默认）或 'webhook'
  sandbox: false                  # 可选：是否沙箱环境，默认 false
  removeAt: true                  # 可选：是否自动移除@机器人内容，默认 true
  maxRetry: 10                    # 可选：最大重连次数（仅WebSocket模式），默认 10
  intents:                        # 可选：需要监听的事件（仅WebSocket模式需要）
    - 'GROUP_AT_MESSAGE_CREATE'
    - 'C2C_MESSAGE_CREATE'
    - 'DIRECT_MESSAGE'
    - 'GUILDS'
    - 'GUILD_MEMBERS'
    - 'GUILD_MESSAGE_REACTIONS'
    - 'INTERACTION'
    - 'PUBLIC_GUILD_MESSAGES'
  
  # 协议配置
  onebot.v11:
    access_token: 'your_v11_token'
  onebot.v12:
    access_token: 'your_v12_token'
```

## 配置项说明

| 字段名 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|--------|
| `appId` | string | 是 | QQ机器人AppID | - |
| `secret` | string | 是 | QQ机器人Secret | - |
| `token` | string | 是 | QQ机器人Token | - |
| `mode` | string | 否 | 连接模式：`websocket`（默认）或 `webhook` | `websocket` |
| `sandbox` | boolean | 否 | 是否沙箱环境 | `false` |
| `removeAt` | boolean | 否 | 是否自动移除@机器人内容 | `true` |
| `maxRetry` | number | 否 | 最大重连次数（仅WebSocket模式） | `10` |
| `intents` | string[] | 否 | 需要监听的事件（仅WebSocket模式需要） | `[]` |

## Intent 说明

Intent 为 QQ 官方配置，可填值参考下表：

| 值 | 描述 |
|----|------|
| `GROUP_AT_MESSAGE_CREATE` | 群聊@事件，没有群聊权限请注释 |
| `C2C_MESSAGE_CREATE` | 私聊事件，没有私聊权限请注释 |
| `DIRECT_MESSAGE` | 频道私信事件 |
| `GUILD_MESSAGES` | 私域机器人频道消息事件，公域机器人请注释 |
| `PUBLIC_GUILD_MESSAGES` | 公域机器人频道消息事件，私域机器人请注释 |
| `GUILDS` | 频道变更事件 |
| `GUILD_MEMBERS` | 频道成员变更事件 |
| `GUILD_MESSAGE_REACTIONS` | 频道消息表态事件 |
| `INTERACTION` | 互动事件 |
| `MESSAGE_AUDIT` | 消息审核事件 |

## 连接模式

### WebSocket 模式（默认）

机器人主动连接QQ服务器，实时接收事件推送：

```yaml
qq.my_bot:
  mode: 'websocket'  # 可省略，默认值
  intents:
    - 'GROUP_AT_MESSAGE_CREATE'
    - 'C2C_MESSAGE_CREATE'
```

### Webhook 模式

QQ服务器主动推送事件到你的服务器：

```yaml
qq.my_bot:
  mode: 'webhook'
```

Webhook模式下，事件推送地址为：`http://your-server:port/qq/{account_id}/webhook`

需要在QQ开放平台配置此URL作为回调地址。

## 完整配置示例

```yaml
port: 6727
log_level: info
timeout: 30

general:
  onebot.v11:
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000

# QQ 官方机器人账号配置
qq.3889001676:
  # QQ 平台配置
  appId: '102073979'
  token: 'rf5PImyaJSUal1IqnDiLJREvYQVduHro'
  secret: 'd4WyQsKmFiBe7a4Y2W0UyTyTyTyTzV1X'
  sandbox: false
  intents:
    - 'GROUP_AT_MESSAGE_CREATE'
    - 'C2C_MESSAGE_CREATE'
    - 'PUBLIC_GUILD_MESSAGES'
  
  # OneBot V11 协议配置
  onebot.v11:
    access_token: 'qq_token'
```

## 相关文档

- [QQ 平台说明](/platform/qq)
- [适配器配置指南](/guide/adapter)
- [客户端SDK使用指南](/guide/client-sdk)
