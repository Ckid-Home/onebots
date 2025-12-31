# Platform Configuration

Platform configuration is used to set authentication information and platform-specific parameters for platform bots.

## Configuration Format

Platform configuration uses the `{platform}.{account_id}` format:

```yaml
{platform}.{account_id}:
  # Platform-specific configuration
  platform_param1: value1
  platform_param2: value2
  
  # Protocol configuration (optional, overrides general)
  {protocol}.{version}:
    protocol_param: value
```

## WeChat Platform

### Configuration Fields

#### appid

- **Type**: `string`
- **Required**: ✅
- **Description**: WeChat Official Account AppID

#### appsecret

- **Type**: `string`
- **Required**: ✅
- **Description**: WeChat Official Account AppSecret

#### token

- **Type**: `string`
- **Required**: ✅
- **Description**: Server configuration Token (must match public platform settings)

#### encoding_aes_key

- **Type**: `string`
- **Required**: ❌
- **Description**: Message encryption/decryption key (required when encryption mode is enabled)

#### encrypt_mode

- **Type**: `string`
- **Values**: `plain` | `compatible` | `safe`
- **Default**: `plain`
- **Description**: Message encryption/decryption mode
  - `plain`: Plain text mode
  - `compatible`: Compatible mode
  - `safe`: Safe mode (encrypted)

### Configuration Example

```yaml
wechat.my_official_account:
  # WeChat platform configuration
  appid: wx1234567890abcdef
  appsecret: your_app_secret_here
  token: your_token_here
  encoding_aes_key: your_aes_key_here
  encrypt_mode: safe
  
  # Protocol configuration
  onebot.v11:
    use_http: true
    use_ws: true
```

### Getting Configuration Information

1. Log in to [WeChat Public Platform](https://mp.weixin.qq.com/)
2. Development → Basic Configuration
   - Get **AppID** and **AppSecret**
   - Set **Server Configuration**

### Webhook URL

Configure server URL as:
```
http://your-domain:6727/wechat/{account_id}/webhook
```

For example:
```
http://bot.example.com:6727/wechat/my_official_account/webhook
```

## QQ Platform

✅ **Implemented**

### Configuration Fields

#### appId

- **Type**: `string`
- **Required**: ✅
- **Description**: QQ Bot AppID

#### secret

- **Type**: `string`
- **Required**: ✅
- **Description**: QQ Bot Secret

#### mode

- **Type**: `string`
- **Values**: `websocket` | `webhook`
- **Default**: `websocket`
- **Description**: Event receiving mode

#### sandbox

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to use sandbox environment

### Configuration Example

```yaml
qq.my_bot:
  # Protocol configuration
  onebot.v11:
    use_http: true
    use_ws: true
  
  # QQ platform configuration
  appId: your_app_id
  secret: your_app_secret
  mode: websocket
  sandbox: false
```

## Other Platforms

For configuration details of other platforms, see:

- [QQ Platform](/en/platform/qq)
- [Kook Platform](/en/platform/kook)
- [Discord Platform](/en/platform/discord)
- [DingTalk Platform](/en/platform/dingtalk)
- [Telegram Platform](/en/platform/telegram)
- [Feishu Platform](/en/platform/feishu)
- [Slack Platform](/en/platform/slack)
- [WeCom Platform](/en/platform/wecom)
- [Microsoft Teams Platform](/en/platform/teams)

## Related Links

- [Global Configuration](/en/config/global)
- [General Configuration](/en/config/general)
- [Protocol Configuration](/en/config/protocol)

