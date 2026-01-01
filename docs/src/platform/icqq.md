# ICQQ 适配器

ICQQ 适配器基于 `@icqqjs/icqq` 库，支持通过模拟 QQ 客户端协议接入 onebots 服务。

## 状态

✅ **已实现并可用**

## 功能特性

- ✅ **消息收发**
  - 私聊消息收发
  - 群组消息收发
  - 支持文本、表情、图片、语音、视频、@提及、回复等多种消息格式
- ✅ **消息管理**
  - 消息撤回
  - 获取历史消息
- ✅ **好友管理**
  - 获取好友列表
  - 处理好友申请
  - 删除好友
- ✅ **群组管理**
  - 获取群列表
  - 获取群成员列表
  - 设置群名片
  - 踢出群成员
  - 禁言群成员/全员禁言
  - 设置群管理员
  - 退出/解散群
- ✅ **事件支持**
  - 私聊/群聊消息
  - 好友/群申请
  - 群成员增减
  - 群禁言/管理员变动
  - 消息撤回
  - 戳一戳
- ✅ **登录方式**
  - 扫码登录
  - 密码登录

## 安装

### 1. 配置 GitHub Packages 访问

由于 `@icqqjs/icqq` 是托管在 GitHub Packages 的私有包，需要先配置访问权限。

在项目根目录的 `.npmrc` 文件中添加：

```
@icqqjs:registry=https://npm.pkg.github.com
```

### 2. 登录 GitHub Packages

```bash
npm login --scope=@icqqjs --auth-type=legacy --registry=https://npm.pkg.github.com
```

- **UserName**: 你的 GitHub 账号
- **Password**: 前往 https://github.com/settings/tokens/new 获取，scopes 勾选 `read:packages`
- **E-Mail**: 你的公开邮箱地址

### 3. 安装依赖

```bash
npm install @onebots/adapter-icqq
# 或
pnpm add @onebots/adapter-icqq
```

## 配置

在 `config.yaml` 中配置 ICQQ 账号：

```yaml
# ICQQ 机器人账号配置
icqq.123456789:  # 你的 QQ 号
  # 密码登录（可选，不填则扫码登录）
  password: 'your_password'
  
  # 协议配置
  protocol:
    platform: 2                    # 登录平台
    sign_api_addr: 'http://127.0.0.1:8080'  # 签名服务器
    data_dir: './data/icqq'        # 数据目录
    ignore_self: true              # 过滤自己的消息
    resend: true                   # 风控时分片发送
    reconn_interval: 5             # 重连间隔
    cache_group_member: true       # 缓存群成员
    auto_server: true              # 自动选择服务器
  
  # OneBot V11 协议配置
  onebot.v11:
    access_token: 'your_v11_token'
```

### 配置项说明

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `password` | string | 否 | QQ 密码，不填则扫码登录 |
| `protocol.platform` | number | 否 | 登录平台，默认 2 |
| `protocol.sign_api_addr` | string | **推荐** | 签名服务器地址 |
| `protocol.data_dir` | string | 否 | 数据存储目录 |
| `protocol.ignore_self` | boolean | 否 | 过滤自己的消息，默认 true |

### 登录平台

| 值 | 平台 |
|----|------|
| 1 | 安卓手机 |
| 2 | 安卓平板（推荐） |
| 3 | 安卓手表 |
| 4 | MacOS |
| 5 | iPad |
| 6 | Tim |

## 签名服务器

::: warning 重要
ICQQ 协议需要签名服务器才能正常登录和收发消息。未配置签名服务器可能导致登录失败或无法收发消息。
:::

签名服务器部署请参考：
- [unidbg-fetch-qsign](https://github.com/fuqiuluo/unidbg-fetch-qsign)

配置示例：

```yaml
protocol:
  sign_api_addr: 'http://127.0.0.1:8080'
```

## 使用示例

### 启动服务

```bash
# 注册 ICQQ 适配器和 OneBot V11 协议
onebots -r icqq -p onebot.v11
```

### 客户端 SDK 使用

```typescript
import { createImHelper } from 'imhelper';
import { createOnebot12Adapter } from '@imhelper/onebot-v12';

// 创建适配器
const adapter = createOnebot12Adapter({
  baseUrl: 'http://localhost:6727',
  selfId: '123456789',  // 你的 QQ 号
  accessToken: 'your_token',
  receiveMode: 'ws',
  path: '/icqq/123456789/onebot/v12',
  wsUrl: 'ws://localhost:6727/icqq/123456789/onebot/v12',
  platform: 'icqq',
});

// 创建 ImHelper 实例
const helper = createImHelper(adapter);

// 监听消息事件
helper.on('message.private', (message) => {
  console.log('收到私聊消息:', message.content);
  message.reply([{ type: 'text', data: { text: '收到！' } }]);
});

helper.on('message.group', (message) => {
  console.log('收到群消息:', message.content);
  message.reply([{ type: 'text', data: { text: '收到！' } }]);
});

// 连接
await adapter.connect();
```

## 登录验证处理

### 扫码登录

如果不配置密码，启动时会提示扫码登录。使用 QQ 扫描控制台输出的二维码即可。

### 滑块验证

如果触发滑块验证，控制台会输出验证链接。需要：
1. 在浏览器打开链接完成滑块验证
2. 获取验证后的 ticket
3. 通过 API 或控制台提交 ticket

### 设备锁验证

如果触发设备锁验证，控制台会输出验证链接和手机号。需要手动完成短信验证。

## 注意事项

::: warning 账号安全
1. **建议使用小号测试**：ICQQ 基于协议逆向，存在账号被封禁风险
2. **签名服务器必配**：未配置可能导致登录失败
3. **协议更新**：QQ 协议可能随时更新，如遇问题请更新 ICQQ 和签名服务
4. **数据目录**：建议配置独立的 `data_dir`，避免数据混乱
:::

## 相关链接

- [ICQQ GitHub](https://github.com/icqqjs/icqq)
- [ICQQ 适配器配置](/config/adapter/icqq)
- [签名服务部署教程](https://github.com/fuqiuluo/unidbg-fetch-qsign)

