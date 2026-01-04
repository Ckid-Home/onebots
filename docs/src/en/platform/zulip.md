# Zulip Platform

## Status

✅ **Implemented and Available**

## Introduction

The Zulip adapter is based on Zulip REST API and WebSocket API, supporting stream messages and private messages.

## Features

- ✅ Stream and private message support
- ✅ REST API message sending
- ✅ WebSocket real-time event receiving
- ✅ Message editing and deletion
- ✅ Stream management
- ✅ User information retrieval
- ✅ Auto-reconnect support
- ✅ Proxy configuration support

## Installation

```bash
pnpm add @onebots/adapter-zulip
```

## Prerequisites

### 1. Zulip Server

- Self-hosted Zulip server or Zulip Cloud
- Get server address, e.g., `https://chat.zulip.org`

### 2. Get API Key

1. Log in to Zulip server
2. Go to Settings → Your bots → Add a new bot
3. Create a bot and get API Key

## Configuration

### Basic Configuration

```yaml
zulip.my_bot:
  # Zulip server configuration
  serverUrl: 'https://chat.zulip.org'
  email: 'bot@example.com'
  apiKey: 'your_api_key'
  
  # WebSocket configuration (optional)
  websocket:
    enabled: true  # Whether to enable WebSocket, default true
    reconnectInterval: 3000  # Reconnect interval (ms), default 3000
    maxReconnectAttempts: 10  # Max reconnect attempts, default 10
  
  # Protocol configuration
  onebot.v11:
    access_token: 'your_token'
```

## Using Client SDK

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

// Listen for messages
helper.on('message', async (message) => {
  console.log('Received Zulip message:', message.sender.name, message.content);
  
  // Auto-reply
  await helper.sendMessage({
    scene_id: message.sender.id,
    scene_type: message.message_type,
    message: [
      { type: 'text', data: { text: 'Message received!' } }
    ],
  });
});

await helper.start();
```

## Message Types

### Stream Messages

Stream messages are similar to group messages, requiring stream name and topic:

```yaml
# scene_id format: stream_name or stream_name/topic
scene_id: 'general'  # Send to default topic in general stream
scene_id: 'general/test'  # Send to test topic in general stream
```

### Private Messages

Private messages require recipient email:

```yaml
# scene_id format: email or email1,email2
scene_id: 'user@example.com'  # Single user
scene_id: 'user1@example.com,user2@example.com'  # Multiple users
```

## Notes

1. **Stream Message Format**: `scene_id` format is `stream_name` or `stream_name/topic`
2. **Private Message Format**: `scene_id` format is email address or comma-separated email list
3. **Markdown Support**: Zulip supports Markdown format in messages
4. **WebSocket Reconnect**: Auto-reconnect mechanism with configurable interval and max attempts

## Related Links

- [Adapter Configuration](/en/config/adapter/zulip)
- [Quick Start](/en/guide/start)
- [Client SDK](/en/guide/client-sdk)
- [Zulip API Documentation](https://zulip.com/api)

