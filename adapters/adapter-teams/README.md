# @onebots/adapter-teams

onebots Microsoft Teams 适配器 - 支持 Microsoft Teams Bot Framework 的机器人适配器

## 简介

`@onebots/adapter-teams` 是 onebots 框架的官方 Microsoft Teams 适配器，用于连接 Microsoft Teams 平台，将 Teams 的消息和事件转换为 onebots 的通用格式。

## 特性

- 🔐 **Bot Framework 支持** - 基于 Microsoft Bot Framework SDK
- 📨 **消息处理** - 完整的消息接收和发送支持
- 🎯 **事件处理** - 支持消息、成员加入/离开等事件
- 🔄 **自动转换** - 自动将 Teams 消息转换为通用格式
- 📡 **Webhook** - 支持 Teams Webhook 回调
- 🎨 **自适应卡片** - 支持发送 Teams 自适应卡片

## 安装

```bash
npm install @onebots/adapter-teams
# 或
pnpm add @onebots/adapter-teams
```

## 使用方法

> **重要：** 适配器必须先注册才能使用。即使在配置文件中配置了 Teams 账号，如果没有注册该适配器，配置也不会生效。

### 1. 命令行注册（推荐）

使用 `onebots` 命令行工具时，通过 `-r` 参数注册适配器：

```bash
# 注册 Teams 适配器
onebots -r teams

# 同时注册多个适配器
onebots -r teams -r telegram -r slack
```

### 2. 配置文件方式

在 `config.yaml` 中配置：

```yaml
accounts:
  - platform: teams
    account_id: my_teams_bot
    protocol: onebot.v11
    
    # Microsoft Teams 配置
    app_id: your_app_id
    app_password: your_app_password
    webhook:
      url: https://your-domain.com/teams/my_teams_bot/webhook
      port: 8080
```

### 3. 代码方式

```typescript
import { App } from 'onebots';
import { TeamsAdapter } from '@onebots/adapter-teams';

// 注册适配器
await App.registerAdapter('teams', TeamsAdapter);

// 创建应用
const app = new App({
  accounts: [{
    platform: 'teams',
    account_id: 'my_teams_bot',
    protocol: 'onebot.v11',
    app_id: 'your_app_id',
    app_password: 'your_app_password',
  }],
});

// 启动应用
await app.start();
```

## 配置说明

### 必需配置

- `app_id`: Microsoft App ID（从 Azure Portal 获取）
- `app_password`: Microsoft App Password（从 Azure Portal 获取）

### 可选配置

- `webhook.url`: Webhook URL（如果使用自定义域名）
- `webhook.port`: Webhook 端口（默认使用全局配置）
- `channel_service`: Channel Service URL（用于政府云等特殊环境）
- `open_id_metadata`: OpenID Metadata URL（用于自定义认证）

## Microsoft Teams 配置

1. 登录 [Azure Portal](https://portal.azure.com)
2. 创建 Azure Bot 资源
3. 获取 **App ID** 和 **App Password**
4. 配置 **Messaging endpoint** 为：`https://your-domain.com/teams/{account_id}/webhook`
5. 在 Teams 中测试 Bot

## 功能支持

### ✅ 已实现功能

- 私聊消息收发
- 群聊消息收发
- 消息编辑
- 消息删除
- 成员加入/离开事件
- 自适应卡片发送

### ❌ 不支持的功能

- 获取消息（Bot Framework 不提供此 API）
- 获取用户信息（需从消息事件中获取）
- 获取群信息（Bot Framework 不提供此 API）
- 群成员管理（Bot Framework 不提供此 API）

## 注意事项

1. **Webhook 模式**：Teams Bot 必须使用 Webhook 模式，不支持轮询
2. **HTTPS 要求**：Webhook URL 必须是 HTTPS（生产环境）
3. **消息限制**：Teams 对消息频率有限制
4. **自适应卡片**：Teams 支持丰富的自适应卡片格式

## 许可证

与 onebots 主项目保持一致。

## 相关链接

- [Microsoft Bot Framework 文档](https://dev.botframework.com/)
- [Teams Bot 开发文档](https://docs.microsoft.com/en-us/microsoftteams/platform/bots/what-are-bots)
- [Bot Framework SDK for Node.js](https://github.com/Microsoft/botbuilder-js)

