# @onebots/adapter-wecom

onebots 企业微信适配器

## 安装

```bash
npm install @onebots/adapter-wecom
# 或
pnpm add @onebots/adapter-wecom
```

## 配置

在 `config.yaml` 中配置：

```yaml
wecom.your_bot_id:
  corp_id: "YOUR_CORP_ID"
  corp_secret: "YOUR_CORP_SECRET"
  agent_id: "YOUR_AGENT_ID"
  token: "YOUR_TOKEN"  # 可选，回调验证 Token
  encoding_aes_key: "YOUR_ENCODING_AES_KEY"  # 可选，消息加解密密钥
```

## 使用

```bash
onebots -r wecom
```

## 功能

- ✅ 应用消息推送
  - 文本消息
  - 图片消息
  - 视频消息
  - 文件消息
  - 文本卡片
  - Markdown 消息
- ✅ 通讯录管理
  - 获取用户信息
  - 获取部门列表
  - 获取部门成员列表
- ✅ 事件订阅
  - 通讯录变更事件
  - 应用消息回调

## 获取应用凭证

1. 访问 [企业微信管理后台](https://work.weixin.qq.com/)
2. 应用管理 → 创建应用
3. 获取 `企业ID`（CorpID）
4. 获取 `应用Secret`（CorpSecret）
5. 获取 `应用ID`（AgentID）
6. 配置回调 URL：`http://your-server:port/wecom/{account_id}/webhook`
7. 获取 `Token` 和 `EncodingAESKey`（如果启用加密）

## 相关链接

- [企业微信开放平台](https://developer.work.weixin.qq.com/)
- [企业微信应用开发文档](https://developer.work.weixin.qq.com/document/path/90488)
- [onebots 文档](https://onebots.js.org/)

