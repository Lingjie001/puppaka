# PUPPAKA 网站部署文档

**创建日期**: 2026-02-08
**服务器IP**: 62.72.24.229
**域名**: puppaka.com

---

## 📋 目录

1. [服务器信息](#1-服务器信息)
2. [网站文件结构](#2-网站文件结构)
3. [核心配置文件](#3-核心配置文件)
4. [PM2 进程管理](#4-pm2-进程管理)
5. [Nginx 配置](#5-nginx-配置)
6. [HTTPS 证书](#6-https-证书)
7. [自动部署](#7-自动部署)
8. [数据库](#8-数据库)
9. [常用命令](#9-常用命令)
10. [测试和维护](#10-测试和维护)
11. [故障排除](#11-故障排除)

---

## 1. 服务器信息

```
操作系统: Ubuntu 24.04.3 LTS
CPU: 1 核
内存: 3.8GB (可用 1.1GB)
磁盘: 48GB (可用 39GB)
Node.js: v22.22.0
npm: 10.9.4
```

**连接方式:**
```bash
ssh root@62.72.24.229
# 密码: [你的SSH密码]
```

---

## 2. 网站文件结构

```
/var/www/puppaka/
├── app.js                  # 主应用入口（使用中）
├── server.js               # 原始服务器入口
├── database.js             # 数据库配置（已修复为文件模式）
├── index.js                # 备用入口
├── package.json            # npm 配置
├── public/                # 静态文件
│   ├── css/
│   │   ├── style.css      # 主样式（带动画效果）
│   │   └── pages.css      # 页面样式
│   └── js/
│       └── main.js        # 主脚本
├── views/                  # EJS 模板
│   ├── layout.ejs          # 布局文件（已添加CSS版本号）
│   ├── index.ejs          # 首页
│   ├── blog.ejs          # 博客列表
│   └── ...
├── data/                   # 数据库文件（持久化）
│   └── puppaka.db         # SQLite 数据库
├── routes/                 # 路由
│   ├── admin.js           # 管理后台路由
│   └── api.js            # API 路由
├── deploy-api.js          # 部署API（OpenClaw集成）
└── .env.example          # 环境变量示例
```

---

## 3. 核心配置文件

### 3.1 app.js (主入口)
**路径**: `/var/www/puppaka/app.js`
**说明**: 简化的 Node.js 入口文件，使用内存数据库（但已修复为文件数据库）

### 3.2 database.js (数据库配置)
**路径**: `/var/www/puppaka/database.js`
**关键配置** (第23行):
```javascript
dbPath = './data/puppaka.db';  // 文件模式，持久化存储
```

### 3.3 views/layout.ejs (CSS版本控制)
**路径**: `/var/www/puppaka/views/layout.ejs`
**重要**: CSS链接带版本号强制刷新
```html
<link rel="stylesheet" href="/css/style.css?v=2">
<link rel="stylesheet" href="/css/pages.css?v=2">
```
**更新版本号方法:**
```bash
# 在布局文件中修改 ?v=数字
sed -i 's/\?v=[0-9]*/?v=3/' /var/www/puppaka/views/layout.ejs
```

---

## 4. PM2 进程管理

### 4.1 网站进程
```bash
# 查看状态
pm2 status

# 进程名称: puppaka
# 状态: online
# 端口: 3000
```

### 4.2 常用命令
```bash
# 查看所有进程
pm2 list

# 查看详细信息
pm2 info puppaka

# 重启应用
pm2 restart puppaka

# 重新加载（零停机）
pm2 reload puppaka

# 查看日志
pm2 logs puppaka

# 实时监控
pm2 monit

#开机自启
pm2 startup
pm2 save
```

### 4.3 部署API进程
```bash
# 查看状态
systemctl status puppaka-api

# 重启
systemctl restart puppaka-api

# 查看日志
journalctl -u puppaka-api -f
```

---

## 5. Nginx 配置

### 5.1 配置文件
**路径**: `/etc/nginx/sites-enabled/puppaka`

**内容**:
```nginx
server {
    listen 80;
    server_name puppaka.com www.puppaka.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name puppaka.com www.puppaka.com;

    ssl_certificate /etc/letsencrypt/live/puppaka.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/puppaka.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # CSS/JS 不缓存
    location ~* \.(css|js)$ {
        proxy_pass http://localhost:3000;
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }
}
```

### 5.2 常用命令
```bash
# 测试配置
nginx -t

# 重载配置
systemctl reload nginx

# 重启
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看错误日志
tail -20 /var/log/nginx/error.log
```

---

## 6. HTTPS 证书

**证书位置**: `/etc/letsencrypt/live/puppaka.com/`
```
fullchain.pem    # 完整证书链
privkey.pem      # 私钥
```

**自动续期**:
```bash
# 手动测试续期
certbot renew --dry-run

# 查看续期状态
systemctl list-timers | grep certbot

# 手动续期
certbot renew
```

**证书信息**:
- 颁发机构: Let's Encrypt
- 过期日期: 2026-05-09
- 自动续期: 已配置

---

## 7. 自动部署

### 7.1 部署脚本
**路径**: `/usr/local/bin/deploy.sh`

**内容**:
```bash
#!/bin/bash
cd /var/www/puppaka || exit 1

echo "$(date): 收到部署请求" >> /var/log/deploy.log

git fetch origin main >> /var/log/deploy.log 2>&1
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "$(date): 发现更新，开始部署" >> /var/log/deploy.log
    git reset --hard origin/main >> /var/log/deploy.log 2>&1
    npm install --production >> /var/log/deploy.log 2>&1
    pm2 reload puppaka >> /var/log/deploy.log 2>&1
    echo "$(date): ✅ 部署完成" >> /var/log/deploy.log
else
    echo "$(date): 已是最新版本" >> /var/log/deploy.log
fi

echo "OK"
```

### 7.2 定时任务
**检查命令**:
```bash
crontab -l
```

**当前配置**:
```bash
*/2 * * * * /usr/local/bin/deploy.sh  # 每2分钟检查更新
```

### 7.3 部署API (OpenClaw集成)
**URL**: `http://62.72.24.229:3001/deploy/puppaka-deploy-2026`
**Token**: `puppaka-deploy-2026`

**状态检查**: `http://62.72.24.229:3001/status`

### 7.4 GitHub 仓库
```bash
仓库地址: https://github.com/Lingjie001/puppaka
分支: main
认证: Personal Access Token (已保存)
```

---

## 8. 数据库

### 8.1 数据库文件
**路径**: `/var/www/puppaka/data/puppaka.db`
**类型**: SQLite

### 8.2 数据表
- `posts` - 文章
- `projects` - 项目
- `contacts` - 联系记录
- `users` - 用户（管理员）

### 8.3 备份和恢复
```bash
# 备份
cp /var/www/puppaka/data/puppaka.db /var/www/puppaka/data/puppaka_backup_$(date +%Y%m%d).db

# 恢复
cp /var/www/puppaka/data/puppaka_backup_20260208.db /var/www/puppaka/data/puppaka.db
pm2 reload puppaka
```

---

## 9. 常用命令

### 9.1 网站管理
```bash
# 重启网站
pm2 reload puppaka

# 查看状态
pm2 status puppaka

# 查看日志
pm2 logs puppaka --lines 20

# 强制重启
pm2 restart puppaka
```

### 9.2 代码更新
```bash
# 方法1: 自动部署（推荐）
# 修改GitHub代码 → 等待2分钟 → 自动更新

# 方法2: 手动触发
/usr/local/bin/deploy.sh

# 方法3: 强制更新
cd /var/www/puppaka
git reset --hard origin/main
pm2 reload puppaka
```

### 9.3 CSS更新
```bash
# 1. 修改CSS文件
nano /var/www/puppaka/public/css/style.css

# 2. 增加版本号（强制刷新）
sed -i 's/\?v=[0-9]*/?v=3/' /var/www/puppaka/views/layout.ejs

# 3. 重启应用
pm2 reload puppaka
```

### 9.4 日志查看
```bash
# 部署日志
tail -20 /var/log/deploy.log

# PM2 日志
pm2 logs puppaka

# Nginx 错误
tail -20 /var/log/nginx/error.log
```

### 9.5 系统信息
```bash
# 磁盘空间
df -h /

# 内存使用
free -h

# CPU负载
top

# Node.js 版本
node --version

# PM2 状态
pm2 status
```

---

## 10. 测试和维护

### 10.1 网站测试
```bash
# 本地测试
curl -s http://localhost:3000 | head -20

# HTTPS 测试
curl -sI https://puppaka.com

# 健康检查
curl -s http://localhost:3000/health

# API 状态
curl -s http://62.72.24.229:3001/status
```

### 10.2 性能监控
```bash
# PM2 监控面板
pm2 monit

# 系统资源
htop

# 磁盘使用
ncdu /var/www
```

### 10.3 安全检查
```bash
# 检查开放端口
netstat -tlnp

# SSH 登录尝试
last | head -20

# 异常进程
ps aux | grep node
```

---

## 11. 故障排除

### 11.1 网站打不开 (502/503)
```bash
# 1. 检查 PM2 状态
pm2 status

# 2. 如果进程不存在，启动它
pm2 start app.js --name puppaka
pm2 save
pm2 startup

# 3. 查看错误日志
pm2 logs puppaka --lines 50

# 4. 检查端口
netstat -tlnp | grep 3000

# 5. 如果端口被占用，杀掉进程
pkill -f "node.*puppaka"
pm2 start app.js --name puppaka
```

### 11.2 HTTPS 不工作
```bash
# 1. 检查证书状态
certbot certificates

# 2. 续期证书
certbot renew

# 3. 检查 Nginx 配置
nginx -t

# 4. 重启 Nginx
systemctl reload nginx
```

### 11.3 自动部署不工作
```bash
# 1. 手动运行部署脚本
/usr/local/bin/deploy.sh

# 2. 检查日志
tail -20 /var/log/deploy.log

# 3. 检查 Git 连接
cd /var/www/puppaka
git fetch origin main

# 4. 手动拉取测试
git reset --hard origin/main
pm2 reload puppaka
```

### 11.4 数据库问题
```bash
# 1. 检查数据库文件
ls -la /var/www/puppaka/data/

# 2. 测试数据库连接
cd /var/www/puppaka
node -e "const db = require('./database.js'); console.log('OK');"

# 3. 重新初始化
pm2 delete puppaka
npm install --production
pm2 start app.js --name puppaka
pm2 save
```

### 11.5 Nginx 问题
```bash
# 1. 测试配置
nginx -t

# 2. 查看错误日志
tail -50 /var/log/nginx/error.log

# 3. 检查进程
ps aux | grep nginx

# 4. 重启 Nginx
systemctl restart nginx
```

### 11.6 完全重置
```bash
# 如果一切都坏了，执行完全重置
cd /var/www/puppaka
pm2 delete all
systemctl stop nginx
systemctl stop puppaka-api

# 删除并重新克隆
rm -rf /var/www/puppaka
git clone https://github.com/Lingjie001/puppaka.git .
npm install --production

# 重新配置
sed -i 's/:memory:/.\/data\/puppaka.db/g' database.js
mkdir -p data
chmod 755 data

# 启动
pm2 start app.js --name puppaka
pm2 save
systemctl start puppaka-api
systemctl start nginx
```

---

## 📌 重要笔记

### 网站地址
- **主站**: https://puppaka.com
- **后台**: https://puppaka.com/admin
- **API**: http://62.72.24.229:3001/status

### 管理员账号
- **用户名**: admin
- **密码**: admin123 (建议修改)

### 默认端口
- **网站**: 3000 (内部), 443 (HTTPS外部)
- **部署API**: 3001

### GitHub Token
**已保存在服务器配置中，无需手动输入**

---

## 🚀 快速启动命令

```bash
# 连接服务器
ssh root@62.72.24.229

# 查看网站状态
pm2 status

# 重启网站
pm2 reload puppaka

# 查看部署日志
tail -20 /var/log/deploy.log

# 测试网站
curl -sI https://puppaka.com

# 查看API状态
curl -s http://62.72.24.229:3001/status
```

---

## ✅ 最后验证

**执行以下命令验证部署状态:**
```bash
pm2 status
curl -sI https://puppaka.com | head -5
ls -lh /var/www/puppaka/data/puppaka.db
cat /var/log/deploy.log | tail -3
```

**应该看到:**
- PM2 进程: online
- HTTPS: 200 OK
- 数据库: 文件存在
- 部署: 已完成

---

**文档版本**: 1.0
**最后更新**: 2026-02-08
**作者**: OpenCode AI
