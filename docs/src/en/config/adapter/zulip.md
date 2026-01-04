# Zulip Adapter Configuration

Zulip adapter configuration guide.

## Configuration Fields

### serverUrl

- **Type**: `string`
- **Required**: ✅
- **Description**: Zulip server address, e.g., `https://chat.zulip.org`

### email

- **Type**: `string`
- **Required**: ✅
- **Description**: Bot email address

### apiKey

- **Type**: `string`
- **Required**: ✅
- **Description**: API Key (obtained from Zulip settings)

### websocket

WebSocket configuration.

#### websocket.enabled

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to enable WebSocket, default true

#### websocket.reconnectInterval

- **Type**: `number`
- **Default**: `3000`
- **Description**: Reconnect interval (milliseconds)

#### websocket.maxReconnectAttempts

- **Type**: `number`
- **Default**: `10`
- **Description**: Maximum reconnect attempts

### proxy

- **Type**: `object`
- **Required**: ❌
- **Description**: Proxy configuration (optional)

## Configuration Example

### Basic Configuration

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

## Getting API Key

1. Log in to Zulip server
2. Go to Settings → Your bots → Add a new bot
3. Fill in bot information:
   - **Full name**: Bot display name
   - **Bot email**: Bot email address (auto-generated)
   - **Bot type**: Choose "Incoming webhook" or "Generic bot"
4. Get API Key after creation

## Related Links

- [Zulip Platform](/en/platform/zulip)
- [Quick Start](/en/guide/start)

