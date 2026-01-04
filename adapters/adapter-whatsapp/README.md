# @onebots/adapter-whatsapp

onebots WhatsApp 适配器，基于 WhatsApp Business API (Meta Graph API)。

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

## 配置

### 前置要求

1. **创建 Meta 应用**
   - 访问 [Meta for Developers](https://developers.facebook.com/)
   - 创建应用并添加 WhatsApp 产品

2. **获取凭证**
   - Business Account ID
   - Phone Number ID
   - Access Token（永久令牌或临时令牌）
   - Webhook Verify Token

3. **配置 Webhook**
   - 设置 Webhook URL: `https://your-domain.com/whatsapp/{account_id}/webhook`
   - 订阅字段: `messages`, `message_status`

### 配置示例

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
  
  # 代理配置（可选）
  proxy:
    url: 'http://127.0.0.1:7890'
  
  # 协议配置
  onebot.v11:
    access_token: 'your_token'
```

## 使用示例

### 发送消息

通过 OneBot 协议发送消息：

```javascript
// 发送文本消息
await bot.sendMessage('8613800138000', {
  scene_id: bot.createId('8613800138000'),
  scene_type: 'private',
  message: [
    { type: 'text', data: { text: 'Hello from WhatsApp!' } }
  ]
});

// 发送图片
await bot.sendMessage('8613800138000', {
  scene_id: bot.createId('8613800138000'),
  scene_type: 'private',
  message: [
    { 
      type: 'image', 
      data: { 
        url: 'https://example.com/image.jpg',
        caption: 'Image caption'
      } 
    }
  ]
});
```

### 接收消息

适配器会自动接收 Webhook 事件并转换为消息事件：

```javascript
bot.on('message', (event) => {
  if (event.platform === 'whatsapp') {
    console.log('收到 WhatsApp 消息:', event.sender.name, event.message);
  }
});
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

## 相关链接

- [WhatsApp Business API 文档](https://developers.facebook.com/docs/whatsapp)
- [Meta Graph API 文档](https://developers.facebook.com/docs/graph-api)
- [适配器配置指南](/guide/adapter)
- [WhatsApp 平台文档](/platform/whatsapp)

