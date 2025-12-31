# @onebots/adapter-discord

onebots Discord 适配器，基于 discord.js 实现。

## 安装

```bash
npm install @onebots/adapter-discord discord.js
```

## 配置

在 onebots 配置文件中添加 Discord 账号配置：

```yaml
discord.your_bot_id:
  versions:
    - version: V11
    - version: V12
  protocol:
    token: 'your_discord_bot_token'  # Discord Bot Token，必填
    intents:  # 可选，Gateway Intents
      - Guilds
      - GuildMessages
      - GuildMembers
      - GuildMessageReactions
      - DirectMessages
      - DirectMessageReactions
      - MessageContent
    partials:  # 可选，Partials
      - Message
      - Channel
      - Reaction
    presence:  # 可选，机器人状态
      status: online  # online, idle, dnd, invisible
      activities:
        - name: '正在运行 onebots'
          type: 0  # 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing
```

## 获取 Discord Bot Token

1. 前往 [Discord Developer Portal](https://discord.com/developers/applications)
2. 点击 "New Application" 创建新应用
3. 进入应用后，点击左侧 "Bot" 菜单
4. 点击 "Reset Token" 获取 Bot Token
5. 在 "Privileged Gateway Intents" 中启用需要的 Intents：
   - PRESENCE INTENT
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT

## 邀请机器人到服务器

1. 在 Discord Developer Portal 中，进入你的应用
2. 点击左侧 "OAuth2" -> "URL Generator"
3. 在 "SCOPES" 中选择 `bot`
4. 在 "BOT PERMISSIONS" 中选择需要的权限
5. 复制生成的 URL 并在浏览器中打开
6. 选择要添加机器人的服务器

## 支持的 API

### 消息相关
- ✅ sendMessage - 发送消息（支持私信、频道消息）
- ✅ deleteMessage - 删除/撤回消息
- ✅ getMessage - 获取消息
- ✅ getMessageHistory - 获取历史消息

### 用户相关
- ✅ getLoginInfo - 获取机器人信息
- ✅ getUserInfo - 获取用户信息

### 好友相关
- ⚠️ getFriendList - Discord 无好友系统，返回空列表
- ⚠️ getFriendInfo - 返回用户信息

### 群组（服务器）相关
- ✅ getGroupList - 获取服务器列表
- ✅ getGroupInfo - 获取服务器信息
- ✅ leaveGroup - 退出服务器
- ✅ getGroupMemberList - 获取服务器成员列表
- ✅ getGroupMemberInfo - 获取成员信息
- ✅ kickGroupMember - 踢出成员
- ✅ muteGroupMember - 禁言成员（超时）
- ✅ setGroupCard - 设置成员昵称
- ✅ sendGroupMessageReaction - 添加消息反应

### 频道相关
- ✅ getGuildInfo - 获取服务器信息
- ✅ getGuildList - 获取服务器列表
- ✅ getGuildMemberInfo - 获取服务器成员信息
- ✅ getChannelInfo - 获取频道信息
- ✅ getChannelList - 获取频道列表
- ✅ createChannel - 创建频道
- ✅ deleteChannel - 删除频道
- ✅ updateChannel - 更新频道

### 频道成员相关
- ✅ getChannelMemberInfo - 获取频道成员信息
- ✅ getChannelMemberList - 获取频道成员列表
- ✅ kickChannelMember - 踢出频道成员
- ✅ setChannelMemberMute - 设置成员禁言

### 系统相关
- ✅ getVersion - 获取版本信息
- ✅ getStatus - 获取运行状态
- ✅ canSendImage - 支持发送图片
- ✅ canSendRecord - 支持发送音频

## 支持的事件

### 消息事件
- ✅ messageCreate - 收到消息
- ✅ messageUpdate - 消息编辑
- ✅ messageDelete - 消息删除

### 成员事件
- ✅ guildMemberAdd - 成员加入
- ✅ guildMemberRemove - 成员离开
- ✅ guildMemberUpdate - 成员更新

### 服务器事件
- ✅ guildCreate - 机器人加入服务器
- ✅ guildDelete - 机器人离开服务器

### 频道事件
- ✅ channelCreate - 频道创建
- ✅ channelDelete - 频道删除
- ✅ channelUpdate - 频道更新

### 反应事件
- ✅ messageReactionAdd - 添加反应
- ✅ messageReactionRemove - 移除反应

## 消息格式

### 发送消息支持的消息段类型
- `text` - 文本消息
- `at` - @提及用户（使用 `qq` 字段作为用户 ID）
- `image` - 图片（支持 URL 或本地路径）
- `voice` / `record` - 音频文件
- `video` - 视频文件
- `file` - 普通文件
- `share` - 分享链接（转换为 Embed）
- `face` - 表情（转换为 Unicode emoji）

### 接收消息的消息段类型
- `text` - 文本内容
- `image` - 图片附件
- `voice` - 音频附件
- `video` - 视频附件
- `file` - 其他文件附件
- `at` - @提及

## 注意事项

1. **权限配置**：确保机器人拥有足够的权限执行相应操作
2. **Intents 配置**：需要在 Discord Developer Portal 中启用对应的 Privileged Intents
3. **消息内容**：要接收消息内容，需要启用 MESSAGE CONTENT INTENT
4. **速率限制**：Discord API 有速率限制，请勿频繁调用

## 许可证

MIT
