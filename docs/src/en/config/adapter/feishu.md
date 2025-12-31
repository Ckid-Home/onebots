# Feishu Adapter Configuration

Feishu adapter configuration guide.

## Configuration Fields

### app_id

- **Type**: `string`
- **Required**: ✅
- **Description**: Feishu App ID

### app_secret

- **Type**: `string`
- **Required**: ✅
- **Description**: Feishu App Secret

### encrypt_key

- **Type**: `string`
- **Required**: ❌
- **Description**: Event encryption key (required when encryption mode is enabled)

### verification_token

- **Type**: `string`
- **Required**: ❌
- **Description**: Event verification Token

## Configuration Example

```yaml
feishu.my_bot:
  app_id: 'cli_xxxxxxxxxxxxx'
  app_secret: 'your_app_secret'
  encrypt_key: 'your_encrypt_key'  # Optional
  verification_token: 'your_verification_token'  # Optional
```

## Getting App Credentials

1. Visit [Feishu Open Platform](https://open.feishu.cn/)
2. Create an enterprise self-built app
3. Get `App ID` and `App Secret` from "App Information"
4. Configure Webhook URL in "Event Subscription": `http://your-server:port/feishu/{account_id}/webhook`
5. Get `Encrypt Key` and `Verification Token` (if encryption is enabled)
6. Configure app permissions (message sending/receiving, contacts, etc.)

## Related Links

- [Feishu Platform](/en/platform/feishu)
- [Quick Start](/en/guide/start)

