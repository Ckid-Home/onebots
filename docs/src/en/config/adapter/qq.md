# QQ Adapter Configuration

QQ Official Bot adapter configuration guide.

## Configuration Format

```yaml
qq.{account_id}:
  # QQ platform configuration
  appId: 'your_app_id'           # Required: QQ Bot AppID
  secret: 'your_secret'           # Required: QQ Bot Secret
  token: 'your_token'             # Required: QQ Bot Token
  mode: 'websocket'               # Optional: Connection mode, 'websocket' (default) or 'webhook'
  sandbox: false                  # Optional: Whether sandbox environment, default false
  removeAt: true                  # Optional: Whether to automatically remove @bot content, default true
  maxRetry: 10                    # Optional: Maximum reconnection attempts (WebSocket mode only), default 10
  intents:                        # Optional: Events to listen to (WebSocket mode only)
    - 'GROUP_AT_MESSAGE_CREATE'
    - 'C2C_MESSAGE_CREATE'
    - 'DIRECT_MESSAGE'
    - 'GUILDS'
    - 'GUILD_MEMBERS'
    - 'GUILD_MESSAGE_REACTIONS'
    - 'INTERACTION'
    - 'PUBLIC_GUILD_MESSAGES'
  
  # Protocol configuration
  onebot.v11:
    access_token: 'your_v11_token'
  onebot.v12:
    access_token: 'your_v12_token'
```

## Configuration Fields

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| `appId` | string | Yes | QQ Bot AppID | - |
| `secret` | string | Yes | QQ Bot Secret | - |
| `token` | string | Yes | QQ Bot Token | - |
| `mode` | string | No | Connection mode: `websocket` (default) or `webhook` | `websocket` |
| `sandbox` | boolean | No | Whether sandbox environment | `false` |
| `removeAt` | boolean | No | Whether to automatically remove @bot content | `true` |
| `maxRetry` | number | No | Maximum reconnection attempts (WebSocket mode only) | `10` |
| `intents` | string[] | No | Events to listen to (WebSocket mode only) | `[]` |

## Intent Description

Intent is QQ official configuration, refer to the following table for values:

| Value | Description |
|-------|-------------|
| `GROUP_AT_MESSAGE_CREATE` | Group @ event, comment if no group permission |
| `C2C_MESSAGE_CREATE` | Private chat event, comment if no private chat permission |
| `DIRECT_MESSAGE` | Channel direct message event |
| `GUILD_MESSAGES` | Private bot channel message event, comment for public bot |
| `PUBLIC_GUILD_MESSAGES` | Public bot channel message event, comment for private bot |
| `GUILDS` | Channel change event |
| `GUILD_MEMBERS` | Channel member change event |
| `GUILD_MESSAGE_REACTIONS` | Channel message reaction event |
| `INTERACTION` | Interaction event |
| `MESSAGE_AUDIT` | Message audit event |
| `FORUMS` | Forum event |
| `AUDIO_ACTION` | Audio action event |
| `AT_MESSAGES` | @ message event |

## Related Links

- [QQ Platform](/en/platform/qq)
- [Quick Start](/en/guide/start)

