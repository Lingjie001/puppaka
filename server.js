const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据库初始化
const db = new Database();

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
    // 使用示例数据
    const posts = [
      {
        id: 1,
        title: '欢迎来到 PUPPAKA',
        slug: 'welcome-to-puppaka',
        excerpt: '欢迎来到你的个人博客和作品集网站，这里记录你的学习和创作旅程。',
        content: '这是示例内容...',
        category: 'General',
        tags: 'welcome,setup,guide',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Node.js 网站开发入门',
        slug: 'nodejs-website-development',
        excerpt: '学习如何使用 Node.js 构建现代网站，从基础概念到实际部署。',
        content: '这是示例内容...',
        category: 'Technology',
        tags: 'nodejs,web-development,tutorial',
        created_at: new Date().toISOString()
      }
    ];
    
    const projects = [
      {
        id: 1,
        title: 'PUPPAKA 网站',
        slug: 'puppaka-website',
        description: '一个现代化的个人博客和作品集网站，采用深色科技风格设计。',
        category: 'Web Development',
        technologies: 'Node.js,Express,SQLite,EJS,CSS,JavaScript',
        link: 'https://puppaka.com',
        github: 'https://github.com/Lingjie001/puppaka',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: '图片画廊组件',
        slug: 'image-gallery-component',
        description: '一个现代化的响应式图片画廊组件，支持灯箱效果和懒加载。',
        category: 'Frontend',
        technologies: 'JavaScript,CSS,HTML,Responsive Design',
        github: 'https://github.com/Lingjie001/image-gallery',
        created_at: new Date().toISOString()
      }
    ];
    
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
    
    // 使用示例数据
    const posts = [
      {
        id: 1,
        title: '欢迎来到 PUPPAKA',
        slug: 'welcome-to-puppaka',
        excerpt: '欢迎来到你的个人博客和作品集网站，这里记录你的学习和创作旅程。',
        content: '这是示例内容...',
        category: 'General',
        tags: 'welcome,setup,guide',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Node.js 网站开发入门',
        slug: 'nodejs-website-development',
        excerpt: '学习如何使用 Node.js 构建现代网站，从基础概念到实际部署。',
        content: '这是示例内容...',
        category: 'Technology',
        tags: 'nodejs,web-development,tutorial',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: '深色主题设计指南',
        slug: 'dark-theme-design-guide',
        excerpt: '学习如何设计美观且实用的深色主题，提升用户体验和可访问性。',
        content: '这是示例内容...',
        category: 'Design',
        tags: 'design,dark-theme,ui-ux,css',
        created_at: new Date().toISOString()
      }
    ];
    
    const total = posts.length;
    const totalPages = Math.ceil(total / limit);
    
    res.render('blog', { 
      posts: posts.slice((page - 1) * limit, page * limit), 
      page, 
      totalPages,
      user: req.session.user 
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

// 博客详情
app.get('/blog/:slug', async (req, res) => {
  try {
    const post = await db.getPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).render('error', { message: 'Post not found' });
    }
    const related = await db.getRelatedPosts(post.id, 3);
    res.render('post', { post, related, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

// 作品集
app.get('/portfolio', async (req, res) => {
  try {
    // 使用示例数据
    const projects = [
      {
        id: 1,
        title: 'PUPPAKA 网站',
        slug: 'puppaka-website',
        description: '一个现代化的个人博客和作品集网站，采用深色科技风格设计。',
        content: '这是示例内容...',
        category: 'Web Development',
        technologies: 'Node.js,Express,SQLite,EJS,CSS,JavaScript',
        link: 'https://puppaka.com',
        github: 'https://github.com/Lingjie001/puppaka',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: '图片画廊组件',
        slug: 'image-gallery-component',
        description: '一个现代化的响应式图片画廊组件，支持灯箱效果和懒加载。',
        content: '这是示例内容...',
        category: 'Frontend',
        technologies: 'JavaScript,CSS,HTML,Responsive Design',
        github: 'https://github.com/Lingjie001/image-gallery',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'API 管理系统',
        slug: 'api-management-system',
        description: '一个完整的 API 管理和监控系统，支持速率限制和数据分析。',
        content: '这是示例内容...',
        category: 'Backend',
        technologies: 'Node.js,Express,MongoDB,Redis',
        github: 'https://github.com/Lingjie001/api-manager',
        created_at: new Date().toISOString()
      }
    ];
    
    res.render('portfolio', { projects, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

// 项目详情
app.get('/portfolio/:slug', async (req, res) => {
  try {
    const project = await db.getProjectBySlug(req.params.slug);
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found' });
    }
    res.render('project', { project, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

// 关于页面
app.get('/about', (req, res) => {
  res.render('about', { user: req.session.user });
});

// 联系页面
app.get('/contact', (req, res) => {
  res.render('contact', { user: req.session.user, message: null });
});

// 联系表单提交
app.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    await db.saveContact({ name, email, subject, message });
    res.render('contact', { 
      user: req.session.user, 
      message: { type: 'success', text: 'Message sent successfully!' }
    });
  } catch (error) {
    console.error(error);
    res.render('contact', { 
      user: req.session.user, 
      message: { type: 'error', text: 'Failed to send message. Please try again.' }
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
  res.status(404).render('error', { message: 'Page not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something went wrong!' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 PUPPAKA server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;