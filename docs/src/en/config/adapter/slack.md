# Slack Adapter Configuration

Slack adapter configuration guide.

## Configuration Fields

### token

- **Type**: `string`
- **Required**: ✅
- **Description**: Slack Bot Token (format: `xoxb-...`)

### signing_secret

- **Type**: `string`
- **Required**: ❌
- **Description**: Signing Secret (for verifying Events API requests)

### app_token

- **Type**: `string`
- **Required**: ❌
- **Description**: App-Level Token (format: `xapp-...`, for Socket Mode)

### socket_mode

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to use Socket Mode (requires app_token)

## Configuration Example

### Basic Configuration (Events API)

```yaml
slack.my_bot:
  token: 'xoxb-your-bot-token'
  signing_secret: 'your_signing_secret'  # Optional, but recommended
```

### Socket Mode Configuration

```yaml
slack.my_bot:
  token: 'xoxb-your-bot-token'
  app_token: 'xapp-your-app-token'
  socket_mode: true
```

## Related Links

- [Slack Platform](/en/platform/slack)
- [Quick Start](/en/guide/start)

