# 适配器配置指南

::: tip
`onebots` 基于适配器驱动，使用之前请先安装对应适配器所需的依赖

如已安装，请忽略
:::

## 1. 安装依赖 

请参考 [快速开始](./start.md#安装插件)

## 2. 配置说明

onebots 使用 YAML 格式的配置文件，支持为每个账号配置多个协议。

### 配置结构

```yaml
# 全局配置
port: 6727              # HTTP 服务器端口
log_level: info         # 日志级别
timeout: 30             # 登录超时时间(秒)

# 通用配置（协议默认配置）
general:
  onebot.v11:           # OneBot V11 协议通用配置
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000
  onebot.v12:           # OneBot V12 协议通用配置
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000
  satori.v1:            # Satori 协议通用配置
    use_http: true
    use_ws: true
    token: ''
  milky.v1:             # Milky 协议通用配置
    use_http: true
    use_ws: true
    access_token: ''

# 账号配置（格式: {platform}.{account_id}）
{platform}.{account_id}:
  # 平台特定配置
  # ...
  
  # 协议配置（覆盖通用配置）
  onebot.v11:
    access_token: 'your_token'
  onebot.v12:
    access_token: 'your_token'
  satori.v1:
    token: 'your_token'
  milky.v1:
    access_token: 'your_token'
```

### 配置示例

::: code-group
```yaml [QQ官方机器人]
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
  appId: 'your_app_id'
  token: 'your_token'
  secret: 'your_secret'
  sandbox: false
  intents:
    - 'GROUP_AT_MESSAGE_CREATE'
    - 'C2C_MESSAGE_CREATE'
    - 'PUBLIC_GUILD_MESSAGES'
  
  # OneBot V11 协议配置
  onebot.v11:
    access_token: 'your_access_token'
```
```yaml [Kook机器人]
port: 6727
log_level: info
timeout: 30

general:
  onebot.v11:
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000
  onebot.v12:
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000
  satori.v1:
    use_http: true
    use_ws: true
    token: ''

# Kook 机器人账号配置
kook.zhin:
  # Kook 平台配置
  token: 'your_kook_token'
  
  # OneBot V11 协议配置
  onebot.v11:
    access_token: 'your_v11_token'
  
  # OneBot V12 协议配置
  onebot.v12:
    access_token: 'your_v12_token'
  
  # Satori V1 协议配置
  satori.v1:
    token: 'your_satori_token'
    platform: 'kook'
```
```yaml [微信机器人]
port: 6727
log_level: info
timeout: 30

general:
  onebot.v11:
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000
  onebot.v12:
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000

# 微信机器人账号配置
wechat.bot1:
  # 微信平台配置
  app_id: 'your_app_id'
  app_secret: 'your_app_secret'
  token: 'your_token'
  
  # OneBot V11 协议配置
  onebot.v11:
    access_token: 'your_v11_token'
  
  # OneBot V12 协议配置
  onebot.v12:
    access_token: 'your_v12_token'
```
```yaml [Discord机器人]
port: 6727
log_level: info
timeout: 30

general:
  onebot.v11:
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000

# Discord 机器人账号配置
discord.bot1:
  # Discord 平台配置
  token: 'your_discord_token'
  
  # OneBot V11 协议配置
  onebot.v11:
    access_token: 'your_access_token'
```
:::

## 3. 配置说明

### 账号配置格式

账号配置的格式为：`{platform}.{account_id}`

- `platform`: 平台名称（如 `qq`、`kook`、`wechat`、`discord`）
- `account_id`: 账号唯一标识（如 QQ 的 appId、Kook 的机器人名称等）

### 协议配置

每个账号可以同时配置多个协议：

- `onebot.v11` - OneBot V11 协议
- `onebot.v12` - OneBot V12 协议
- `satori.v1` - Satori 协议
- `milky.v1` - Milky 协议

### 协议配置项

各协议的通用配置项请参考：
- [OneBot V11 配置](/config/v11)
- [OneBot V12 配置](/config/v12)
- [Satori 配置](/config/protocol)
- [Milky 配置](/config/protocol)

### 平台特定配置

各平台的特定配置项请参考：
- [QQ 适配器配置](/config/adapter/qq)
- [Kook 适配器配置](/config/adapter/kook)
- [微信适配器配置](/config/adapter/wechat)
- [Discord 适配器配置](/config/adapter/discord)

## 4. 使用客户端SDK连接

配置好服务端后，可以使用 imhelper 客户端SDK 连接：

```typescript
import { createImHelper } from 'imhelper';
import { createOnebot11Adapter } from '@imhelper/onebot-v11';

const adapter = createOnebot11Adapter({
  baseUrl: 'http://localhost:6727',
  selfId: 'zhin',
  accessToken: 'your_access_token',
  receiveMode: 'ws',
  path: '/kook/zhin/onebot/v11',
  wsUrl: 'ws://localhost:6727/kook/zhin/onebot/v11',
  platform: 'kook',
});

const helper = createImHelper(adapter);
await adapter.connect();
```

详细说明请查看：[客户端SDK使用指南](/guide/client-sdk)

## 下一步

- 📚 [配置文件详解](/config/global)
- 💻 [客户端SDK使用指南](/guide/client-sdk)
- 📡 [协议说明](/protocol/onebot-v11)
