# 邮件适配器配置

邮件适配器配置说明。

## 配置项

### from

- **类型**: `string`
- **必填**: ✅
- **说明**: 发件人邮箱地址

### fromName

- **类型**: `string`
- **必填**: ❌
- **说明**: 发件人显示名称（可选）

### smtp

SMTP 配置（发送邮件）。

#### smtp.host

- **类型**: `string`
- **必填**: ✅
- **说明**: SMTP 服务器地址

#### smtp.port

- **类型**: `number`
- **默认值**: `587`
- **说明**: SMTP 端口

#### smtp.secure

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否使用 TLS（端口 465 时设为 true）

#### smtp.requireTLS

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否使用 STARTTLS

#### smtp.user

- **类型**: `string`
- **必填**: ✅
- **说明**: SMTP 用户名（通常是邮箱地址）

#### smtp.password

- **类型**: `string`
- **必填**: ✅
- **说明**: SMTP 密码或应用专用密码

#### smtp.proxy

- **类型**: `object`
- **必填**: ❌
- **说明**: 代理配置（可选）

### imap

IMAP 配置（接收邮件）。

#### imap.host

- **类型**: `string`
- **必填**: ✅
- **说明**: IMAP 服务器地址

#### imap.port

- **类型**: `number`
- **默认值**: `993`
- **说明**: IMAP 端口

#### imap.tls

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否使用 TLS

#### imap.user

- **类型**: `string`
- **必填**: ✅
- **说明**: IMAP 用户名（通常是邮箱地址）

#### imap.password

- **类型**: `string`
- **必填**: ✅
- **说明**: IMAP 密码或应用专用密码

#### imap.pollInterval

- **类型**: `number`
- **默认值**: `30000`
- **说明**: 轮询间隔（毫秒）

#### imap.mailbox

- **类型**: `string`
- **默认值**: `INBOX`
- **说明**: 监听的邮箱文件夹

#### imap.proxy

- **类型**: `object`
- **必填**: ❌
- **说明**: 代理配置（可选）

## 配置示例

### 基础配置

```yaml
email.my_bot:
  from: 'bot@example.com'
  fromName: '我的机器人'
  
  smtp:
    host: 'smtp.example.com'
    port: 587
    secure: false
    requireTLS: true
    user: 'bot@example.com'
    password: 'your_password'
  
  imap:
    host: 'imap.example.com'
    port: 993
    tls: true
    user: 'bot@example.com'
    password: 'your_password'
    pollInterval: 30000
    mailbox: 'INBOX'
```

### Gmail 配置

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
    password: 'your-app-password'
  
  imap:
    host: 'imap.gmail.com'
    port: 993
    tls: true
    user: 'your-email@gmail.com'
    password: 'your-app-password'
    pollInterval: 30000
```

### QQ 邮箱配置

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
    password: 'your-authorization-code'
  
  imap:
    host: 'imap.qq.com'
    port: 993
    tls: true
    user: 'your-email@qq.com'
    password: 'your-authorization-code'
    pollInterval: 30000
```

## 获取应用凭证

### Gmail

1. 访问 [Google Account](https://myaccount.google.com/)
2. 启用"两步验证"
3. 生成"应用专用密码"
4. 使用应用专用密码作为 `smtp.password` 和 `imap.password`

### QQ 邮箱

1. 访问 [QQ 邮箱设置](https://mail.qq.com/)
2. 开启"POP3/SMTP 服务"或"IMAP/SMTP 服务"
3. 生成"授权码"
4. 使用授权码作为 `smtp.password` 和 `imap.password`

## 相关链接

- [适配器配置指南](/guide/adapter)
- [邮件平台文档](/platform/email)

