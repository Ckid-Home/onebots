# WhatsApp Adapter Configuration

WhatsApp adapter configuration guide.

## Configuration Fields

### businessAccountId

- **Type**: `string`
- **Required**: ✅
- **Description**: WhatsApp Business Account ID

### phoneNumberId

- **Type**: `string`
- **Required**: ✅
- **Description**: Phone Number ID

### accessToken

- **Type**: `string`
- **Required**: ✅
- **Description**: Access Token (permanent or temporary token)

### webhookVerifyToken

- **Type**: `string`
- **Required**: ✅
- **Description**: Webhook verification token (custom, for verifying webhook requests)

### apiVersion

- **Type**: `string`
- **Default**: `v21.0`
- **Description**: WhatsApp Business API version

### webhook

Webhook configuration.

#### webhook.url

- **Type**: `string`
- **Required**: ❌
- **Description**: Webhook URL

#### webhook.fields

- **Type**: `string[]`
- **Required**: ❌
- **Description**: Subscribed fields list, e.g., `['messages', 'message_status']`

### proxy

- **Type**: `object`
- **Required**: ❌
- **Description**: Proxy configuration (optional)

## Configuration Example

### Basic Configuration

```yaml
whatsapp.my_bot:
  businessAccountId: 'your_business_account_id'
  phoneNumberId: 'your_phone_number_id'
  accessToken: 'your_access_token'
  webhookVerifyToken: 'your_verify_token'
  apiVersion: 'v21.0'
  
  webhook:
    url: 'https://your-domain.com/whatsapp/my_bot/webhook'
    fields: ['messages', 'message_status']
  
  onebot.v11:
    access_token: 'your_token'
```

## Related Links

- [WhatsApp Platform](/en/platform/whatsapp)
- [Quick Start](/en/guide/start)

