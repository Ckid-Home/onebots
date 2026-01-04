# WhatsApp Platform

## Status

✅ **Implemented and Available**

## Introduction

The WhatsApp adapter is based on WhatsApp Business API (Meta Graph API), supporting sending and receiving messages through the official API.

Implementation references [Satori WhatsApp adapter](https://github.com/satorijs/satori/tree/main/adapters/whatsapp).

## Features

- ✅ Message sending and receiving
- ✅ Support for text, image, video, audio, document, location message types
- ✅ Webhook event handling
- ✅ Message status tracking
- ✅ Media file download
- ✅ Proxy configuration support

## Installation

```bash
pnpm add @onebots/adapter-whatsapp
```

## Prerequisites

### 1. Create Meta App

1. Visit [Meta for Developers](https://developers.facebook.com/)
2. Create an app and add WhatsApp product
3. Complete business verification (if required)

### 2. Get Credentials

You need to obtain the following credentials:

- **Business Account ID**: WhatsApp Business Account ID
- **Phone Number ID**: Phone Number ID
- **Access Token**: Permanent or temporary token
- **Webhook Verify Token**: Webhook verification token (custom)

### 3. Configure Webhook

1. Configure Webhook URL in Meta Developer Console:
   ```
   https://your-domain.com/whatsapp/{account_id}/webhook
   ```
2. Subscribe to fields: `messages`, `message_status`

## Configuration

### Basic Configuration

```yaml
whatsapp.my_bot:
  # WhatsApp Business API configuration
  businessAccountId: 'your_business_account_id'
  phoneNumberId: 'your_phone_number_id'
  accessToken: 'your_access_token'
  webhookVerifyToken: 'your_verify_token'
  apiVersion: 'v21.0'  # Optional, default v21.0
  
  # Webhook configuration
  webhook:
    url: 'https://your-domain.com/whatsapp/my_bot/webhook'
    fields: ['messages', 'message_status']
  
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
    basePath: '/whatsapp/my_bot/onebot/v11',
    accessToken: 'your_token',
    platform: 'whatsapp',
    accountId: 'my_bot',
  }),
});

// Listen for messages
helper.on('message', async (message) => {
  console.log('Received WhatsApp message:', message.sender.name, message.content);
  
  // Auto-reply
  await helper.sendMessage({
    scene_id: message.sender.id,
    scene_type: 'private',
    message: [
      { type: 'text', data: { text: 'Message received!' } }
    ],
  });
});

await helper.start();
```

## Notes

1. **Phone Number Format**: Must include country code, e.g., `8613800138000` (China)
2. **Message Templates**: Business-initiated messages require pre-approved templates
3. **24-Hour Window**: Free replies within 24 hours after user-initiated messages
4. **Webhook Verification**: Must correctly configure webhook verification token
5. **API Limits**: Pay attention to WhatsApp API rate limits and quotas
6. **Business Verification**: Some features require Meta business verification

## Related Links

- [Adapter Configuration](/en/config/adapter/whatsapp)
- [Quick Start](/en/guide/start)
- [Client SDK](/en/guide/client-sdk)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)

