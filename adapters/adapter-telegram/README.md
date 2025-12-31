# @onebots/adapter-telegram

onebots Telegram 适配器

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

## 获取 Bot Token

1. 在 Telegram 中搜索 [@BotFather](https://t.me/BotFather)
2. 发送 `/newbot` 创建新机器人
3. 按照提示设置机器人名称和用户名
4. 获取 Bot Token

## 相关链接

- [Telegram Bot API 文档](https://core.telegram.org/bots/api)
- [grammy 文档](https://grammy.dev/)
- [onebots 文档](https://onebots.js.org/)

