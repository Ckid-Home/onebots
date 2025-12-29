# @imhelper/adapter-kook

imhelper KOOK (开黑了) 适配器

## 简介

这是一个用于 imhelper 框架的 KOOK（原开黑了）平台适配器。KOOK 是一个面向游戏玩家的即时通讯平台，类似于 Discord。

## 功能特性

- ✅ WebSocket 和 Webhook 两种连接模式
- ✅ 频道消息收发
- ✅ 私聊消息收发
- ✅ 服务器（公会）管理
- ✅ 频道管理
- ✅ 成员管理
- ✅ 角色管理
- ✅ 表情回应
- ✅ 文件上传
- ✅ KMarkdown 消息格式支持
- ✅ 卡片消息支持

## 安装

```bash
npm install @imhelper/adapter-kook
# 或
pnpm add @imhelper/adapter-kook
```

## 配置

在配置文件中添加 KOOK 账号：

```yaml
accounts:
  - platform: kook
    account_id: your_bot_id
    token: your_bot_token
    mode: websocket  # 或 webhook
    verifyToken: your_verify_token  # Webhook 模式需要
    encryptKey: your_encrypt_key  # 可选，消息加密密钥
```

### 配置项说明

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account_id | string | 是 | 机器人账号 ID |
| token | string | 是 | 机器人 Token |
| mode | string | 否 | 连接模式：`websocket`（默认）或 `webhook` |
| verifyToken | string | 否 | Webhook 验证 Token |
| encryptKey | string | 否 | 消息加密密钥 |

## 获取 Token

1. 访问 [KOOK 开发者平台](https://developer.kookapp.cn/)
2. 创建应用并添加机器人
3. 在机器人设置中获取 Token

## 消息类型支持

### 发送消息

支持的消息段类型：
- `text` - 文本消息
- `at` - @用户/全体成员/在线成员
- `image` - 图片消息
- `face` - 表情

### 接收消息

支持的消息类型：
- 文字消息
- KMarkdown 消息
- 图片消息
- 视频消息
- 文件消息
- 音频消息
- 卡片消息

## API 支持

### 消息相关
- `sendMessage` - 发送消息
- `deleteMessage` - 删除消息
- `getMessage` - 获取消息
- `updateMessage` - 更新消息

### 用户相关
- `getLoginInfo` - 获取机器人信息
- `getUserInfo` - 获取用户信息
- `getFriendList` - 获取私聊会话列表
- `getFriendInfo` - 获取好友信息

### 服务器相关
- `getGroupList` - 获取服务器列表
- `getGroupInfo` - 获取服务器信息
- `leaveGroup` - 退出服务器
- `getGroupMemberList` - 获取服务器成员列表
- `getGroupMemberInfo` - 获取成员信息
- `kickGroupMember` - 踢出成员
- `setGroupCard` - 设置成员昵称

### 频道相关
- `getChannelList` - 获取频道列表
- `getChannelInfo` - 获取频道信息
- `createChannel` - 创建频道
- `updateChannel` - 更新频道
- `deleteChannel` - 删除频道
- `getChannelMemberList` - 获取频道成员列表

### 公会相关
- `getGuildList` - 获取服务器列表
- `getGuildInfo` - 获取服务器信息
- `getGuildMemberInfo` - 获取成员信息

## 事件支持

### 消息事件
- 频道消息
- 私聊消息

### 通知事件
- 成员加入服务器
- 成员离开服务器
- 表情回应添加
- 消息更新
- 消息删除

## 许可证

MIT
