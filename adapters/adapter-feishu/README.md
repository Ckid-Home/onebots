# @onebots/adapter-feishu

onebots 飞书适配器

## 安装

```bash
npm install @onebots/adapter-feishu
# 或
pnpm add @onebots/adapter-feishu
```

## 配置

在 `config.yaml` 中配置：

```yaml
feishu.your_bot_id:
  app_id: "YOUR_APP_ID"
  app_secret: "YOUR_APP_SECRET"
  encrypt_key: "YOUR_ENCRYPT_KEY"  # 可选，事件加密密钥
  verification_token: "YOUR_VERIFICATION_TOKEN"  # 可选，事件验证 Token
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

## 获取应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 获取 `App ID` 和 `App Secret`
4. 配置事件订阅 URL（Webhook）
5. 配置应用权限（消息收发、通讯录等）

## 相关链接

- [飞书开放平台](https://open.feishu.cn/)
- [飞书 Bot 开发文档](https://open.feishu.cn/document/ukTMukTMukTM/uczM3QjL3MzN04yNzcDN)
- [onebots 文档](https://onebots.js.org/)

