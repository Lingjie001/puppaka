/**
 * Hostinger 简化版启动文件
 * 去掉复杂逻辑，确保能启动
 */
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting PUPPAKA on Hostinger...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// 使用内存数据库（Hostinger 免费版无法写入文件）
const db = new sqlite3.Database(':memory:');

// 初始化数据库表
db.serialize(() => {
  // 文章表
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    category TEXT,
    tags TEXT,
    published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 项目表
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    featured_image TEXT,
    images TEXT,
    category TEXT,
    technologies TEXT,
    link TEXT,
    github TEXT,
    published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 联系表
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 插入默认管理员
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password, email) VALUES (?, ?, ?)`,
    ['admin', hashedPassword, 'admin@puppaka.com']);

  // 插入示例文章
  db.run(`INSERT OR IGNORE INTO posts (title, slug, content, excerpt, category, tags, published) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['欢迎使用 PUPPAKA', 'welcome', '这是您的第一篇文章！PUPPAKA 是一个现代化的个人博客和作品集网站。', '欢迎使用 PUPPAKA 个人网站平台。', '教程', '开始,教程', 1]);

  // 插入示例项目
  db.run(`INSERT OR IGNORE INTO projects (title, slug, description, content, category, technologies, published) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['PUPPAKA 网站', 'puppaka-website', '基于 Node.js 的个人网站', '使用 Express + EJS + SQLite 构建', 'Web开发', 'Node.js,Express,EJS', 1]);
});

console.log('✅ Database ready (in-memory)');

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // Hostinger 上禁用 CSP 避免问题
}));

app.use(compression());

// 会话
app.use(session({
  secret: process.env.SESSION_SECRET || 'puppaka-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Hostinger 上使用 http
}));

// 模板引擎
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 全局变量
app.locals.siteName = 'PUPPAKA';
app.locals.siteDescription = 'Personal Blog & Portfolio';

// 数据库操作函数
const getPosts = (limit = 10, offset = 0) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?`, 
      [limit, offset], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const getProjects = (limit = 10) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM projects WHERE published = 1 ORDER BY created_at DESC LIMIT ?`, 
      [limit], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// 路由
app.get('/', async (req, res) => {
  try {
    const posts = await getPosts(6);
    const projects = await getProjects(6);
    res.render('index', { posts, projects, user: req.session.user || null, path: '/', title: '', description: 'Personal Blog & Portfolio' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.get('/blog', async (req, res) => {
  try {
    const posts = await getPosts(10);
    res.render('blog', { posts, page: 1, totalPages: 1, user: req.session.user || null, path: '/blog', title: '博客', description: '所有文章' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.get('/portfolio', async (req, res) => {
  try {
    const projects = await getProjects(100);
    res.render('portfolio', { projects, user: req.session.user || null, path: '/portfolio', title: '作品集', description: '我的项目' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.get('/about', (req, res) => {
  res.render('about', { user: req.session.user || null, path: '/about', title: '关于', description: '关于我' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { user: req.session.user || null, message: null, path: '/contact', title: '联系', description: '联系我' });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// 启动服务器 - 绑定到所有接口
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
