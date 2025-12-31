# 飞书适配器配置

飞书适配器配置说明。

## 配置项

### app_id

- **类型**: `string`
- **必填**: ✅
- **说明**: 飞书应用 App ID

### app_secret

- **类型**: `string`
- **必填**: ✅
- **说明**: 飞书应用 App Secret

### encrypt_key

- **类型**: `string`
- **必填**: ❌
- **说明**: 事件加密密钥（启用加密模式时必填）

### verification_token

- **类型**: `string`
- **必填**: ❌
- **说明**: 事件验证 Token

## 配置示例

```yaml
feishu.my_bot:
  app_id: 'cli_xxxxxxxxxxxxx'
  app_secret: 'your_app_secret'
  encrypt_key: 'your_encrypt_key'  # 可选
  verification_token: 'your_verification_token'  # 可选
```

## 获取应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 在"应用信息"中获取 `App ID` 和 `App Secret`
4. 在"事件订阅"中配置 Webhook URL：`http://your-server:port/feishu/{account_id}/webhook`
5. 获取 `Encrypt Key` 和 `Verification Token`（如果启用加密）
6. 配置应用权限（消息收发、通讯录等）

## Webhook 地址

配置事件订阅 URL 为：

```
http://your-domain:port/feishu/{account_id}/webhook
```

例如：
```
http://bot.example.com:6727/feishu/my_bot/webhook
```

## 相关链接

- [适配器配置指南](/guide/adapter)
- [飞书平台文档](/platform/feishu)

