# Zulip 适配器配置

Zulip 适配器配置说明。

## 配置项

### serverUrl

- **类型**: `string`
- **必填**: ✅
- **说明**: Zulip 服务器地址，如 `https://chat.zulip.org`

### email

- **类型**: `string`
- **必填**: ✅
- **说明**: Bot 邮箱地址

### apiKey

- **类型**: `string`
- **必填**: ✅
- **说明**: API Key（从 Zulip 设置中获取）

### websocket

WebSocket 配置。

#### websocket.enabled

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用 WebSocket，默认 true

#### websocket.reconnectInterval

- **类型**: `number`
- **默认值**: `3000`
- **说明**: 重连间隔（毫秒）

#### websocket.maxReconnectAttempts

- **类型**: `number`
- **默认值**: `10`
- **说明**: 最大重连次数

### proxy

- **类型**: `object`
- **必填**: ❌
- **说明**: 代理配置（可选）

## 配置示例

### 基础配置

```yaml
zulip.my_bot:
  serverUrl: 'https://chat.zulip.org'
  email: 'bot@example.com'
  apiKey: 'your_api_key'
  
  websocket:
    enabled: true
    reconnectInterval: 3000
    maxReconnectAttempts: 10
  
  onebot.v11:
    access_token: 'your_token'
```

### 带代理的配置

```yaml
zulip.my_bot:
  serverUrl: 'https://chat.zulip.org'
  email: 'bot@example.com'
  apiKey: 'your_api_key'
  
  proxy:
    url: 'http://127.0.0.1:7890'
    username: 'proxy_user'  # 可选
    password: 'proxy_pass'  # 可选
  
  onebot.v11:
    access_token: 'your_token'
```

## 获取 API Key

1. 登录 Zulip 服务器
2. 访问 Settings → Your bots → Add a new bot
3. 填写 Bot 信息：
   - **Full name**: Bot 显示名称
   - **Bot email**: Bot 邮箱地址（会自动生成）
   - **Bot type**: 选择 "Incoming webhook" 或 "Generic bot"
4. 创建后获取 API Key

## 相关链接

- [适配器配置指南](/guide/adapter)
- [Zulip 平台文档](/platform/zulip)

