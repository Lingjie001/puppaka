# Hostinger Node.js 部署指南

## 1. 在 Hostinger 面板的配置

登录 Hostinger → 你的网站 → Advanced → Node.js

设置如下：
- **Node.js 版本**: 20.x (推荐)
- **启动文件**: `server.js`
- **应用程序模式**: 生产环境
- **端口**: 3000 (或留空让 Hostinger 自动分配)

## 2. 必需的环境变量

在 Hostinger 面板 → Advanced → 环境变量中添加：

```
NODE_ENV=production
HOSTINGER=true
PORT=3000
SESSION_SECRET=your-super-secret-key-change-this-now
```

## 3. 上传文件到 Hostinger

**方法 A - 使用 Git (推荐):**
```bash
# 在 Hostinger SSH 终端:
cd ~/public_html
git clone https://github.com/Lingjie001/puppaka.git .
npm install --production
```

**方法 B - 使用 FTP:**
- 上传所有文件（除了 node_modules）
- 然后在 SSH 中运行: `npm install --production`

## 4. 启动应用

在 Hostinger 面板点击 **Start** 或 **Restart**

## 5. 如果仍然 503

### 检查日志:
```bash
# SSH 连接到 Hostinger
cat ~/.pm2/logs/server-error.log
cat ~/.pm2/logs/server-out.log
```

### 常见错误修复:

**错误 1: EACCES permission denied**
解决: Hostinger 无法写入文件，确保 `HOSTINGER=true`

**错误 2: Port already in use**
解决: 更改 PORT 环境变量为其他值（如 3001, 8080）

**错误 3: Cannot find module**
解决: 重新安装依赖
```bash
rm -rf node_modules package-lock.json
npm install --production
```

## 6. 备用方案 - 使用 app.js

如果 server.js 不工作，尝试将 server.js 重命名为 app.js

## 7. 强制使用内存数据库

在 database.js 第17行，将检测改为强制内存模式：
```javascript
this.isHostinger = true; // 强制使用内存数据库
```
