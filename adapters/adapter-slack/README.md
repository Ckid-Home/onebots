# @onebots/adapter-slack

onebots Slack 适配器

## 安装

```bash
npm install @onebots/adapter-slack @slack/web-api
# 或
pnpm add @onebots/adapter-slack @slack/web-api
```

## 配置

在 `config.yaml` 中配置：

```yaml
slack.your_bot_id:
  token: "xoxb-YOUR-BOT-TOKEN"
  signing_secret: "YOUR_SIGNING_SECRET"  # 可选，用于验证请求
  app_token: "xapp-YOUR-APP-TOKEN"  # 可选，用于 Socket Mode
  socket_mode: false  # 是否使用 Socket Mode
```

## 使用

```bash
onebots -r slack
```

## 功能

- ✅ 频道消息收发
- ✅ 私聊消息收发
- ✅ 文本消息
- ✅ 富文本消息（Blocks）
- ✅ 消息编辑和删除
- ✅ 频道管理（获取信息、离开频道等）
- ✅ 事件订阅（Events API）
- ✅ 应用命令（Slash Commands，需要额外配置）
- ✅ 交互式组件（需要额外配置）

## 获取 Bot Token

1. 访问 [Slack API](https://api.slack.com/)
2. 创建应用（Create New App）
3. 在 "OAuth & Permissions" 中配置权限
4. 安装应用到工作区
5. 获取 Bot User OAuth Token（xoxb-...）
6. 在 "Event Subscriptions" 中配置 Webhook URL
7. 获取 Signing Secret（用于验证请求）

## 相关链接

- [Slack API 文档](https://api.slack.com/)
- [Slack Bot 开发文档](https://api.slack.com/bot-users)
- [@slack/web-api 文档](https://slack.dev/node-slack-sdk/web-api)
- [onebots 文档](https://onebots.js.org/)

