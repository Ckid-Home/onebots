# Feishu Adapter

The Feishu adapter is fully implemented and supports connecting to onebots service through Feishu Open Platform Bot API.

## Status

✅ **Implemented and Available**

## Features

- ✅ **Message Sending/Receiving**
  - Private chat message sending/receiving
  - Group chat message sending/receiving
  - Supports text, rich text, cards, and other message formats
- ✅ **Message Management**
  - Message editing
  - Message deletion
- ✅ **Group Management**
  - Get group information
  - Get group member list and information
  - Leave group
  - Kick members
- ✅ **User Management**
  - Get user information
- ✅ **Event Subscription**
  - Webhook event subscription
  - Automatic token management (app access token and tenant access token)

## Installation

```bash
npm install @onebots/adapter-feishu
# or
pnpm add @onebots/adapter-feishu
```

## Configuration

Configure Feishu account in `config.yaml`:

```yaml
# Feishu bot account configuration
feishu.your_bot_id:
  # Feishu platform configuration
  app_id: 'your_app_id'  # App ID, required
  app_secret: 'your_app_secret'  # App Secret, required
  encrypt_key: 'your_encrypt_key'  # Optional, event encryption key
  verification_token: 'your_verification_token'  # Optional, event verification Token
  
  # OneBot V11 protocol configuration
  onebot.v11:
    access_token: 'your_v11_token'
  
  # OneBot V12 protocol configuration
  onebot.v12:
    access_token: 'your_v12_token'
```

## Client SDK Usage

```typescript
import { ImHelper } from 'imhelper';
import { OneBotV11Adapter } from '@imhelper/onebot-v11';

const client = new ImHelper();

// Register OneBot V11 protocol adapter
client.registerAdapter('onebot.v11', OneBotV11Adapter);

// Connect to onebots server
await client.connect({
  platform: 'feishu',
  account_id: 'your_bot_id',
  protocol: 'onebot.v11',
  endpoint: 'ws://localhost:6727/feishu/your_bot_id/onebot/v11/ws',
  access_token: 'your_access_token',
});
```

## Related Links

- [Feishu Adapter Configuration](/en/config/adapter/feishu)
- [Quick Start](/en/guide/start)
- [Client SDK Guide](/en/guide/client-sdk)

