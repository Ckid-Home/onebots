# WeCom Adapter Configuration

WeCom (Enterprise WeChat) adapter configuration guide.

## Configuration Fields

### corp_id

- **Type**: `string`
- **Required**: ✅
- **Description**: Enterprise ID (CorpID)

### corp_secret

- **Type**: `string`
- **Required**: ✅
- **Description**: App Secret (CorpSecret)

### agent_id

- **Type**: `string`
- **Required**: ✅
- **Description**: App AgentId

### token

- **Type**: `string`
- **Required**: ❌
- **Description**: Callback verification Token

### encoding_aes_key

- **Type**: `string`
- **Required**: ❌
- **Description**: Message encryption/decryption key (required when encryption mode is enabled)

## Configuration Example

```yaml
wecom.my_bot:
  corp_id: 'ww1234567890abcdef'
  corp_secret: 'your_corp_secret'
  agent_id: '1000001'
  token: 'your_token'  # Optional
  encoding_aes_key: 'your_encoding_aes_key'  # Optional
```

## Related Links

- [WeCom Platform](/en/platform/wecom)
- [Quick Start](/en/guide/start)

