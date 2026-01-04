# Email Adapter Configuration

Email adapter configuration guide.

## Configuration Fields

### from

- **Type**: `string`
- **Required**: ✅
- **Description**: Sender email address

### fromName

- **Type**: `string`
- **Required**: ❌
- **Description**: Sender display name (optional)

### smtp

SMTP configuration (sending emails).

#### smtp.host

- **Type**: `string`
- **Required**: ✅
- **Description**: SMTP server address

#### smtp.port

- **Type**: `number`
- **Default**: `587`
- **Description**: SMTP port

#### smtp.secure

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to use TLS (set to true for port 465)

#### smtp.requireTLS

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to use STARTTLS

#### smtp.user

- **Type**: `string`
- **Required**: ✅
- **Description**: SMTP username (usually email address)

#### smtp.password

- **Type**: `string`
- **Required**: ✅
- **Description**: SMTP password or app-specific password

#### smtp.proxy

- **Type**: `object`
- **Required**: ❌
- **Description**: Proxy configuration (optional)

### imap

IMAP configuration (receiving emails).

#### imap.host

- **Type**: `string`
- **Required**: ✅
- **Description**: IMAP server address

#### imap.port

- **Type**: `number`
- **Default**: `993`
- **Description**: IMAP port

#### imap.tls

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to use TLS

#### imap.user

- **Type**: `string`
- **Required**: ✅
- **Description**: IMAP username (usually email address)

#### imap.password

- **Type**: `string`
- **Required**: ✅
- **Description**: IMAP password or app-specific password

#### imap.pollInterval

- **Type**: `number`
- **Default**: `30000`
- **Description**: Polling interval (milliseconds)

#### imap.mailbox

- **Type**: `string`
- **Default**: `INBOX`
- **Description**: Mailbox folder to monitor

#### imap.proxy

- **Type**: `object`
- **Required**: ❌
- **Description**: Proxy configuration (optional)

## Configuration Example

### Basic Configuration

```yaml
email.my_bot:
  from: 'bot@example.com'
  fromName: 'My Bot'
  
  smtp:
    host: 'smtp.example.com'
    port: 587
    secure: false
    requireTLS: true
    user: 'bot@example.com'
    password: 'your_password'
  
  imap:
    host: 'imap.example.com'
    port: 993
    tls: true
    user: 'bot@example.com'
    password: 'your_password'
    pollInterval: 30000
    mailbox: 'INBOX'
```

### Gmail Configuration

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
    password: 'your-app-password'
  
  imap:
    host: 'imap.gmail.com'
    port: 993
    tls: true
    user: 'your-email@gmail.com'
    password: 'your-app-password'
    pollInterval: 30000
```

## Related Links

- [Email Platform](/en/platform/email)
- [Quick Start](/en/guide/start)

