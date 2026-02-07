const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const fs = require('fs');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// 确保上传目录存在（使用 try-catch 避免 Hostinger 权限问题）
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Cannot create uploads directory:', err.message);
  // Hostinger 免费版可能无法写入，继续启动
}

// 数据库初始化（异步）
let db;
let dbReady = false;

async function initDatabase() {
  try {
    db = new Database();
    await db.ready(); // 等待初始化完成
    dbReady = true;
    console.log('✅ Database initialized and ready');
    return true;
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    console.error(err.stack);
    return false;
  }
}

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'"],
    },
  },
}));

app.use(compression());

// 限速
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// 会话
app.use(session({
  secret: process.env.SESSION_SECRET || 'puppaka-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// 模板引擎
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 全局变量
app.locals.siteName = 'PUPPAKA';
app.locals.siteDescription = 'Personal Blog & Portfolio';

// 首页
app.get('/', async (req, res) => {
  try {
    // 从数据库获取数据
    const posts = await db.getPosts(6);
    const projects = await db.getProjects(6);
    
    res.render('index', { 
      posts, 
      projects,
      user: req.session.user || null,
      path: '/',
      title: '',
      description: 'Personal Blog & Portfolio - Sharing thoughts and creations'
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      message: 'Server Error',
      user: req.session.user || null,
      path: '',
      title: '错误',
      description: '页面出现错误'
    });
  }
});

// 博客列表
app.get('/blog', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    // 从数据库获取数据
    const posts = await db.getPosts(limit, offset);
    const total = await db.getPostCount();
    const totalPages = Math.ceil(total / limit);
    
    res.render('blog', { 
      posts, 
      page, 
      totalPages,
      user: req.session.user || null,
      path: '/blog',
      title: '博客',
      description: '浏览所有博客文章'
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      message: 'Server Error',
      user: req.session.user || null,
      path: '',
      title: '错误',
      description: '页面出现错误'
    });
  }
});

// 博客详情
app.get('/blog/:slug', async (req, res) => {
  try {
    const post = await db.getPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).render('error', { 
        message: 'Post not found',
        user: req.session.user || null,
        path: '',
        title: '404',
        description: '文章不存在'
      });
    }
    const related = await db.getRelatedPosts(post.id, 3);
    res.render('post', { 
      post, 
      related, 
      user: req.session.user || null,
      path: '/blog',
      title: post.title,
      description: post.excerpt || post.title
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      message: 'Server Error',
      user: req.session.user || null,
      path: '',
      title: '错误',
      description: '页面出现错误'
    });
  }
});

// 作品集
app.get('/portfolio', async (req, res) => {
  try {
    // 从数据库获取数据
    const projects = await db.getProjects(100);
    
    res.render('portfolio', { 
      projects, 
      user: req.session.user || null,
      path: '/portfolio',
      title: '作品集',
      description: '浏览我的项目和作品'
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      message: 'Server Error',
      user: req.session.user || null,
      path: '',
      title: '错误',
      description: '页面出现错误'
    });
  }
});

// 项目详情
app.get('/portfolio/:slug', async (req, res) => {
  try {
    const project = await db.getProjectBySlug(req.params.slug);
    if (!project) {
      return res.status(404).render('error', { 
        message: 'Project not found',
        user: req.session.user || null,
        path: '',
        title: '404',
        description: '项目不存在'
      });
    }
    res.render('project', { 
      project, 
      user: req.session.user || null,
      path: '/portfolio',
      title: project.title,
      description: project.description
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      message: 'Server Error',
      user: req.session.user || null,
      path: '',
      title: '错误',
      description: '页面出现错误'
    });
  }
});

// 关于页面
app.get('/about', (req, res) => {
  res.render('about', { 
    user: req.session.user || null,
    path: '/about',
    title: '关于',
    description: '了解更多关于我和我的工作'
  });
});

// 联系页面
app.get('/contact', (req, res) => {
  res.render('contact', { 
    user: req.session.user || null, 
    message: null,
    path: '/contact',
    title: '联系',
    description: '通过表单联系我'
  });
});

// 联系表单提交
app.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    await db.saveContact({ name, email, subject, message });
    res.render('contact', { 
      user: req.session.user || null, 
      message: { type: 'success', text: 'Message sent successfully!' },
      path: '/contact',
      title: '联系',
      description: '通过表单联系我'
    });
  } catch (error) {
    console.error(error);
    res.render('contact', { 
      user: req.session.user || null, 
      message: { type: 'error', text: 'Failed to send message. Please try again.' },
      path: '/contact',
      title: '联系',
      description: '通过表单联系我'
    });
  }
});

// 管理后台路由
const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);

// API路由
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// 404处理
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found',
    user: req.session ? req.session.user : null,
    path: '',
    title: '404',
    description: '页面不存在'
  });
});

// 数据库就绪检查中间件
app.use(async (req, res, next) => {
  if (!dbReady) {
    // 等待数据库初始化
    const maxWait = 10000; // 最多等待10秒
    const startTime = Date.now();
    
    while (!dbReady && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!dbReady) {
      return res.status(503).render('error', {
        message: '服务正在启动，请稍后刷新',
        user: null,
        path: '',
        title: '启动中',
        description: '服务器正在初始化'
      });
    }
  }
  next();
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: 'Something went wrong!',
    user: req.session ? req.session.user : null,
    path: '',
    title: '错误',
    description: '服务器内部错误'
  });
});

// 异步启动服务器
async function startServer() {
  // 先初始化数据库
  const dbSuccess = await initDatabase();
  
  if (!dbSuccess) {
    console.error('❌ Cannot start server without database');
    // 即使数据库失败也启动服务器，但会显示错误页面
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 PUPPAKA server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${db && db.isHostinger ? 'In-Memory (Hostinger)' : 'File-based'}`);
  });
}

// 启动
startServer();

module.exports = app;