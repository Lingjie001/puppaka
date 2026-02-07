const Database = require('./database');
const db = new Database();

// 创建示例博客文章
const samplePosts = [
  {
    title: '欢迎来到 PUPPAKA',
    slug: 'welcome-to-puppaka',
    content: `# 欢迎来到 PUPPAKA

这是你的个人博客和作品集网站。这个网站使用 Node.js 构建，具有以下特点：

## 功能特性

- **深色科技风格**：现代、简约的深色界面
- **响应式设计**：完美适配所有设备
- **博客系统**：支持 Markdown 格式的文章
- **作品集展示**：展示你的项目和创作
- **管理后台**：方便的内容管理系统
- **图片画廊**：支持图片上传和展示

## 技术栈

- **后端**：Node.js + Express
- **数据库**：SQLite
- **前端**：EJS 模板引擎 + 自定义 CSS
- **安全**：Helmet、速率限制、输入验证

## 开始使用

1. 登录管理后台：\`/admin\`
2. 默认账号：admin / admin123
3. 创建你的第一篇文章
4. 添加你的项目作品

## 自定义

你可以通过以下方式自定义网站：

- 修改 \`public/css/style.css\` 中的 CSS 变量
- 更新 \`views/layout.ejs\` 中的布局
- 添加新的页面和功能

祝你使用愉快！ 🚀`,
    excerpt: '欢迎来到你的个人博客和作品集网站，这里记录你的学习和创作旅程。',
    category: 'General',
    tags: 'welcome,setup,guide'
  },
  {
    title: 'Node.js 网站开发入门',
    slug: 'nodejs-website-development',
    content: `# Node.js 网站开发入门

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境，非常适合构建现代网站。

## 为什么选择 Node.js？

### 优点
- **全栈 JavaScript**：前后端使用同一种语言
- **高性能**：非阻塞 I/O 模型
- **丰富的生态**：npm 上有超过 100 万个包
- **易于部署**：支持各种云平台

### 核心概念
1. **模块系统**：CommonJS 和 ES Modules
2. **事件循环**：非阻塞 I/O 的关键
3. **包管理**：npm 和 yarn
4. **框架生态**：Express、Fastify、Koa

## 基本结构

一个典型的 Node.js 网站包含：

\`\`\`javascript
// server.js
const express = require('express');
const app = express();

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 路由
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 启动服务器
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## 数据库集成

SQLite 是一个轻量级数据库，非常适合个人项目：

\`\`\`javascript
const Database = require('better-sqlite3');
const db = new Database('data.db');

// 创建表
db.exec(\`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL
  )
\`);

// 插入数据
const stmt = db.prepare('INSERT INTO posts (title, content) VALUES (?, ?)');
stmt.run('Hello', 'World');
\`\`\`

## 部署

### 本地开发
\`\`\`bash
npm install
npm start
\`\`\`

### 生产环境
- 使用 PM2 管理进程
- 配置环境变量
- 启用 HTTPS
- 设置反向代理

## 学习资源

1. [Node.js 官方文档](https://nodejs.org/en/docs/)
2. [Express 指南](https://expressjs.com/)
3. [MDN Web Docs](https://developer.mozilla.org/)

希望这篇文章对你有帮助！`,
    excerpt: '学习如何使用 Node.js 构建现代网站，从基础概念到实际部署。',
    category: 'Technology',
    tags: 'nodejs,web-development,tutorial'
  },
  {
    title: '深色主题设计指南',
    slug: 'dark-theme-design-guide',
    content: `# 深色主题设计指南

深色主题在现代应用中越来越受欢迎，它不仅美观，还能减少眼睛疲劳。

## 设计原则

### 1. 对比度
- 文本与背景的对比度至少 4.5:1
- 重要元素使用更高的对比度
- 避免纯黑色背景，使用深灰色

### 2. 色彩层次
- 主背景：\`#0a0a0f\`
- 次要背景：\`#12121a\`
- 卡片背景：\`#1a1a25\`
- 边框：\`rgba(255, 255, 255, 0.1)\`

### 3. 强调色
- 主强调色：\`#6366f1\`（紫色）
- 次要强调色：\`#8b5cf6\`（紫罗兰）
- 渐变：\`linear-gradient(135deg, #6366f1, #8b5cf6)\`

## CSS 实现

### 使用 CSS 变量
\`\`\`css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0b0;
  --accent-primary: #6366f1;
  --border-color: rgba(255, 255, 255, 0.1);
}
\`\`\`

### 响应式设计
\`\`\`css
@media (max-width: 768px) {
  :root {
    --space-lg: 1.5rem;
    --space-xl: 2rem;
  }
}
\`\`\`

## 动画效果

### 微交互
- 悬停效果：颜色变化、阴影
- 点击反馈：缩放、涟漪效果
- 加载动画：骨架屏、进度条

### 页面过渡
\`\`\`css
.element {
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.element.visible {
  opacity: 1;
  transform: translateY(0);
}
\`\`\`

## 可访问性

### 键盘导航
- 确保所有交互元素可通过键盘访问
- 提供焦点指示器
- 支持快捷键

### 屏幕阅读器
- 使用语义化 HTML
- 提供 ARIA 标签
- 确保颜色不是唯一的信息传达方式

## 工具推荐

1. **颜色工具**
   - [Coolors](https://coolors.co/)
   - [Color Hunt](https://colorhunt.co/)

2. **设计系统**
   - [Material Design](https://material.io/)
   - [Ant Design](https://ant.design/)

3. **测试工具**
   - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - [Lighthouse](https://developers.google.com/web/tools/lighthouse)

深色主题不仅仅是颜色的改变，它需要仔细考虑对比度、可访问性和用户体验。`,
    excerpt: '学习如何设计美观且实用的深色主题，提升用户体验和可访问性。',
    category: 'Design',
    tags: 'design,dark-theme,ui-ux,css'
  }
];

