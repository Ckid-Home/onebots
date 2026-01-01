# 贡献指南

感谢你对 OneBots 项目的关注！我们欢迎任何形式的贡献。

## 🚀 快速开始

### 环境要求

- Node.js >= 22
- pnpm >= 9.0.2

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/lc-cn/onebots.git
cd onebots

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 启动开发服务
pnpm dev
```

## 📁 项目结构

```
onebots/
├── packages/           # 核心包
│   ├── core/          # @onebots/core - 核心抽象层
│   ├── onebots/       # onebots - 主应用包
│   ├── web/           # @onebots/web - Web 管理界面
│   └── imhelper/      # imhelper - 客户端 SDK 核心
├── adapters/          # 平台适配器
│   ├── adapter-qq/    # QQ 官方机器人
│   ├── adapter-discord/  # Discord
│   ├── adapter-telegram/ # Telegram
│   └── ...            # 更多适配器
├── protocols/         # 协议实现
│   ├── onebot-v11/    # OneBot v11
│   ├── onebot-v12/    # OneBot v12
│   ├── satori-v1/     # Satori v1
│   └── milky-v1/      # Milky v1
├── docs/              # 文档
└── development/       # 开发环境
```

## 🔧 开发工作流

### 1. 创建分支

```bash
# 从 master 创建功能分支
git checkout -b feature/your-feature-name

# 或修复分支
git checkout -b fix/your-fix-name
```

### 2. 编写代码

- 遵循现有的代码风格
- 添加必要的类型注解
- 编写单元测试

### 3. 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter @onebots/core test

# 查看测试覆盖率
pnpm test:coverage
```

### 4. 提交更改

```bash
# 格式化代码
pnpm lint:fix

# 创建 changeset（如果有版本变更）
pnpm changeset

# 提交
git add .
git commit -m "feat: your feature description"
```

### 5. 提交 PR

- 确保所有测试通过
- 确保代码格式化
- 填写 PR 模板中的所有相关信息

## 📝 Commit 规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

| 类型 | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构（非新功能、非 Bug 修复） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具相关 |

示例：
```
feat(adapter-discord): add proxy support
fix(core): resolve memory leak in lifecycle manager
docs: update README with new badges
```

## 🆕 添加新适配器

1. 在 `adapters/` 目录创建新目录：
   ```bash
   mkdir adapters/adapter-yourplatform
   ```

2. 复制现有适配器结构：
   ```
   adapter-yourplatform/
   ├── package.json
   ├── tsconfig.json
   ├── README.md
   └── src/
       ├── index.ts
       ├── adapter.ts
       ├── bot.ts
       └── types.ts
   ```

3. 实现必要的接口：
   - `Adapter` - 适配器基类
   - `Bot` - 平台客户端封装
   - `types.ts` - 配置和类型定义

4. 在 `AdapterRegistry` 注册：
   ```typescript
   AdapterRegistry.register('yourplatform', YourAdapter, {
       name: 'yourplatform',
       displayName: 'Your Platform',
       description: '...',
       icon: 'https://...',
   });
   ```

5. 添加文档：
   - `adapters/adapter-yourplatform/README.md`
   - `docs/src/platform/yourplatform.md`
   - `docs/src/en/platform/yourplatform.md`

6. 更新主 README 和配置文档

## 🆕 添加新协议

1. 在 `protocols/` 目录创建：
   ```
   protocols/yourprotocol-v1/
   ├── protocol/     # 服务端实现
   │   ├── package.json
   │   ├── tsconfig.json
   │   └── src/
   │       └── index.ts
   └── sdk/          # 客户端 SDK
       ├── package.json
       ├── tsconfig.json
       └── src/
           └── index.ts
   ```

2. 实现 `Protocol` 基类的抽象方法

3. 在 `ProtocolRegistry` 注册

## 🐛 报告 Bug

请在 [GitHub Issues](https://github.com/lc-cn/onebots/issues) 提交 Bug 报告，包含：

- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息（OS、Node.js 版本等）
- 相关日志

## 💡 功能建议

欢迎在 [GitHub Discussions](https://github.com/lc-cn/onebots/discussions) 提出功能建议。

## 📄 许可证

通过提交 PR，你同意你的贡献将在 MIT 许可证下发布。

## 🙏 感谢

感谢所有贡献者的付出！

[![Contributors](https://contrib.rocks/image?repo=lc-cn/onebots)](https://github.com/lc-cn/onebots/graphs/contributors)

