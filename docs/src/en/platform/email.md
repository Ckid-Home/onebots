# Email Platform

## Status

✅ **Implemented and Available**

## Introduction

The email adapter supports sending emails via SMTP and receiving emails via IMAP, allowing emails to be processed as message events.

## Features

- ✅ SMTP email sending
- ✅ IMAP email receiving
- ✅ Support for HTML and plain text emails
- ✅ Support for attachments
- ✅ Support for proxy configuration
- ✅ Automatic polling for new emails
- ✅ Support for email replies

## Installation

```bash
pnpm add @onebots/adapter-email
```

## Configuration

### Basic Configuration

```yaml
email.my_bot:
  # Sender configuration
  from: 'bot@example.com'
  fromName: 'My Bot'  # Optional
  
  # SMTP configuration (sending emails)
  smtp:
    host: 'smtp.example.com'
    port: 587
    secure: false
    requireTLS: true
    user: 'bot@example.com'
    password: 'your_password'
  
  # IMAP configuration (receiving emails)
  imap:
    host: 'imap.example.com'
    port: 993
    tls: true
    user: 'bot@example.com'
    password: 'your_password'
    pollInterval: 30000  # Polling interval (ms), default 30 seconds
    mailbox: 'INBOX'    # Mailbox folder to monitor, default INBOX
  
  # Protocol configuration
  onebot.v11:
    access_token: 'your_token'
```

### Gmail Configuration Example

```yaml
email.gmail_bot:
  from: 'your-email@gmail.com'
  fromName: 'Gmail Bot'
  
  smtp:
    host: 'smtp.gmail.com'
    port: 587
    secure: false
    requireTLS: true
    user: 'your-email@gmail.com'
    password: 'your-app-password'  # Requires app-specific password
  
  imap:
    host: 'imap.gmail.com'
    port: 993
    tls: true
    user: 'your-email@gmail.com'
    password: 'your-app-password'
    pollInterval: 30000
  
  onebot.v11:
    access_token: 'your_token'
```

## Using Client SDK

```typescript
import { ImHelper } from '@onebots/imhelper';
import { EmailAdapter } from '@onebots/adapter-email';
import { OneBotV11Adapter } from '@onebots/protocol-onebot-v11';

const helper = new ImHelper({
  adapter: new OneBotV11Adapter({
    baseUrl: 'http://localhost:6727',
    basePath: '/email/my_bot/onebot/v11',
    accessToken: 'your_token',
    platform: 'email',
    accountId: 'my_bot',
  }),
});

// Listen for email messages
helper.on('message', async (message) => {
  console.log('Received email:', message.sender.name, message.content);
  
  // Auto-reply
  await helper.sendMessage({
    scene_id: message.sender.id,
    scene_type: 'private',
    message: [
      { type: 'text', data: { text: 'Email received!' } }
    ],
  });
});

await helper.start();
```

## Notes

1. **App-specific passwords**: Some email providers (e.g., Gmail) require app-specific passwords instead of regular passwords
2. **Authorization codes**: Some email providers (e.g., QQ Mail) require authorization codes
3. **Polling interval**: It's recommended to set a reasonable polling interval (e.g., 30 seconds) to avoid too frequent requests
4. **Proxy configuration**: If you need to access email servers through a proxy, you can add a `proxy` field to the configuration

## Related Links

- [Adapter Configuration](/en/config/adapter/email)
- [Quick Start](/en/guide/start)
- [Client SDK](/en/guide/client-sdk)

