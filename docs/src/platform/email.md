# 邮件平台

## 状态

✅ **已实现并可用**

## 简介

邮件适配器支持通过 SMTP 发送邮件和 IMAP 接收邮件，可以将邮件作为消息事件处理。

## 特性

- ✅ SMTP 发送邮件
- ✅ IMAP 接收邮件
- ✅ 支持 HTML 和纯文本邮件
- ✅ 支持附件
- ✅ 支持代理配置
- ✅ 自动轮询新邮件
- ✅ 支持回复邮件

## 安装

```bash
pnpm add @onebots/adapter-email
```

## 配置

### 基础配置

```yaml
email.my_bot:
  # 发件人配置
  from: 'bot@example.com'
  fromName: '我的机器人'  # 可选
  
  # SMTP 配置（发送邮件）
  smtp:
    host: 'smtp.example.com'
    port: 587
    secure: false
    requireTLS: true
    user: 'bot@example.com'
    password: 'your_password'
  
  # IMAP 配置（接收邮件）
  imap:
    host: 'imap.example.com'
    port: 993
    tls: true
    user: 'bot@example.com'
    password: 'your_password'
    pollInterval: 30000  # 轮询间隔（毫秒），默认 30 秒
    mailbox: 'INBOX'    # 监听的邮箱文件夹，默认 INBOX
  
  # 协议配置
  onebot.v11:
    access_token: 'your_token'
```

### Gmail 配置示例

```yaml
email.gmail_bot:
  from: 'your-email@gmail.com'
  fromName: 'Gmail 机器人'
  
  smtp:
    host: 'smtp.gmail.com'
    port: 587
    secure: false
    requireTLS: true
    user: 'your-email@gmail.com'
    password: 'your-app-password'  # 需要使用应用专用密码
  
  imap:
    host: 'imap.gmail.com'
    port: 993
    tls: true
    user: 'your-email@gmail.com'
    password: 'your-app-password'
    pollInterval: 30000
  
  onebot.v11:
    access_token: 'your_token'
```

### QQ 邮箱配置示例

```yaml
email.qq_bot:
  from: 'your-email@qq.com'
  fromName: 'QQ 邮箱机器人'
  
  smtp:
    host: 'smtp.qq.com'
    port: 587
    secure: false
    requireTLS: true
    user: 'your-email@qq.com'
    password: 'your-authorization-code'  # 需要使用授权码
  
  imap:
    host: 'imap.qq.com'
    port: 993
    tls: true
    user: 'your-email@qq.com'
    password: 'your-authorization-code'
    pollInterval: 30000
  
  onebot.v11:
    access_token: 'your_token'
```

## 使用客户端 SDK

```typescript
import { ImHelper } from '@onebots/imhelper';
import { EmailAdapter } from '@onebots/adapter-email';
import { OneBotV11Adapter } from '@onebots/protocol-onebot-v11';

const helper = new ImHelper({
  adapter: new OneBotV11Adapter({
    baseUrl: 'http://localhost:6727',
    basePath: '/email/my_bot/onebot/v11',
    accessToken: 'your_token',
    platform: 'email',
    accountId: 'my_bot',
  }),
});

// 监听邮件消息
helper.on('message', async (message) => {
  console.log('收到邮件:', message.sender.name, message.content);
  
  // 自动回复
  await helper.sendMessage({
    scene_id: message.sender.id,
    scene_type: 'private',
    message: [
      { type: 'text', data: { text: '已收到您的邮件！' } }
    ],
  });
});

await helper.start();
```

## 注意事项

1. **应用专用密码**：某些邮件服务商（如 Gmail）需要使用应用专用密码，而不是普通密码
2. **授权码**：某些邮件服务商（如 QQ 邮箱）需要使用授权码
3. **轮询间隔**：建议设置合理的轮询间隔（如 30 秒），避免过于频繁的请求
4. **代理配置**：如果需要通过代理访问邮件服务器，可以在配置中添加 `proxy` 字段

## 相关链接

- [适配器配置](/config/adapter/email)
- [快速开始](/guide/start)
- [客户端 SDK](/guide/client-sdk)