// 创建示例项目
const sampleProjects = [
  {
    title: 'PUPPAKA 网站',
    slug: 'puppaka-website',
    description: '一个现代化的个人博客和作品集网站，采用深色科技风格设计。',
    content: `## 项目概述

PUPPAKA 是一个完全自主开发的个人网站，旨在展示博客文章和项目作品。

## 功能特点

### 核心功能
- 响应式深色主题设计
- 博客系统（支持 Markdown）
- 作品集展示
- 图片画廊
- 联系表单

### 技术特性
- 基于 Node.js 和 Express
- SQLite 数据库
- EJS 模板引擎
- 自定义 CSS 动画
- 安全防护（Helmet、速率限制）

## 技术栈

### 后端
- Node.js 18+
- Express.js
- better-sqlite3
- bcryptjs（密码加密）
- multer（文件上传）

### 前端
- EJS 模板引擎
- 自定义 CSS（CSS 变量）
- Vanilla JavaScript
- 响应式设计

### 开发工具
- nodemon（开发热重载）
- Git 版本控制
- ESLint（代码检查）

## 项目结构

\`\`\`
puppaka/
├── server.js          # 主服务器文件
├── database.js        # 数据库操作
├── routes/           # 路由文件
├── views/            # 模板文件
├── public/           # 静态资源
├── uploads/          # 上传文件
└── data/             # 数据库文件
\`\`\`

## 部署

### 本地开发
\`\`\`bash
git clone https://github.com/Lingjie001/puppaka.git
cd puppaka
npm install
npm start
\`\`\`

### 生产环境
- Hostinger Node.js 托管
- GitHub 自动部署
- 自定义域名（puppaka.com）

## 未来计划

1. **功能增强**
   - 评论系统
   - 搜索功能
   - 多语言支持

2. **性能优化**
   - 图片懒加载
   - 服务端缓存
   - CDN 集成

3. **用户体验**
   - 暗色/亮色主题切换
   - 离线支持
   - PWA 功能

## 源码
项目完全开源，代码托管在 GitHub 上。`,
    category: 'Web Development',
    technologies: 'Node.js,Express,SQLite,EJS,CSS,JavaScript',
    link: 'https://puppaka.com',
    github: 'https://github.com/Lingjie001/puppaka'
  },
  {
    title: '图片画廊组件',
    slug: 'image-gallery-component',
    description: '一个现代化的响应式图片画廊组件，支持灯箱效果和懒加载。',
    content: `## 图片画廊组件

一个完全使用原生 JavaScript 和 CSS 构建的图片画廊组件。

## 功能特性

### 核心功能
- 响应式网格布局
- 灯箱查看模式
- 图片懒加载
- 键盘导航（ESC 关闭，箭头切换）
- 触摸屏支持

### 用户体验
- 平滑的过渡动画
- 加载指示器
- 错误处理
- 可访问性支持

## 技术实现

### HTML 结构
\`\`\`html
<div class="gallery">
  <div class="gallery-grid">
    <img src="image1.jpg" alt="Description" class="gallery-item" data-src="large-image1.jpg">
    <img src="image2.jpg" alt="Description" class="gallery-item" data-src="large-image2.jpg">
  </div>
</div>
\`\`\`

### CSS 样式
\`\`\`css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.gallery-item {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}
\`\`\`

### JavaScript 逻辑
\`\`\`javascript
class ImageGallery {
  constructor(container) {
    this.container = container;
    this.items = container.querySelectorAll('.gallery-item');
    this.init();
  }
  
  init() {
    this.items.forEach(item => {
      item.addEventListener('click', () => this.openLightbox(item));
    });
  }
  
  openLightbox(item) {
    // 创建灯箱
    const lightbox = this.createLightbox(item);
    document.body.appendChild(lightbox);
  }
  
  createLightbox(item) {
    // 灯箱实现
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    // ... 更多代码
    return lightbox;
  }
}
\`\`\`

## 性能优化

### 图片优化
- WebP 格式支持
- 响应式图片（srcset）
- 懒加载（Intersection Observer）
- 预加载关键图片

### 代码优化
- 模块化 JavaScript
- CSS 变量
- 最小化 DOM 操作
- 事件委托

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 使用示例

\`\`\`javascript
// 初始化画廊
const gallery = new ImageGallery(document.querySelector('.gallery'));

// 动态添加图片
gallery.addImage('new-image.jpg', 'New Image');
\`\`\`

## 源码
组件代码完全开源，可自由使用和修改。`,
    category: 'Frontend',
    technologies: 'JavaScript,CSS,HTML,Responsive Design',
    github: 'https://github.com/Lingjie001/image-gallery'
  }
];

// 插入示例数据
console.log('📝 创建示例数据...');

try {
  // 清空现有数据（可选）
  // db.db.exec('DELETE FROM posts');
  // db.db.exec('DELETE FROM projects');
  
  // 插入博客文章
  samplePosts.forEach(post => {
    try {
      db.createPost(post);
      console.log(`✅ 创建文章: ${post.title}`);
    } catch (e) {
      // 如果已存在，跳过
    }
  });
  
  // 插入项目
  sampleProjects.forEach(project => {
    try {
      db.createProject(project);
      console.log(`✅ 创建项目: ${project.title}`);
    } catch (e) {
      // 如果已存在，跳过
    }
  });
  
  console.log('🎉 示例数据创建完成！');
  console.log('📊 统计:');
  console.log(`   - 文章: ${db.getPostCount()}`);
  console.log(`   - 项目: ${db.getProjects(1000).length}`);
  
} catch (error) {
  console.error('❌ 创建示例数据失败:', error);
}