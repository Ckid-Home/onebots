# @onebots/adapter-feishu

onebots 飞书/Lark 适配器，同时支持飞书（国内版）和 Lark（国际版）。

## 安装

```bash
npm install @onebots/adapter-feishu
# 或
pnpm add @onebots/adapter-feishu
```

## 配置

在 `config.yaml` 中配置：

```yaml
# 飞书（国内版）- 默认
feishu.feishu_bot:
  app_id: "YOUR_APP_ID"
  app_secret: "YOUR_APP_SECRET"
  encrypt_key: "YOUR_ENCRYPT_KEY"  # 可选，事件加密密钥
  verification_token: "YOUR_VERIFICATION_TOKEN"  # 可选，事件验证 Token

# Lark（国际版）
feishu.lark_bot:
  app_id: "YOUR_APP_ID"
  app_secret: "YOUR_APP_SECRET"
  endpoint: "https://open.larksuite.com/open-apis"  # Lark 端点
```

### 端点配置

| 端点 | URL | 说明 |
|------|-----|------|
| 飞书（默认） | `https://open.feishu.cn/open-apis` | 国内版 |
| Lark | `https://open.larksuite.com/open-apis` | 国际版 |

### TypeScript 配置（推荐）

```typescript
import { FeishuEndpoint } from '@onebots/adapter-feishu';

// 飞书（国内版）
{
  account_id: 'feishu_bot',
  app_id: 'cli_xxx',
  app_secret: 'xxx',
  // endpoint 可省略，默认为 FeishuEndpoint.FEISHU
}

// Lark（国际版）
{
  account_id: 'lark_bot',
  app_id: 'cli_xxx',
  app_secret: 'xxx',
  endpoint: FeishuEndpoint.LARK,
}

// 私有化部署
{
  account_id: 'private_bot',
  app_id: 'cli_xxx',
  app_secret: 'xxx',
  endpoint: 'https://your-private-feishu.com/open-apis',
}
```

## 使用

```bash
onebots -r feishu
```

## 功能

- ✅ 单聊消息收发
- ✅ 群聊消息收发
- ✅ 文本消息
- ✅ 富文本消息（部分支持）
- ✅ 消息编辑和删除
- ✅ 群组管理（获取信息、踢出成员等）
- ✅ 事件订阅（Webhook）
- ✅ 支持飞书和 Lark 双端点

## 获取应用凭证

### 飞书（国内版）
1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 获取 `App ID` 和 `App Secret`
4. 配置事件订阅 URL（Webhook）
5. 配置应用权限（消息收发、通讯录等）

### Lark（国际版）
1. 访问 [Lark Developer](https://open.larksuite.com/)
2. 创建应用并获取凭证
3. 配置方式与飞书相同，只需设置 `endpoint` 为 Lark 端点

## 相关链接

- [飞书开放平台](https://open.feishu.cn/)
- [Lark Developer](https://open.larksuite.com/)
- [飞书 Bot 开发文档](https://open.feishu.cn/document/ukTMukTMukTM/uczM3QjL3MzN04yNzcDN)
- [onebots 文档](https://onebots.pages.dev/)

