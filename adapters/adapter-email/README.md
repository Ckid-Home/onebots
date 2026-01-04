# @onebots/adapter-email

onebots 邮件适配器，支持通过 SMTP 发送邮件和 IMAP 接收邮件。

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

## 使用示例

### 发送邮件

通过 OneBot 协议发送邮件：

```javascript
// 发送邮件到 user@example.com
await bot.sendMessage('user@example.com', {
  scene_id: bot.createId('user@example.com'),
  scene_type: 'private',
  message: [
    { type: 'text', data: { text: '这是一封测试邮件' } }
  ]
});
```

### 接收邮件

邮件适配器会自动轮询新邮件，并将邮件转换为消息事件：

```javascript
bot.on('message', (event) => {
  if (event.platform === 'email') {
    console.log('收到邮件:', event.sender.name, event.message);
  }
});
```

## 支持的邮件服务商

### Gmail

```yaml
smtp:
  host: 'smtp.gmail.com'
  port: 587
  user: 'your-email@gmail.com'
  password: 'your-app-password'  # 需要使用应用专用密码

imap:
  host: 'imap.gmail.com'
  port: 993
  user: 'your-email@gmail.com'
  password: 'your-app-password'
```

### Outlook/Hotmail

```yaml
smtp:
  host: 'smtp-mail.outlook.com'
  port: 587
  user: 'your-email@outlook.com'
  password: 'your-password'

imap:
  host: 'outlook.office365.com'
  port: 993
  user: 'your-email@outlook.com'
  password: 'your-password'
```

### QQ 邮箱

```yaml
smtp:
  host: 'smtp.qq.com'
  port: 587
  user: 'your-email@qq.com'
  password: 'your-authorization-code'  # 需要使用授权码

imap:
  host: 'imap.qq.com'
  port: 993
  user: 'your-email@qq.com'
  password: 'your-authorization-code'
```

## 注意事项

1. **应用专用密码**：某些邮件服务商（如 Gmail）需要使用应用专用密码，而不是普通密码
2. **授权码**：某些邮件服务商（如 QQ 邮箱）需要使用授权码
3. **轮询间隔**：建议设置合理的轮询间隔，避免过于频繁的请求
4. **代理配置**：如果需要通过代理访问邮件服务器，可以在配置中添加 `proxy` 字段

## 相关链接

- [适配器配置指南](/guide/adapter)
- [邮件平台文档](/platform/email)

