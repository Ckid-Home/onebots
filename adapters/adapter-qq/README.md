# @imhelper/adapter-qq

QQ官方机器人适配器，支持QQ频道和群聊机器人的消息收发和管理。

## 特性

- ✨ 支持QQ频道消息（公域/私域）
- ✨ 支持QQ群消息
- ✨ 支持单聊消息 (C2C)
- ✨ 支持频道私信 (DMS)
- ✨ 支持频道管理
- ✨ 支持成员管理
- ✨ 支持消息表态
- ✨ 支持互动按钮
- ✨ 支持 WebSocket 和 Webhook 两种接收模式

## 安装

```bash
npm install @imhelper/adapter-qq
# 或
pnpm add @imhelper/adapter-qq
```

## 接收模式

适配器支持两种接收事件的模式：

### WebSocket 模式（默认）

机器人主动连接QQ服务器，实时接收事件推送。适合大多数场景。

```yaml
qq.my_bot:
  mode: 'websocket'  # 或省略，默认就是 websocket
  # ... 其他配置
```

### Webhook 模式

QQ服务器主动推送事件到你的服务器。适合需要公网访问或Serverless场景。

```yaml
qq.my_bot:
  mode: 'webhook'
  # ... 其他配置
```

Webhook模式下，事件推送地址为：`http://your-server:port/qq/{account_id}/webhook`

需要在QQ开放平台配置此URL作为回调地址。

## 配置示例

### WebSocket 模式配置

```yaml
qq.my_bot:
  # OneBot V11 协议配置
  onebot.v11:
    use_http: true
    use_ws: true
    access_token: 'your_token'
    heartbeat_interval: 5
  
  # QQ 平台配置
  appId: 'your_app_id'       # QQ机器人AppID
  secret: 'your_app_secret'  # QQ机器人Secret
  mode: 'websocket'          # 接收模式：websocket 或 webhook
  sandbox: false             # 是否沙箱环境
  removeAt: true             # 是否自动移除@机器人内容
  maxRetry: 10               # 最大重连次数
  intents:                   # 需要监听的事件
    - 'GROUP_AT_MESSAGE_CREATE'     # 群聊@消息事件
    - 'C2C_MESSAGE_CREATE'          # 私聊消息事件
    - 'DIRECT_MESSAGE'              # 频道私信事件
    - 'GUILDS'                      # 频道变更事件
    - 'GUILD_MEMBERS'               # 频道成员变更事件
    - 'GUILD_MESSAGE_REACTIONS'     # 频道消息表态事件
    - 'INTERACTION'                 # 互动事件
    - 'PUBLIC_GUILD_MESSAGES'       # 公域机器人频道消息事件
```

### Webhook 模式配置

```yaml
qq.my_bot:
  # OneBot V11 协议配置
  onebot.v11:
    use_http: true
    use_ws: true
    access_token: 'your_token'
  
  # QQ 平台配置
  appId: 'your_app_id'
  secret: 'your_app_secret'
  mode: 'webhook'            # 使用Webhook接收模式
  sandbox: false
  removeAt: true
```

## 支持的 Intent

| Intent | 说明 |
|--------|------|
| `GUILDS` | 频道变更事件 |
| `GUILD_MEMBERS` | 频道成员变更事件 |
| `GUILD_MESSAGES` | 频道消息事件（私域） |
| `PUBLIC_GUILD_MESSAGES` | 频道消息事件（公域） |
| `GUILD_MESSAGE_REACTIONS` | 频道消息表态事件 |
| `DIRECT_MESSAGE` | 频道私信事件 |
| `GROUP_AT_MESSAGE_CREATE` | 群聊@消息事件 |
| `C2C_MESSAGE_CREATE` | 私聊消息事件 |
| `MESSAGE_AUDIT` | 消息审核事件 |
| `INTERACTION` | 互动事件 |

## 支持的 API

### 消息相关
- `sendMessage` - 发送消息（支持群聊、私聊、频道和频道私信）
- `deleteMessage` - 撤回消息

### 用户相关
- `getLoginInfo` - 获取机器人信息

### 频道相关
- `getGuildList` - 获取频道列表
- `getGuildInfo` - 获取频道信息
- `getChannelList` - 获取子频道列表
- `getChannelInfo` - 获取子频道信息
- `createChannel` - 创建子频道
- `updateChannel` - 修改子频道
- `deleteChannel` - 删除子频道

### 成员管理
- `getGuildMemberInfo` - 获取频道成员信息
- `kickGuildMember` - 踢出频道成员（扩展方法）
- `muteGuildMember` - 禁言频道成员（扩展方法）
- `muteGuild` - 全员禁言（扩展方法）

### 系统相关
- `getVersion` - 获取版本信息
- `getStatus` - 获取运行状态

## 事件类型

适配器会将QQ官方API的事件转换为通用事件格式：

### 消息事件
- `message.guild` - 频道消息
- `message.direct` - 频道私信
- `message.group` - 群消息
- `message.private` - 私聊消息

### 通知事件
- `guild_create` / `guild_update` / `guild_delete` - 频道变更
- `channel_create` / `channel_update` / `channel_delete` - 子频道变更
- `group_increase` / `group_decrease` - 成员变更
- `reaction_add` / `reaction_remove` - 消息表态
- `interaction` - 互动事件

## 相关链接

- [QQ开放平台](https://q.qq.com/)
- [QQ机器人文档](https://bot.q.qq.com/wiki/)
- [OneBots文档](https://docs.imhelper.org)
