# 微信适配器配置

微信公众号适配器配置说明。

## 配置格式

```yaml
wechat.{account_id}:
  # 微信平台配置
  app_id: 'your_app_id'           # 必填：公众号 AppID
  app_secret: 'your_app_secret'   # 必填：公众号 AppSecret
  token: 'your_token'              # 必填：服务器配置的 Token
  encoding_aes_key: 'your_key'    # 可选：消息加解密密钥
  
  # 协议配置
  onebot.v11:
    access_token: 'your_v11_token'
  onebot.v12:
    access_token: 'your_v12_token'
```

## 配置项说明

| 字段名 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|--------|
| `app_id` | string | 是 | 公众号 AppID | - |
| `app_secret` | string | 是 | 公众号 AppSecret | - |
| `token` | string | 是 | 服务器配置的 Token | - |
| `encoding_aes_key` | string | 否 | 消息加解密密钥（安全模式需要） | - |

## 获取配置信息

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 在"开发" - "基本配置"中获取：
   - **AppID**
   - **AppSecret**（需要管理员权限）
3. 在"开发" - "基本配置" - "服务器配置"中设置：
   - **URL**: `http://your-domain:6727/wechat/{account_id}/webhook`
   - **Token**: 自定义令牌（需与配置文件一致）
   - **EncodingAESKey**: 随机生成或自定义（安全模式需要）

## 完整配置示例

```yaml
port: 6727
log_level: info
timeout: 30

general:
  onebot.v11:
    use_http: true
    use_ws: false
    access_token: ''
    heartbeat_interval: 5000

# 微信公众号账号配置
wechat.my_mp:
  # 微信平台配置
  app_id: 'wx1234567890abcdef'
  app_secret: 'your_app_secret'
  token: 'your_token'
  encoding_aes_key: 'your_aes_key'  # 可选，安全模式需要
  
  # OneBot V11 协议配置
  onebot.v11:
    access_token: 'wechat_v11_token'
```

## 注意事项

### 公网访问

微信公众平台要求服务器配置的 URL 必须是公网可访问的地址。开发环境可使用：
- [内网穿透工具](https://ngrok.com/)
- [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/)

### 安全模式

建议在生产环境启用消息加解密，配置 `encoding_aes_key` 并在公众平台设置为"安全模式"。

### 接口权限

不同类型的公众号拥有不同的接口权限：
- **订阅号**: 基础消息收发
- **服务号**: 完整接口权限（推荐）
- **企业号**: 企业内部应用

## 相关文档

- [微信平台说明](/platform/wechat)
- [适配器配置指南](/guide/adapter)
- [客户端SDK使用指南](/guide/client-sdk)
