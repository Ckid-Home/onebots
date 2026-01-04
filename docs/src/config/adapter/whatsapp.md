# WhatsApp 适配器配置

WhatsApp 适配器配置说明。

## 配置项

### businessAccountId

- **类型**: `string`
- **必填**: ✅
- **说明**: WhatsApp Business Account ID

### phoneNumberId

- **类型**: `string`
- **必填**: ✅
- **说明**: Phone Number ID

### accessToken

- **类型**: `string`
- **必填**: ✅
- **说明**: Access Token（永久令牌或临时令牌）

### webhookVerifyToken

- **类型**: `string`
- **必填**: ✅
- **说明**: Webhook 验证令牌（自定义，用于验证 Webhook 请求）

### apiVersion

- **类型**: `string`
- **默认值**: `v21.0`
- **说明**: WhatsApp Business API 版本

### webhook

Webhook 配置。

#### webhook.url

- **类型**: `string`
- **必填**: ❌
- **说明**: Webhook URL

#### webhook.fields

- **类型**: `string[]`
- **必填**: ❌
- **说明**: 订阅的字段列表，如 `['messages', 'message_status']`

### proxy

- **类型**: `object`
- **必填**: ❌
- **说明**: 代理配置（可选）

## 配置示例

### 基础配置

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

### 带代理的配置

```yaml
whatsapp.my_bot:
  businessAccountId: 'your_business_account_id'
  phoneNumberId: 'your_phone_number_id'
  accessToken: 'your_access_token'
  webhookVerifyToken: 'your_verify_token'
  
  proxy:
    url: 'http://127.0.0.1:7890'
    username: 'proxy_user'  # 可选
    password: 'proxy_pass'  # 可选
  
  onebot.v11:
    access_token: 'your_token'
```

## 获取应用凭证

### 1. 创建 Meta 应用

1. 访问 [Meta for Developers](https://developers.facebook.com/)
2. 创建应用并添加 WhatsApp 产品
3. 完成企业认证（如需要）

### 2. 获取凭证

在 Meta 开发者控制台获取：

- **Business Account ID**: WhatsApp Business Account ID
- **Phone Number ID**: 电话号码 ID
- **Access Token**: 永久令牌或临时令牌
- **Webhook Verify Token**: 自定义验证令牌

### 3. 配置 Webhook

1. 在 Meta 开发者控制台配置 Webhook URL：
   ```
   https://your-domain.com/whatsapp/{account_id}/webhook
   ```
2. 订阅字段：`messages`, `message_status`
3. 验证 Webhook（系统会自动处理）

## 相关链接

- [适配器配置指南](/guide/adapter)
- [WhatsApp 平台文档](/platform/whatsapp)

