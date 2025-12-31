<div align="center">
    <h1>OneBots - 多平台多协议机器人应用框架</h1>
    <p>使用 TypeScript 实现的 OneBot 应用启动器，支持 Kook、QQ官方机器人、微信以及 Discord 机器人</p>

[![Build Package](https://github.com/icqqjs/onebots/actions/workflows/release.yml/badge.svg?branch=master&event=push)](https://github.com/icqqjs/onebots/actions/workflows/release.yml) 
[![Build Docs](https://github.com/lc-cn/onebots/actions/workflows/build_deploy_docs.yml/badge.svg)](https://github.com/lc-cn/onebots/actions/workflows/build_deploy_docs.yml)

[![npm](https://img.shields.io/npm/v/onebots)](https://www.npmjs.com/package/onebots) 
[![dm](https://shields.io/npm/dm/onebots)](https://www.npmjs.com/package/onebots) 
[![oneBot V11](https://img.shields.io/badge/onebot-v11-black?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABwCAMAAADxPgR5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAxQTFRF////29vbr6+vAAAAk1hCcwAAAAR0Uk5T////AEAqqfQAAAKcSURBVHja7NrbctswDATQXfD//zlpO7FlmwAWIOnOtNaTM5JwDMa8E+PNFz7g3waJ24fviyDPgfhz8fHP39cBcBL9KoJbQUxjA2iYqHL3FAnvzhL4GtVNUcoSZe6eSHizBcK5LL7dBr2AUZlev1ARRHCljzRALIEog6H3U6bCIyqIZdAT0eBuJYaGiJaHSjmkYIZd+qSGWAQnIaz2OArVnX6vrItQvbhZJtVGB5qX9wKqCMkb9W7aexfCO/rwQRBzsDIsYx4AOz0nhAtWu7bqkEQBO0Pr+Ftjt5fFCUEbm0Sbgdu8WSgJ5NgH2iu46R/o1UcBXJsFusWF/QUaz3RwJMEgngfaGGdSxJkE/Yg4lOBryBiMwvAhZrVMUUvwqU7F05b5WLaUIN4M4hRocQQRnEedgsn7TZB3UCpRrIJwQfqvGwsg18EnI2uSVNC8t+0QmMXogvbPg/xk+Mnw/6kW/rraUlvqgmFreAA09xW5t0AFlHrQZ3CsgvZm0FbHNKyBmheBKIF2cCA8A600aHPmFtRB1XvMsJAiza7LpPog0UJwccKdzw8rdf8MyN2ePYF896LC5hTzdZqxb6VNXInaupARLDNBWgI8spq4T0Qb5H4vWfPmHo8OyB1ito+AysNNz0oglj1U955sjUN9d41LnrX2D/u7eRwxyOaOpfyevCWbTgDEoilsOnu7zsKhjRCsnD/QzhdkYLBLXjiK4f3UWmcx2M7PO21CKVTH84638NTplt6JIQH0ZwCNuiWAfvuLhdrcOYPVO9eW3A67l7hZtgaY9GZo9AFc6cryjoeFBIWeU+npnk/nLE0OxCHL1eQsc1IciehjpJv5mqCsjeopaH6r15/MrxNnVhu7tmcslay2gO2Z1QfcfX0JMACG41/u0RrI9QAAAABJRU5ErkJggg==)](https://onebot.dev/)
[![oneBot V12](https://img.shields.io/badge/onebot-v12-black?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABwCAMAAADxPgR5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAxQTFRF////29vbr6+vAAAAk1hCcwAAAAR0Uk5T////AEAqqfQAAAKcSURBVHja7NrbctswDATQXfD//zlpO7FlmwAWIOnOtNaTM5JwDMa8E+PNFz7g3waJ24fviyDPgfhz8fHP39cBcBL9KoJbQUxjA2iYqHL3FAnvzhL4GtVNUcoSZe6eSHizBcK5LL7dBr2AUZlev1ARRHCljzRALIEog6H3U6bCIyqIZdAT0eBuJYaGiJaHSjmkYIZd+qSGWAQnIaz2OArVnX6vrItQvbhZJtVGB5qX9wKqCMkb9W7aexfCO/rwQRBzsDIsYx4AOz0nhAtWu7bqkEQBO0Pr+Ftjt5fFCUEbm0Sbgdu8WSgJ5NgH2iu46R/o1UcBXJsFusWF/QUaz3RwJMEgngfaGGdSxJkE/Yg4lOBryBiMwvAhZrVMUUvwqU7F05b5WLaUIN4M4hRocQQRnEedgsn7TZB3UCpRrIJwQfqvGwsg18EnI2uSVNC8t+0QmMXogvbPg/xk+Mnw/6kW/rraUlvqgmFreAA09xW5t0AFlHrQZ3CsgvZm0FbHNKyBmheBKIF2cCA8A600aHPmFtRB1XvMsJAiza7LpPog0UJwccKdzw8rdf8MyN2ePYF896LC5hTzdZqxb6VNXInaupARLDNBWgI8spq4T0Qb5H4vWfPmHo8OyB1ito+AysNNz0oglj1U955sjUN9d41LnrX2D/u7eRwxyOaOpfyevCWbTgDEoilsOnu7zsKhjRCsnD/QzhdkYLBLXjiK4f3UWmcx2M7PO21CKVTH84638NTplt6JIQH0ZwCNuiWAfvuLhdrcOYPVO9eW3A67l7hZtgaY9GZo9AFc6cryjoeFBIWeU+npnk/nLE0OxCHL1eQsc1IciehjpJv5mqCsjeopaH6r15/MrxNnVhu7tmcslay2gO2Z1QfcfX0JMACG41/u0RrI9QAAAABJRU5ErkJggg==)](https://12.onebot.dev/) 
[![node engine](https://img.shields.io/node/v/onebots?color=339933&style=flat-square&labelColor=FAFAFA&logo=Node.js)](https://nodejs.org)
[![qq group](https://img.shields.io/badge/group-860669870-blue?style=flat-square&labelColor=FAFAFA&logo=data:image/png;base64,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&logoColor=000000)](https://jq.qq.com/?_wv=1027&k=B22VGXov)

[Docs](https://docs.onebots.org)

</div>

## 📖 简介

OneBots 是一个基于 TypeScript 开发的多平台、多协议机器人应用框架。它提供了统一的接口来连接和管理不同平台的机器人，支持 OneBot V11/V12、Satori、Milky 等多种协议。

### ✨ 核心特性

- 🎯 **多平台支持** - 支持 QQ、Kook、微信、Discord 等多个平台
- 📡 **多协议支持** - 支持 OneBot V11/V12、Satori、Milky 等协议
- 🔌 **插件化架构** - 适配器和协议可动态加载
- 🏗️ **模块化设计** - 清晰的代码结构，易于扩展和维护
- 📦 **Monorepo 管理** - 使用 pnpm workspace 统一管理
- 🎨 **Web 管理界面** - 内置可视化管理界面（可选）
- 🔄 **事件驱动** - 基于事件的通信机制
- 📝 **TypeScript** - 完整的类型支持

## 📦 项目结构

本项目采用 **pnpm workspace** 管理的 Monorepo 结构：

```
onebots/
├── packages/                    # 核心包
│   ├── core/                   # @onebots/core - 核心抽象层
│   ├── onebots/                # onebots - 主应用包
│   ├── web/                    # @onebots/web - Web 管理界面
│   └── imhelper/               # imhelper - 客户端SDK核心
├── adapters/                    # 适配器包
│   ├── adapter-qq/             # @onebots/adapter-qq - QQ官方机器人适配器
│   ├── adapter-kook/           # @onebots/adapter-kook - Kook适配器
│   ├── adapter-wechat/         # @onebots/adapter-wechat - 微信适配器
│   └── adapter-discord/        # @onebots/adapter-discord - Discord适配器
├── protocols/                   # 协议包
│   ├── onebot-v11/
│   │   ├── protocol/           # @onebots/protocol-onebot-v11 - OneBot V11协议实现
│   │   └── sdk/             # @imhelper/onebot-v11 - OneBot V11客户端SDK
│   ├── onebot-v12/
│   │   ├── protocol/           # @onebots/protocol-onebot-v12 - OneBot V12协议实现
│   │   └── sdk/             # @imhelper/onebot-v12 - OneBot V12客户端SDK
│   ├── satori-v1/
│   │   ├── protocol/           # @onebots/protocol-satori-v1 - Satori协议实现
│   │   └── sdk/             # @imhelper/satori-v1 - Satori客户端SDK
│   └── milky-1/
│       ├── protocol/           # @onebots/protocol-milky-v1 - Milky协议实现
│       └── sdk/              # @imhelper/milky-v1 - Milky客户端SDK
├── development/                 # 开发环境配置
├── docs/                        # 文档
└── pnpm-workspace.yaml         # workspace 配置
```

### 📚 包名规范

#### 服务器端包（`@onebots/*`）

- `@onebots/core` - 核心抽象层，提供适配器、协议、账号等基础接口
- `onebots` - 主应用包，提供命令行工具和完整应用功能
- `@onebots/web` - Web 管理界面
- `@onebots/adapter-*` - 各平台适配器（qq、kook、wechat、discord）
- `@onebots/protocol-*` - 各协议实现（onebot-v11、onebot-v12、satori-v1、milky-v1）

#### 客户端SDK包（`imhelper` / `@imhelper/*`）

- `imhelper` - 客户端SDK核心包，提供统一的客户端接口和接收器
- `@imhelper/onebot-v11` - OneBot V11 客户端SDK
- `@imhelper/onebot-v12` - OneBot V12 客户端SDK
- `@imhelper/satori-v1` - Satori 客户端SDK
- `@imhelper/milky-v1` - Milky 客户端SDK

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/liucl-cn/onebots.git
cd onebots

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 运行服务器（开发环境）
pnpm dev

# 运行 Web 管理界面（可选）
pnpm web:dev

# 运行客户端SDK开发测试（可选）
pnpm sdk:dev

# 运行文档（可选）
pnpm docs:dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 仅构建核心包
pnpm build:packages

# 仅构建适配器和协议
pnpm build:rest
```

### 测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 测试UI
pnpm test:ui

# 测试覆盖率
pnpm test:coverage
```

## 📖 使用指南

### 服务器端使用

#### 1. 安装主应用包

```bash
npm install onebots
# 或
pnpm add onebots
```

#### 2. 安装所需适配器

```bash
# QQ官方机器人适配器
npm install @onebots/adapter-qq

# Kook适配器
npm install @onebots/adapter-kook

# 微信适配器
npm install @onebots/adapter-wechat

# Discord适配器
npm install @onebots/adapter-discord
```

#### 3. 创建配置文件

创建 `config.yaml`:

```yaml
# 全局配置
port: 6727              # HTTP 服务器端口
log_level: info         # 日志级别

# 通用配置（协议默认配置）
general:
  onebot.v11:
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000
  onebot.v12:
    use_http: true
    use_ws: true
    access_token: ''
    heartbeat_interval: 5000
  satori.v1:
    use_http: true
    use_ws: true
    token: ''
  milky.v1:
    use_http: true
    use_ws: true

# 账号配置
kook.zhin:
  token: 'your_kook_token'
  onebot.v11:
    access_token: 'kook_v11_token'
  onebot.v12:
    access_token: 'kook_v12_token'
```

#### 4. 启动应用

```bash
# 使用命令行工具
npx onebots -r kook -r qq -p onebot-v11 -p onebot-v12 -c config.yaml

# 或使用 Node.js
import { App } from 'onebots';

const app = new App();
await app.start();
```

### 客户端SDK使用

#### 1. 安装客户端SDK核心包

```bash
npm install imhelper
# 或
pnpm add imhelper
```

#### 2. 安装协议客户端包

```bash
# OneBot V11 客户端
npm install @imhelper/onebot-v11

# OneBot V12 客户端
npm install @imhelper/onebot-v12

# Satori 客户端
npm install @imhelper/satori-v1

# Milky 客户端
npm install @imhelper/milky-v1
```

#### 3. 使用示例

```typescript
// OneBot V11 客户端示例
import { OneBotV11Client } from '@imhelper/onebot-v11';

const client = new OneBotV11Client({
  baseUrl: 'http://localhost:6727',
  platform: 'kook',
  accountId: 'zhin',
  accessToken: 'your_token',
  receiveMode: 'websocket', // 或 'webhook', 'sse'
});

// 监听事件
client.onEvent((event) => {
  if (event.post_type === 'message') {
    console.log('收到消息:', event);
  }
});

// 连接
await client.connect();

// 发送消息
await client.sendPrivateMsg(123456, 'Hello!');
```

更多客户端SDK使用示例，请参考各协议客户端的 README：
- [OneBot V11 客户端](./protocols/onebot-v11/sdk/README.md)
- [OneBot V12 客户端](./protocols/onebot-v12/sdk/README.md)

## 🎯 支持的平台

- ✅ **QQ官方机器人** - 通过 `@onebots/adapter-qq`
- ✅ **Kook** - 通过 `@onebots/adapter-kook`
- ✅ **微信** - 通过 `@onebots/adapter-wechat`
- ✅ **Discord** - 通过 `@onebots/adapter-discord`

## 📡 支持的协议

- ✅ **OneBot V11** - 标准 OneBot V11 协议
- ✅ **OneBot V12** - 标准 OneBot V12 协议
- ✅ **Satori** - Satori 协议
- ✅ **Milky** - Milky 协议

## 📚 文档

- [完整文档](https://docs.onebots.org)
- [架构文档](./packages/core/ARCHITECTURE.md)
- [核心包文档](./packages/core/README.md)
- [主应用包文档](./packages/onebots/README.md)

## 🔧 开发

### 项目结构说明

- **packages/core** - 核心抽象层，定义适配器、协议、账号等基础接口
- **packages/onebots** - 主应用包，提供命令行工具和应用逻辑
- **packages/web** - Web 管理界面
- **packages/client** - 客户端SDK核心包
- **adapters/** - 各平台适配器实现
- **protocols/** - 各协议实现和客户端SDK

### 添加新适配器

1. 在 `adapters/` 目录下创建新适配器目录
2. 实现 `Adapter` 基类的抽象方法
3. 在 `adapters/*/package.json` 中配置包名和依赖
4. 在主应用的 `optionalDependencies` 中添加新适配器

### 添加新协议

1. 在 `protocols/` 目录下创建新协议目录
2. 在 `protocol/` 子目录中实现协议服务端逻辑
3. 在 `client/` 子目录中实现协议客户端SDK
4. 在 `protocols/*/protocol/package.json` 和 `protocols/*/client/package.json` 中配置包名

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解贡献指南。

## 📄 许可证

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情

## 🙏 鸣谢

1. [icqqjs/icqq](https://github.com/icqqjs/icqq) - 底层服务支持
2. [takayama-lily/onebot](https://github.com/takayama-lily/node-onebot) - OneBot V11 参考实现
3. [zhinjs/kook-client](https://github.com/zhinjs/kook-client) - Kook 客户端参考
4. [zhinjs/qq-official-bot](https://github.com/zhinjs/qq-official-bot) - QQ官方机器人参考

## 📞 联系方式

- QQ群: [860669870](https://jq.qq.com/?_wv=1027&k=B22VGXov)
- GitHub Issues: [https://github.com/lc-cn/onebots/issues](https://github.com/lc-cn/onebots/issues)

---

<div align="center">
  Made with ❤️ by 凉菜
</div>
