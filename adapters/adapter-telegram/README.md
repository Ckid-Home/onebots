# @onebots/adapter-telegram

onebots Telegram 适配器，支持代理访问。

## 安装

```bash
npm install @onebots/adapter-telegram grammy
# 或
pnpm add @onebots/adapter-telegram grammy
```

## 配置

在 `config.yaml` 中配置：

```yaml
telegram.your_bot_id:
  token: "YOUR_BOT_TOKEN"
  
  # 代理配置（可选，用于访问 Telegram API）
  proxy:
    url: "http://127.0.0.1:7890"  # 或 socks5://127.0.0.1:1080
    # username: "user"  # 可选
    # password: "pass"  # 可选
  
  # 轮询模式（默认）
  polling:
    enabled: true
    timeout: 30
    limit: 100
  # 或 Webhook 模式
  # webhook:
  #   url: "https://your-domain.com/webhook"
  #   secret_token: "your_secret_token"
  #   allowed_updates: ["message", "callback_query"]
```

### 代理配置说明

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `proxy.url` | string | 是 | 代理服务器地址 |
| `proxy.username` | string | 否 | 代理用户名 |
| `proxy.password` | string | 否 | 代理密码 |

支持的代理类型：
- HTTP 代理：`http://host:port`
- HTTPS 代理：`https://host:port`

## 使用

```bash
onebots -r telegram
```

## 功能

- ✅ 私聊消息收发
- ✅ 群组消息收发
- ✅ 频道消息收发
- ✅ 图片、视频、音频、文件发送
- ✅ 消息编辑和删除
- ✅ 群组管理（获取信息、踢出成员等）
- ✅ Inline Keyboard 支持（通过 Callback Query）
- ✅ 命令处理（/command）
- ✅ **代理支持**（HTTP/HTTPS）

## 获取 Bot Token

1. 在 Telegram 中搜索 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 创建新机器人
3. 按照提示设置机器人名称和用户名
4. 获取 Bot Token

## 依赖说明

| 依赖 | 何时需要 | 安装命令 |
|------|----------|----------|
| `grammy` | 必需 | `npm install grammy` |
| `https-proxy-agent` | 使用代理时 | `npm install https-proxy-agent` |

### 常见问题

#### 1. 连接超时 / Network request failed

如果你在中国大陆等需要代理的地区访问 Telegram API，请配置代理：

```yaml
telegram.your_bot:
  token: 'xxx'
  proxy:
    url: "http://127.0.0.1:7890"  # 你的代理地址
```

并安装代理依赖：

```bash
npm install https-proxy-agent
```

#### 2. 代理配置后仍然超时

1. 确认代理服务正常运行
2. 检查代理地址和端口是否正确
3. 确认代理服务允许访问 `api.telegram.org`

可以用以下命令测试代理：

```bash
curl -x http://127.0.0.1:7890 https://api.telegram.org/bot<TOKEN>/getMe
```

#### 3. 缺少 https-proxy-agent 警告

如果看到 `https-proxy-agent 未安装` 警告但你需要代理：

```bash
npm install https-proxy-agent
```

## 相关链接

- [Telegram Bot API 文档](https://core.telegram.org/bots/api)
- [grammy 文档](https://grammy.dev/)
- [onebots 文档](https://onebots.pages.dev/)

