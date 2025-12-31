# 微信适配器

微信适配器支持通过微信公众号接入 onebots 服务。

## 功能特性

- ✅ 接收文本、图片、语音、视频消息
- ✅ 发送文本、图片、语音、视频消息
- ✅ 菜单事件、关注/取消关注事件
- ✅ 模板消息推送
- ✅ 自定义菜单管理

## 安装

```bash
npm install @onebots/adapter-wechat
```

## 配置

在 `config.yaml` 中添加微信公众号配置：

```yaml
# 账号格式：wechat.{公众号ID}
wechat.my_mp:
  # 公众号配置
  appid: your_appid           # 公众号 AppID
  appsecret: your_appsecret   # 公众号 AppSecret
  token: your_token           # 服务器配置的 Token
  encoding_aes_key: your_key  # 消息加解密密钥（可选）
  
  # 协议配置
  onebot.v11:
    use_http: true
    use_ws: false
```

## 获取配置信息

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 在"开发" - "基本配置"中获取：
   - **AppID**
   - **AppSecret**（需要管理员权限）
3. 在"开发" - "基本配置" - "服务器配置"中设置：
   - **URL**: `http://your-domain:6727/wechat/my_mp/webhook`
   - **Token**: 自定义令牌（需与配置文件一致）
   - **EncodingAESKey**: 随机生成或自定义

## 启动服务

```bash
# 注册微信适配器和 OneBot V11 协议
onebots -r wechat -p onebot-v11
```

## API 地址

启动后，OneBot API 可通过以下地址访问：

- **HTTP**: `http://localhost:6727/wechat/my_mp/onebot/v11/{action}`
- **WebSocket**: `ws://localhost:6727/wechat/my_mp/onebot/v11`

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

## 使用客户端SDK连接

onebots 提供了 imhelper 客户端SDK，可以方便地连接微信适配器：

```typescript
import { createImHelper } from 'imhelper';
import { createOnebot11Adapter } from '@imhelper/onebot-v11';

const adapter = createOnebot11Adapter({
  baseUrl: 'http://localhost:6727',
  selfId: 'my_mp',
  accessToken: 'your_token',
  receiveMode: 'webhook', // 微信通常使用 webhook 模式
  path: '/wechat/my_mp/onebot/v11',
  wsUrl: 'ws://localhost:6727/wechat/my_mp/onebot/v11',
  platform: 'wechat',
});

const helper = createImHelper(adapter);
// Webhook 模式需要启动本地服务器接收事件
await adapter.connect(8080);
```

详细说明请查看：[客户端SDK使用指南](/guide/client-sdk)

## 相关链接

- [微信公众平台](https://mp.weixin.qq.com/)
- [微信公众平台开发文档](https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html)
- [@onebots/adapter-wechat 源码](https://github.com/lc-cn/onebots/tree/master/adapters/adapter-wechat)
- [客户端SDK使用指南](/guide/client-sdk)
