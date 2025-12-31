# QQ Adapter

The QQ adapter supports connecting to onebots service through QQ Official API.

## Status

✅ **Implemented and Available**

## Features

- ✅ QQ Channel Messages (Public/Private)
- ✅ QQ Group Messages
- ✅ Private Chat Messages (C2C)
- ✅ Channel Direct Messages (DMS)
- ✅ Channel Management
- ✅ Member Management
- ✅ Message Reactions
- ✅ Interactive Buttons
- ✅ WebSocket and Webhook Dual Mode Support

## Installation

```bash
npm install @onebots/adapter-qq
# or
pnpm add @onebots/adapter-qq
```

## Receiving Modes

The adapter supports two modes for receiving events, selectable via the `mode` configuration:

### WebSocket Mode (Default)

The bot actively connects to QQ servers to receive real-time event pushes. Suitable for most scenarios.

### Webhook Mode

QQ servers actively push events to your server. Suitable for scenarios requiring public network access or Serverless.

In Webhook mode, the event push URL is: `http://your-server:port/qq/{account_id}/webhook`

You need to configure this URL as the callback address in the QQ Open Platform.

## Configuration Example

```yaml
qq.my_bot:
  # OneBot V11 protocol configuration
  onebot.v11:
    use_http: true
    use_ws: true
    access_token: 'your_token'
    heartbeat_interval: 5
  
  # QQ platform configuration
  appId: 'your_app_id'       # QQ Bot AppID
  secret: 'your_app_secret'  # QQ Bot Secret
  mode: 'websocket'          # Receiving mode: 'websocket' (default) or 'webhook'
  sandbox: false             # Whether sandbox environment
  removeAt: true             # Whether to automatically remove @bot content
  maxRetry: 10               # Maximum reconnection attempts (WebSocket mode only)
  intents:                   # Events to listen to (WebSocket mode only)
    - 'GROUP_AT_MESSAGE_CREATE'     # Group @ message event
    - 'C2C_MESSAGE_CREATE'          # Private chat message event
    - 'DIRECT_MESSAGE'              # Channel direct message event
    - 'GUILDS'                      # Channel change event
    - 'GUILD_MEMBERS'               # Channel member change event
    - 'GUILD_MESSAGE_REACTIONS'     # Channel message reaction event
    - 'INTERACTION'                 # Interaction event
    - 'PUBLIC_GUILD_MESSAGES'       # Public bot channel message event
```

## Supported Intents

| Intent | Description |
|--------|-------------|
| `GUILDS` | Channel change events |
| `GUILD_MEMBERS` | Channel member change events |
| `GUILD_MESSAGES` | Channel message events (private) |
| `GUILD_MESSAGE_REACTIONS` | Channel message reaction events |
| `DIRECT_MESSAGE` | Channel direct message events |
| `INTERACTION` | Interaction events |
| `MESSAGE_AUDIT` | Message audit events |
| `FORUMS` | Forum events |
| `AUDIO_ACTION` | Audio action events |
| `AT_MESSAGES` | @ message events |
| `PUBLIC_GUILD_MESSAGES` | Public bot channel message events |

## Client SDK Usage

```typescript
import { ImHelper } from 'imhelper';
import { OneBotV11Adapter } from '@imhelper/onebot-v11';

const client = new ImHelper();

// Register OneBot V11 protocol adapter
client.registerAdapter('onebot.v11', OneBotV11Adapter);

// Connect to onebots server
await client.connect({
  platform: 'qq',
  account_id: 'my_bot',
  protocol: 'onebot.v11',
  endpoint: 'ws://localhost:6727/qq/my_bot/onebot/v11/ws',
  access_token: 'your_access_token',
});

// Listen for messages
client.on('message', (message) => {
  console.log(`Received message: ${message.content}`);
  // Auto reply
  if (message.content === 'Hello') {
    message.reply('Hello, I am a bot!');
  }
});
```

## Related Links

- [QQ Adapter Configuration](/en/config/adapter/qq)
- [Quick Start](/en/guide/start)
- [Client SDK Guide](/en/guide/client-sdk)

