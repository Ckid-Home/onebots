# 飞书适配器

飞书适配器已完全实现，支持通过飞书开放平台 Bot API 接入 onebots 服务。

## 状态

✅ **已实现并可用**

## 功能特性

- ✅ **消息收发**
  - 单聊消息收发
  - 群聊消息收发
  - 支持文本、富文本、卡片等多种消息格式
- ✅ **消息管理**
  - 消息编辑
  - 消息删除
- ✅ **群组管理**
  - 获取群组信息
  - 获取群组成员列表和信息
  - 离开群组
  - 踢出成员
- ✅ **用户管理**
  - 获取用户信息
- ✅ **事件订阅**
  - Webhook 事件订阅
  - 自动 Token 管理（应用访问令牌和租户访问令牌）

## 安装

```bash
npm install @onebots/adapter-feishu
# 或
pnpm add @onebots/adapter-feishu
```

## 配置

在 `config.yaml` 中配置飞书账号：

```yaml
# 飞书机器人账号配置
feishu.your_bot_id:
  # 飞书平台配置
  app_id: 'your_app_id'  # 应用 App ID，必填
  app_secret: 'your_app_secret'  # 应用 App Secret，必填
  encrypt_key: 'your_encrypt_key'  # 可选，事件加密密钥
  verification_token: 'your_verification_token'  # 可选，事件验证 Token
  
  # OneBot V11 协议配置
  onebot.v11:
    access_token: 'your_v11_token'
  
  # OneBot V12 协议配置
  onebot.v12:
    access_token: 'your_v12_token'
```

### 配置项说明

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `app_id` | string | 是 | 飞书应用 App ID |
| `app_secret` | string | 是 | 飞书应用 App Secret |
| `encrypt_key` | string | 否 | 事件加密密钥 |
| `verification_token` | string | 否 | 事件验证 Token |

## 获取应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 获取 `App ID` 和 `App Secret`
4. 配置事件订阅 URL（Webhook）：`http://your-server:port/feishu/{account_id}/webhook`
5. 配置应用权限（消息收发、通讯录等）

## 使用示例

### 启动服务

```bash
# 注册飞书适配器和 OneBot V11 协议
onebots -r feishu -p onebot.v11
```

### 客户端 SDK 使用

onebots 提供了 imhelper 客户端SDK，可以方便地连接飞书适配器：

```typescript
import { createImHelper } from 'imhelper';
import { createOnebot12Adapter } from '@imhelper/onebot-v12';

// 创建适配器
const adapter = createOnebot12Adapter({
  baseUrl: 'http://localhost:6727',
  selfId: 'your_bot_id',
  accessToken: 'your_token',
  receiveMode: 'ws',
  path: '/feishu/your_bot_id/onebot/v12',
  wsUrl: 'ws://localhost:6727/feishu/your_bot_id/onebot/v12',
  platform: 'feishu',
});

// 创建 ImHelper 实例
const helper = createImHelper(adapter);

// 监听消息事件
helper.on('message.private', (message) => {
  console.log('收到私聊消息:', message.content);
  message.reply([{ type: 'text', data: { text: '收到！' } }]);
});

helper.on('message.group', (message) => {
  console.log('收到群聊消息:', message.content);
  message.reply([{ type: 'text', data: { text: '收到！' } }]);
});

// 连接
await adapter.connect();
```

详细说明请查看：[客户端SDK使用指南](/guide/client-sdk)

## 相关链接

- [飞书开放平台](https://open.feishu.cn/)
- [飞书 Bot 开发文档](https://open.feishu.cn/document/ukTMukTMukTM/uczM3QjL3MzN04yNzcDN)
- [飞书适配器 README](https://github.com/lc-cn/onebots/tree/master/adapters/adapter-feishu)

