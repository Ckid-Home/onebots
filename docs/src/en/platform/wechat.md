# WeChat Adapter

The WeChat adapter supports connecting to onebots service through WeChat Official Account API.

## Status

✅ **Implemented and Available**

## Features

- ✅ WeChat Official Account Messages
- ✅ Text, Image, Video, Audio Messages
- ✅ Rich Media Messages
- ✅ Event Subscriptions
- ✅ Menu Interactions

## Installation

```bash
npm install @onebots/adapter-wechat
# or
pnpm add @onebots/adapter-wechat
```

## Configuration Example

```yaml
wechat.my_official_account:
  # Protocol configuration
  onebot.v11:
    use_http: true
    use_ws: true
    access_token: 'your_token'
  
  # WeChat platform configuration
  appid: 'your_app_id'
  appsecret: 'your_app_secret'
  token: 'your_token'
  encoding_aes_key: 'your_aes_key'  # Optional, for encryption mode
  encrypt_mode: 'plain'             # 'plain', 'compatible', or 'safe'
```

## Webhook Configuration

Configure the webhook URL in WeChat Public Platform:

```
http://your-domain:6727/wechat/{account_id}/webhook
```

For example:
```
http://bot.example.com:6727/wechat/my_official_account/webhook
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
  platform: 'wechat',
  account_id: 'my_official_account',
  protocol: 'onebot.v11',
  endpoint: 'ws://localhost:6727/wechat/my_official_account/onebot/v11/ws',
  access_token: 'your_access_token',
});

// Listen for messages
client.on('message', (message) => {
  console.log(`Received message: ${message.content}`);
  // Auto reply
  message.reply('Hello from WeChat bot!');
});
```

## Related Links

- [WeChat Adapter Configuration](/en/config/adapter/wechat)
- [Quick Start](/en/guide/start)
- [Client SDK Guide](/en/guide/client-sdk)

