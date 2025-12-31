# WeCom Adapter

The WeCom (Enterprise WeChat) adapter is fully implemented and supports connecting to onebots service through WeCom app.

## Status

✅ **Implemented and Available**

## Features

- ✅ **App Message Push**
  - Text messages
  - Image messages
  - Video messages
  - File messages
  - Text cards
  - Markdown messages
  - Image-text messages
- ✅ **Contact Management**
  - Get user information
  - Get department list
  - Get department member list
- ✅ **Event Subscription**
  - Contact change events (user create/update/delete)
  - App message callbacks

## Installation

```bash
npm install @onebots/adapter-wecom
# or
pnpm add @onebots/adapter-wecom
```

## Configuration

Configure WeCom account in `config.yaml`:

```yaml
# WeCom app configuration
wecom.your_bot_id:
  # WeCom platform configuration
  corp_id: 'your_corp_id'  # Enterprise ID, required
  corp_secret: 'your_corp_secret'  # App Secret, required
  agent_id: 'your_agent_id'  # App AgentId, required
  token: 'your_token'  # Optional, callback verification Token
  encoding_aes_key: 'your_encoding_aes_key'  # Optional, message encryption/decryption key
  
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
  platform: 'wecom',
  account_id: 'your_bot_id',
  protocol: 'onebot.v11',
  endpoint: 'ws://localhost:6727/wecom/your_bot_id/onebot/v11/ws',
  access_token: 'your_access_token',
});
```

## Related Links

- [WeCom Adapter Configuration](/en/config/adapter/wecom)
- [Quick Start](/en/guide/start)
- [Client SDK Guide](/en/guide/client-sdk)

