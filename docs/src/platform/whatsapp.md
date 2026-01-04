# WhatsApp 平台

## 状态

✅ **已实现并可用**

## 简介

WhatsApp 适配器基于 WhatsApp Business API (Meta Graph API)，支持通过官方 API 发送和接收消息。

参考 [Satori WhatsApp 适配器](https://github.com/satorijs/satori/tree/main/adapters/whatsapp) 实现。

## 特性

- ✅ 消息发送与接收
- ✅ 支持文本、图片、视频、音频、文档、位置等消息类型
- ✅ Webhook 事件处理
- ✅ 消息状态跟踪
- ✅ 媒体文件下载
- ✅ 代理配置支持

## 安装

```bash
pnpm add @onebots/adapter-whatsapp
```

## 前置要求

### 1. 创建 Meta 应用

1. 访问 [Meta for Developers](https://developers.facebook.com/)
2. 创建应用并添加 WhatsApp 产品
3. 完成企业认证（如需要）

### 2. 获取凭证

需要获取以下凭证：

- **Business Account ID**: WhatsApp Business Account ID
- **Phone Number ID**: 电话号码 ID
- **Access Token**: 永久令牌或临时令牌
- **Webhook Verify Token**: Webhook 验证令牌（自定义）

### 3. 配置 Webhook

1. 在 Meta 开发者控制台配置 Webhook URL：
   ```
   https://your-domain.com/whatsapp/{account_id}/webhook
   ```
2. 订阅字段：`messages`, `message_status`

## 配置

### 基础配置

```yaml
whatsapp.my_bot:
  # WhatsApp Business API 配置
  businessAccountId: 'your_business_account_id'
  phoneNumberId: 'your_phone_number_id'
  accessToken: 'your_access_token'
  webhookVerifyToken: 'your_verify_token'
  apiVersion: 'v21.0'  # 可选，默认 v21.0
  
  # Webhook 配置
  webhook:
    url: 'https://your-domain.com/whatsapp/my_bot/webhook'
    fields: ['messages', 'message_status']
  
  # 协议配置
  onebot.v11:
    access_token: 'your_token'
```

### 配置项说明

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `businessAccountId` | string | 是 | WhatsApp Business Account ID |
| `phoneNumberId` | string | 是 | Phone Number ID |
| `accessToken` | string | 是 | Access Token |
| `webhookVerifyToken` | string | 是 | Webhook 验证令牌 |
| `apiVersion` | string | 否 | API 版本，默认 v21.0 |
| `webhook.url` | string | 否 | Webhook URL |
| `webhook.fields` | string[] | 否 | 订阅的字段列表 |
| `proxy` | object | 否 | 代理配置 |

## 使用客户端 SDK

```typescript
import { ImHelper } from '@onebots/imhelper';
import { OneBotV11Adapter } from '@onebots/protocol-onebot-v11';

const helper = new ImHelper({
  adapter: new OneBotV11Adapter({
    baseUrl: 'http://localhost:6727',
    basePath: '/whatsapp/my_bot/onebot/v11',
    accessToken: 'your_token',
    platform: 'whatsapp',
    accountId: 'my_bot',
  }),
});

// 监听消息
helper.on('message', async (message) => {
  console.log('收到 WhatsApp 消息:', message.sender.name, message.content);
  
  // 自动回复
  await helper.sendMessage({
    scene_id: message.sender.id,
    scene_type: 'private',
    message: [
      { type: 'text', data: { text: '已收到您的消息！' } }
    ],
  });
});

await helper.start();
```

## 消息类型支持

| 消息类型 | 支持 | 说明 |
|---------|------|------|
| 文本 | ✅ | 支持纯文本消息 |
| 图片 | ✅ | 支持图片和图片说明 |
| 视频 | ✅ | 支持视频和视频说明 |
| 音频 | ✅ | 支持音频消息 |
| 文档 | ✅ | 支持文档和文档说明 |
| 位置 | ✅ | 支持位置信息 |
| 联系人 | ✅ | 支持联系人卡片 |
| 模板消息 | ✅ | 支持 WhatsApp 模板消息 |

## 注意事项

1. **电话号码格式**：必须包含国家代码，例如 `8613800138000`（中国）
2. **消息模板**：业务发起的消息需要使用预审核的模板
3. **24小时窗口**：用户主动发送消息后，24小时内可以自由回复
4. **Webhook 验证**：必须正确配置 Webhook 验证令牌
5. **API 限制**：注意 WhatsApp API 的速率限制和配额
6. **企业认证**：某些功能需要完成 Meta 企业认证

## 相关链接

- [适配器配置](/config/adapter/whatsapp)
- [快速开始](/guide/start)
- [客户端 SDK](/guide/client-sdk)
- [WhatsApp Business API 文档](https://developers.facebook.com/docs/whatsapp)

