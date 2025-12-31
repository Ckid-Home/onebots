# 企业微信适配器配置

企业微信适配器配置说明。

## 配置项

### corp_id

- **类型**: `string`
- **必填**: ✅
- **说明**: 企业 ID（CorpID）

### corp_secret

- **类型**: `string`
- **必填**: ✅
- **说明**: 应用 Secret（CorpSecret）

### agent_id

- **类型**: `string`
- **必填**: ✅
- **说明**: 应用 AgentId

### token

- **类型**: `string`
- **必填**: ❌
- **说明**: 回调验证 Token

### encoding_aes_key

- **类型**: `string`
- **必填**: ❌
- **说明**: 消息加解密密钥（启用加密模式时必填）

## 配置示例

```yaml
wecom.my_bot:
  corp_id: 'ww1234567890abcdef'
  corp_secret: 'your_corp_secret'
  agent_id: '1000001'
  token: 'your_token'  # 可选
  encoding_aes_key: 'your_encoding_aes_key'  # 可选
```

## 获取应用凭证

1. 访问 [企业微信管理后台](https://work.weixin.qq.com/)
2. 应用管理 → 创建应用
3. 在"应用详情"中获取：
   - `企业ID`（CorpID）
   - `应用Secret`（CorpSecret）
   - `应用ID`（AgentID）
4. 在"接收消息"中配置回调 URL：`http://your-server:port/wecom/{account_id}/webhook`
5. 获取 `Token` 和 `EncodingAESKey`（如果启用加密）

## Webhook 地址

配置回调 URL 为：

```
http://your-domain:port/wecom/{account_id}/webhook
```

例如：
```
http://bot.example.com:6727/wecom/my_bot/webhook
```

## 相关链接

- [适配器配置指南](/guide/adapter)
- [企业微信平台文档](/platform/wecom)

