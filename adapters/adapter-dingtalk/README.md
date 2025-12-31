# @onebots/adapter-dingtalk

onebots 钉钉适配器

## 安装

```bash
npm install @onebots/adapter-dingtalk
# 或
pnpm add @onebots/adapter-dingtalk
```

## 配置

### 企业内部应用模式

在 `config.yaml` 中配置：

```yaml
dingtalk.your_bot_id:
  app_key: "YOUR_APP_KEY"
  app_secret: "YOUR_APP_SECRET"
  agent_id: "YOUR_AGENT_ID"  # 可选
  encrypt_key: "YOUR_ENCRYPT_KEY"  # 可选，事件加密密钥
  token: "YOUR_TOKEN"  # 可选，事件验证 Token
```

### 自定义机器人模式（Webhook）

在 `config.yaml` 中配置：

```yaml
dingtalk.your_bot_id:
  webhook_url: "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN"
```

## 使用

```bash
onebots -r dingtalk
```

## 功能

### 企业内部应用模式
- ✅ 单聊消息收发
- ✅ 群聊消息收发
- ✅ 文本消息
- ✅ Markdown 消息
- ✅ 卡片消息（部分支持）
- ✅ 事件订阅（Webhook）
- ✅ 用户信息获取

### 自定义机器人模式（Webhook）
- ✅ 群聊消息推送
- ✅ 文本消息
- ✅ Markdown 消息
- ✅ @用户、@所有人
- ✅ 卡片消息（部分支持）

## 获取应用凭证

### 企业内部应用

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建企业内部应用
3. 获取 `AppKey` 和 `AppSecret`
4. 获取 `AgentId`（可选）
5. 配置事件订阅 URL（Webhook）
6. 配置应用权限（消息收发、通讯录等）

### 自定义机器人

1. 在钉钉群聊中，点击"群设置" -> "智能群助手" -> "添加机器人"
2. 选择"自定义"机器人
3. 获取 Webhook URL

## 相关链接

- [钉钉开放平台](https://open.dingtalk.com/)
- [钉钉机器人开发文档](https://open.dingtalk.com/document/robots/robot-overview)
- [onebots 文档](https://onebots.js.org/)

