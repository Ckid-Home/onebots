# @onebots/adapter-line

onebots Line Messaging API 适配器 - 轻量版实现，支持 Node.js 和 Cloudflare Workers。

## 特性

- ✅ **轻量级**：直接封装 Line Messaging API，无外部依赖
- ✅ **多运行时**：支持 Node.js 和 Cloudflare Workers
- ✅ **Webhook 支持**：自动注册 Webhook 路由
- ✅ **代理支持**：使用 https-proxy-agent（可选）

## 安装

```bash
npm install @onebots/adapter-line

# 需要代理时
npm install https-proxy-agent
```

## 配置

在 onebots 配置文件中添加 Line 账号配置：

```yaml
line.your_bot_id:
  channel_access_token: 'your_channel_access_token'  # Channel Access Token，必填
  channel_secret: 'your_channel_secret'              # Channel Secret，必填
  
  # 代理配置（可选）
  proxy:
    url: "http://127.0.0.1:7890"
    # username: "user"  # 可选
    # password: "pass"  # 可选
```

## 获取 Line Bot 凭证

1. 前往 [Line Developers Console](https://developers.line.biz/console/)
2. 登录你的 Line 账号
3. 创建一个 Provider（如果没有）
4. 在 Provider 下创建一个 Messaging API Channel
5. 在 Channel 设置页面获取：
   - **Channel Secret**：在 Basic settings 页签
   - **Channel Access Token**：在 Messaging API 页签，点击 Issue 生成

## 配置 Webhook

1. 在 Line Developers Console 的 Messaging API 页签
2. 设置 **Webhook URL** 为：`https://your-domain.com/line/{account_id}/webhook`
3. 启用 **Use webhook**
4. 禁用 **Auto-reply messages** 和 **Greeting messages**（可选）

## 支持的 API

### 消息相关
- ✅ sendMessage - 发送消息（推送消息）
- ✅ replyMessage - 回复消息（使用 replyToken）
- ❌ deleteMessage - Line 不支持删除消息
- ❌ getMessage - Line 不支持获取消息

### 用户相关
- ✅ getLoginInfo - 获取机器人信息
- ✅ getUserInfo - 获取用户资料

### 群组相关
- ❌ getGroupList - Line 不提供群组列表
- ✅ getGroupInfo - 获取群组信息
- ✅ getGroupMemberList - 获取群组成员列表
- ✅ getGroupMemberInfo - 获取群组成员信息
- ✅ leaveGroup - 离开群组

## 支持的事件

### 消息事件
- ✅ message - 收到消息（文本、图片、视频、音频、文件、位置、贴图）

### 关注事件
- ✅ follow - 用户关注机器人
- ✅ unfollow - 用户取消关注

### 群组事件
- ✅ join - 机器人加入群组
- ✅ leave - 机器人离开群组
- ✅ memberJoined - 成员加入群组
- ✅ memberLeft - 成员离开群组

### 其他事件
- ✅ postback - Postback 回调

## 消息格式

### 发送消息支持的类型
- `text` - 文本消息
- `image` - 图片消息
- `video` - 视频消息
- `audio` - 音频消息
- `location` - 位置消息

### 接收消息的类型
- `text` - 文本
- `image` - 图片
- `video` - 视频
- `audio` - 音频
- `file` - 文件
- `location` - 位置
- `sticker` - 贴图

## 独立使用

```typescript
import { LineBot } from '@onebots/adapter-line';

const bot = new LineBot({
    account_id: 'my-bot',
    channel_access_token: 'your_token',
    channel_secret: 'your_secret',
});

// 发送消息
await bot.pushMessage('user_id', {
    type: 'text',
    text: 'Hello!',
});

// 获取用户资料
const profile = await bot.getProfile('user_id');
console.log(profile.displayName);

// 处理 Webhook
bot.on('message', (event) => {
    console.log('收到消息:', event.message);
    
    // 回复消息
    bot.replyMessage(event.replyToken, {
        type: 'text',
        text: '收到了！',
    });
});
```

## 注意事项

1. **replyToken 有效期**：replyToken 仅在收到消息后 30 秒内有效
2. **消息配额**：Line 免费账号有月消息配额限制
3. **图片/视频 URL**：必须是 HTTPS 且可公开访问的 URL
4. **群组消息**：机器人需要被邀请加入群组才能收发消息

## 许可证

MIT

