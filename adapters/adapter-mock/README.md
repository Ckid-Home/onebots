# @onebots/adapter-mock

onebots Mock 适配器 - 用于测试和开发环境。

## 特性

- ✅ **无外部依赖**：不需要真实的机器人账号或服务
- ✅ **完整 API**：实现所有标准适配器 API
- ✅ **可控事件**：可以手动触发事件用于测试
- ✅ **模拟数据**：预置好友、群组等模拟数据
- ✅ **CI/CD 友好**：适合在自动化测试环境中使用

## 安装

```bash
npm install @onebots/adapter-mock
# 或
pnpm add @onebots/adapter-mock
```

## 配置

```yaml
mock.test_bot:
  nickname: "测试机器人"
  avatar: "https://via.placeholder.com/100"
  auto_events: false  # 是否自动生成模拟事件
  event_interval: 5000  # 事件生成间隔（毫秒）
  latency: 10  # 模拟 API 延迟（毫秒）
  
  # 预定义好友列表
  friends:
    - user_id: "10001"
      nickname: "测试好友1"
    - user_id: "10002"
      nickname: "测试好友2"
  
  # 预定义群组
  groups:
    - group_id: "100001"
      group_name: "测试群"
      member_count: 50
      members:
        - user_id: "10001"
          nickname: "群主"
          role: "owner"
```

## 在测试中使用

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MockBot, MockAdapter } from '@onebots/adapter-mock';

describe('Bot Tests', () => {
    let bot: MockBot;

    beforeAll(async () => {
        bot = new MockBot({
            account_id: 'test_bot',
            nickname: 'Test Bot',
            latency: 0,  // 测试时禁用延迟
        });
        await bot.start();
    });

    afterAll(async () => {
        await bot.stop();
    });

    test('getLoginInfo', async () => {
        const info = await bot.getLoginInfo();
        expect(info.user_id).toBe('test_bot');
        expect(info.nickname).toBe('Test Bot');
    });

    test('getFriendList', async () => {
        const friends = await bot.getFriendList();
        expect(friends.length).toBeGreaterThan(0);
    });

    test('sendMessage', async () => {
        const result = await bot.sendMessage('10001', 'Hello!', 'private');
        expect(result.message_id).toBeDefined();
    });

    test('手动触发事件', async () => {
        const events: any[] = [];
        bot.on('message', (e) => events.push(e));

        // 手动触发消息事件
        bot.triggerEvent('message', {
            type: 'private',
            message_id: 'test_msg_1',
            user_id: '10001',
            nickname: '测试好友',
            content: '测试消息',
            time: Math.floor(Date.now() / 1000),
        });

        expect(events.length).toBe(1);
        expect(events[0].content).toBe('测试消息');
    });
});
```

## API

### MockBot

| 方法 | 说明 |
|------|------|
| `start()` | 启动机器人 |
| `stop()` | 停止机器人 |
| `getLoginInfo()` | 获取登录信息 |
| `getFriendList()` | 获取好友列表 |
| `getGroupList()` | 获取群组列表 |
| `getGroupInfo(groupId)` | 获取群组信息 |
| `getGroupMemberList(groupId)` | 获取群成员列表 |
| `getUserInfo(userId)` | 获取用户信息 |
| `sendMessage(targetId, message, type)` | 发送消息 |
| `deleteMessage(messageId)` | 删除消息 |

### 测试辅助方法

| 方法 | 说明 |
|------|------|
| `triggerEvent(event, data)` | 手动触发事件 |
| `addFriend(friend)` | 添加模拟好友 |
| `addGroup(group)` | 添加模拟群组 |
| `getSentMessages()` | 获取所有已发送的消息 |
| `clearData()` | 清除所有模拟数据 |
| `isActive()` | 检查是否正在运行 |

## 事件

| 事件 | 说明 |
|------|------|
| `ready` | 机器人就绪 |
| `message` | 收到消息 |
| `request` | 收到请求（好友申请等） |
| `heartbeat` | 心跳 |
| `stopped` | 机器人停止 |
| `message_sent` | 消息发送成功 |

## 许可证

MIT

