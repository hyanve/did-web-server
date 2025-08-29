# DID Web Server

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![DID Web](https://img.shields.io/badge/DID-Web%20Method-orange.svg)](https://w3c-ccg.github.io/did-method-web/)
[![W3C](https://img.shields.io/badge/W3C-DID%20Core-red.svg)](https://w3c.github.io/did-core/)

[🇺🇸 English](./README.md) | 🇨🇳 中文

## 项目介绍

这是一个基于 Express.js 构建的现代化 DID Web 服务器，使用官方的 `@digitalbazaar/did-method-web` 库提供完整的去中心化身份标识符(DID)服务。

### 核心特性

- 🔐 **官方库支持**: 使用 `@digitalbazaar/did-method-web` 确保符合最新规范
- 🔑 **现代密钥类型**: 支持 Ed25519VerificationKey2020 和 X25519KeyAgreementKey2020
- 🌐 **动态域名**: 支持任意域名部署，无需修改 DID 文档
- ⚡ **自动生成**: 提供 DID 文档自动生成 API
- 📋 **完整权限**: 支持 authentication、assertionMethod、capabilityDelegation 等完整权限体系
- 🔒 **重复检测**: 自动检测并防止 DID 标识符重复

## 服务器配置

- **默认端口**: 8522
- **框架**: Express.js 4.18+
- **DID 库**: @digitalbazaar/did-method-web
- **密钥类型**: Ed25519VerificationKey2020, X25519KeyAgreementKey2020
- **协议**: HTTP/HTTPS
- **Node.js**: 18+ 支持

## 功能特性

### 1. DID 文档解析服务

支持标准的 DID Web 格式解析，遵循 W3C DID Web 规范。所有 DID 文档使用官方的 `@digitalbazaar/did-method-web` 库生成，确保符合最新的 W3C 标准。

### 2. DID 文档自动生成

支持自动生成符合规范的 DID 文档，包含：

- **Ed25519VerificationKey2020**: 用于数字签名和身份验证
- **X25519KeyAgreementKey2020**: 用于密钥协商和加密通信
- **完整权限体系**: authentication、assertionMethod、capabilityDelegation、capabilityInvocation
- **重复检测**: 自动检测并防止 DID 标识符重复

### 3. 路由支持

#### 核心DID路由

- **GET** `/.well-known/did.json`
  - 功能: 获取根域名的DID文档
  - 访问示例: `http://localhost:8522/.well-known/did.json`
  - 对应DID: `did:web:localhost:8522`
  - 返回: DID文档JSON格式

- **GET** `/{path}/did.json`
  - 功能: 获取指定路径的DID文档 (符合W3C DID Web规范)
  - 访问示例: `http://localhost:8522/alice/did.json`
  - 对应DID: `did:web:localhost:8522:alice`
  - 返回: 对应路径的DID文档

- **GET** `/{path1}/{path2}/did.json`
  - 功能: 获取多级路径的DID文档
  - 访问示例: `http://localhost:8522/user/alice/did.json`
  - 对应DID: `did:web:localhost:8522:user:alice`
  - 返回: 对应多级路径的DID文档

#### 健康检查

- **GET** `/health`
  - 功能: 服务器健康状态检查
  - 访问示例: `http://localhost:8522/health`
  - 返回: 服务器状态信息

#### DID 生成 API

- **POST** `/api/did/generate`
  - 功能: 使用 @digitalbazaar/did-method-web 生成新的用户 DID 文档
  - 格式: `did:web:{domain}:user:{16位随机字符串}`
  - 示例: `curl -X POST http://localhost:8522/api/did/generate`
  - 返回: 完整的 DID 文档和密钥信息

- **POST** `/api/did/generate-root`
  - 功能: 生成/更新根域名 DID 文档
  - 格式: `did:web:{domain}`
  - 示例: `curl -X POST http://localhost:8522/api/did/generate-root`
  - 返回: 根域名的完整 DID 文档

#### 工具类 API

- **GET** `/api/info`
  - 功能: 获取API版本和服务信息
  - 访问示例: `http://localhost:8522/api/info`
  - 返回: API版本、支持的功能列表

## 项目结构

```
did-web-server/
├── main.js                      # 服务器入口文件
├── package.json                # 项目配置和依赖
├── package-lock.json           # 依赖版本锁定
├── README.md                  # 项目说明文档
├── .env.example               # 环境变量示例
└── data/
    └── did-documents/        # DID 文档存储目录
        ├── root.json           # 根域名 DID 文档
        └── user:*.json         # 用户 DID 文档 (自动生成)
```

## 依赖库

### 核心依赖

- **@digitalbazaar/did-method-web**: W3C DID Web 方法官方实现
- **@digitalbazaar/ed25519-verification-key-2020**: Ed25519 验证密钥
- **@digitalbazaar/x25519-key-agreement-key-2020**: X25519 密钥协商密钥
- **express**: Web 应用框架
- **cors**: 跨域资源共享支持
- **dotenv**: 环境变量管理

## DID 文档管理

### 使用 API 生成 DID 文档（推荐）

使用内置的 API 接口可以自动生成符合 W3C 规范的 DID 文档：

```bash
# 生成新的用户 DID
curl -X POST http://localhost:8522/api/did/generate

# 生成/更新根域名 DID
curl -X POST http://localhost:8522/api/did/generate-root
```

### 手动添加 DID 文档

1. 在 `data/did-documents/` 目录下创建新的 JSON 文件
2. 文件名格式：`user:{16位随机字符}.json` 或 `{path}.json`
3. 文件内容需符合 W3C DID 规范，并使用 `{{DOMAIN}}` 占位符

### 现代化 DID 文档格式（使用官方库生成）

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1",
    "https://w3id.org/security/suites/x25519-2020/v1"
  ],
  "id": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7",
  "verificationMethod": [{
    "id": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf...",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7",
    "publicKeyMultibase": "z6Mkf..."
  }],
  "authentication": ["did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf..."],
  "assertionMethod": ["did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf..."],
  "capabilityDelegation": ["did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf..."],
  "capabilityInvocation": ["did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6Mkf..."],
  "keyAgreement": [{
    "id": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7#z6LS...",
    "type": "X25519KeyAgreementKey2020",
    "controller": "did:web:{{DOMAIN}}:user:ABC123DEF456GHI7",
    "publicKeyMultibase": "z6LS..."
  }]
}
```

## 快速开始

### 安装和启动

```bash
# 克隆项目
git clone <repository-url>
cd did-web-server

# 安装依赖
npm install

# 启动服务器
npm start
```

### 不同环境的启动方式

```bash
# 开发模式
npm run dev    # 使用 nodemon 热重载

# 生产模式
npm run prod   # 设置 NODE_ENV=production

# 直接启动
npm start      # 直接运行 main.js
```

### 验证部署

服务器启动后，访问以下地址验证部署：

```bash
# 检查服务状态
curl http://localhost:8522/health

# 查看 API 信息
curl http://localhost:8522/api/info

# 访问根 DID 文档
curl http://localhost:8522/.well-known/did.json
```

## API 使用示例

### 1. 生成 DID 文档

```bash
# 生成新的用户 DID
curl -X POST http://localhost:8522/api/did/generate \
  -H "Content-Type: application/json"

# 返回示例：
# {
#   "success": true,
#   "did": "did:web:localhost:8522:user:ABC123DEF456GHI7",
#   "document": { ... },
#   "accessUrl": "http://localhost:8522/user/ABC123DEF456GHI7/did.json",
#   "keyPairs": { ... }
# }
```

### 2. 获取 DID 文档

```bash
# 获取根域名 DID 文档
curl http://localhost:8522/.well-known/did.json

# 获取用户 DID 文档
curl http://localhost:8522/user/ABC123DEF456GHI7/did.json

# 获取多级路径 DID 文档
curl http://localhost:8522/user/alice/did.json
```

### 3. 管理和监控

```bash
# 检查服务健康状态
curl http://localhost:8522/health

# 查看 API 和服务信息
curl http://localhost:8522/api/info

# 生成新的根 DID 文档
curl -X POST http://localhost:8522/api/did/generate-root
```

## W3C DID Web 规范说明

本服务器严格遵循 W3C DID Web Method 规范，并使用官方 `@digitalbazaar/did-method-web` 库：

### DID 格式
- **根域名**: `did:web:{domain}`
- **用户路径**: `did:web:{domain}:user:{16位随机字符}`
- **多级路径**: `did:web:{domain}:{path1}:{path2}`

### 解析规则
1. `did:web:example.com` → `https://example.com/.well-known/did.json`
2. `did:web:example.com:user:ABC123` → `https://example.com/user/ABC123/did.json`
3. `did:web:example.com:user:alice` → `https://example.com/user/alice/did.json`

### 关键区别
- **根域名使用** `/.well-known/did.json`
- **有路径的 DID 直接使用路径** + `/did.json`，不再使用 `.well-known`

### 密钥类型支持
- **Ed25519VerificationKey2020**: 数字签名、身份验证
- **X25519KeyAgreementKey2020**: 密钥协商、加密通信

### 权限体系
- **authentication**: 身份认证
- **assertionMethod**: 声明方法
- **capabilityDelegation**: 能力委托
- **capabilityInvocation**: 能力调用
- **keyAgreement**: 密钥协商

## 错误处理

服务器提供完善的错误处理机制：

- **404 Not Found**: DID 文档不存在
- **400 Bad Request**: 无效的 DID 格式或请求参数
- **500 Internal Server Error**: 服务器内部错误

### 错误响应示例

```json
{
  "error": "DID document not found",
  "message": "No DID document found for path: nonexistent",
  "requestedPath": "/nonexistent/did.json"
}
```

## 配置说明

### 环境变量配置

服务器支持以下环境变量配置：

- `PORT`: 服务端口（默认: 8522）
- `DID_DOMAIN`: DID域名配置（默认: localhost:PORT）
- `NODE_ENV`: 运行环境（development/production）

### 域名配置

1. **本地开发**:
   ```bash
   DID_DOMAIN=localhost:8522
   ```

2. **生产环境**:
   ```bash
   DID_DOMAIN=yourdomain.com
   # 或者
   DID_DOMAIN=did-server.example.com
   ```

3. **使用.env文件**:
   ```bash
   cp .env.example .env
   # 编辑.env文件中的DID_DOMAIN配置
   ```

### DID文档动态域名

DID文档中使用`{{DOMAIN}}`占位符，服务器启动时会自动替换为配置的域名：

```json
{
  "id": "did:web:{{DOMAIN}}:alice",
  "verificationMethod": [{
    "id": "did:web:{{DOMAIN}}:alice#key-1",
    "controller": "did:web:{{DOMAIN}}:alice"
  }]
}
```

服务器配置，用于托管和解析基于Web的DID文档。

## 扩展功能

### 已实现功能

- ✅ **DID 文档解析**: 符合 W3C 规范的 DID Web 解析
- ✅ **自动 DID 生成**: 使用官方库生成安全的 DID 文档
- ✅ **现代密钥类型**: Ed25519 和 X25519 密钥支持
- ✅ **动态域名**: 支持任意域名配置
- ✅ **重复检测**: 防止 DID 标识符冲突
- ✅ **RESTful API**: 完整的 API 接口
- ✅ **健康检查**: 服务监控和状态检查

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 相关链接

- [W3C DID Core Specification](https://w3c.github.io/did-core/)
- [W3C DID Web Method Specification](https://w3c-ccg.github.io/did-method-web/)
- [@digitalbazaar/did-method-web](https://github.com/digitalbazaar/did-method-web)
- [Express.js 官方文档](https://expressjs.com/)