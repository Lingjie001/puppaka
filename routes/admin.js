const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('../database');

const router = express.Router();
const db = new Database();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

// 登录检查中间件
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// 登录页
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: null });
});

// 登录处理
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.getUserByUsername(username);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render('admin/login', { error: '用户名或密码错误' });
    }
    
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.redirect('/admin');
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', { error: '登录失败' });
  }
});

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// 后台首页
router.get('/', requireAuth, async (req, res) => {
  try {
    const posts = await db.getPosts(1000);
    const projects = await db.getProjects(1000);
    const contacts = await db.getContacts(1000);
    const stats = {
      posts: posts.length,
      projects: projects.length,
      contacts: contacts.length
    };
    res.render('admin/dashboard', { user: req.session.user, stats });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { message: '服务器错误' });
  }
});

// 文章管理
router.get('/posts', requireAuth, async (req, res) => {
  try {
    const posts = await db.getPosts(1000);
    res.render('admin/posts', { user: req.session.user, posts });
  } catch (error) {
    console.error('Posts error:', error);
    res.status(500).render('error', { message: '服务器错误' });
  }
});

router.get('/posts/new', requireAuth, (req, res) => {
  res.render('admin/post-form', { user: req.session.user, post: null });
});

router.post('/posts', requireAuth, upload.single('featured_image'), async (req, res) => {
  try {
    const post = {
      title: req.body.title,
      slug: req.body.slug,
      content: req.body.content,
      excerpt: req.body.excerpt,
      category: req.body.category,
      tags: req.body.tags,
      published: req.body.published ? 1 : 0,
      featured_image: req.file ? '/uploads/' + req.file.filename : null
    };
    await db.savePost(post);
    res.redirect('/admin/posts');
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).render('error', { message: '创建文章失败' });
  }
});

router.get('/posts/:id/edit', requireAuth, async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { message: '文章不存在' });
    }
    res.render('admin/post-form', { user: req.session.user, post });
  } catch (error) {
    console.error('Edit post error:', error);
    res.status(500).render('error', { message: '服务器错误' });
  }
});

router.post('/posts/:id', requireAuth, upload.single('featured_image'), async (req, res) => {
  try {
    const existingPost = await db.getPostById(req.params.id);
    const post = {
      id: req.params.id,
      title: req.body.title,
      slug: req.body.slug,
      content: req.body.content,
      excerpt: req.body.excerpt,
      category: req.body.category,
      tags: req.body.tags,
      published: req.body.published ? 1 : 0,
      featured_image: req.file ? '/uploads/' + req.file.filename : (existingPost ? existingPost.featured_image : null)
    };
    await db.savePost(post);
    res.redirect('/admin/posts');
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).render('error', { message: '更新文章失败' });
  }
});

router.post('/posts/:id/delete', requireAuth, async (req, res) => {
  try {
    await db.deletePost(req.params.id);
    res.redirect('/admin/posts');
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).render('error', { message: '删除文章失败' });
  }
});

// 项目管理
router.get('/projects', requireAuth, async (req, res) => {
  try {
    const projects = await db.getProjects(1000);
    res.render('admin/projects', { user: req.session.user, projects });
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).render('error', { message: '服务器错误' });
  }
});

router.get('/projects/new', requireAuth, (req, res) => {
  res.render('admin/project-form', { user: req.session.user, project: null });
});

router.post('/projects', requireAuth, upload.single('featured_image'), async (req, res) => {
  try {
    const project = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      content: req.body.content,
      category: req.body.category,
      technologies: req.body.technologies,
      link: req.body.link,
      github: req.body.github,
      published: req.body.published ? 1 : 0,
      featured_image: req.file ? '/uploads/' + req.file.filename : null
    };
    await db.saveProject(project);
    res.redirect('/admin/projects');
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).render('error', { message: '创建项目失败' });
  }
});

router.get('/projects/:id/edit', requireAuth, async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).render('error', { message: '项目不存在' });
    }
    res.render('admin/project-form', { user: req.session.user, project });
  } catch (error) {
    console.error('Edit project error:', error);
    res.status(500).render('error', { message: '服务器错误' });
  }
});

router.post('/projects/:id', requireAuth, upload.single('featured_image'), async (req, res) => {
  try {
    const existingProject = await db.getProjectById(req.params.id);
    const project = {
      id: req.params.id,
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      content: req.body.content,
      category: req.body.category,
      technologies: req.body.technologies,
      link: req.body.link,
      github: req.body.github,
      published: req.body.published ? 1 : 0,
      featured_image: req.file ? '/uploads/' + req.file.filename : (existingProject ? existingProject.featured_image : null)
    };
    await db.saveProject(project);
    res.redirect('/admin/projects');
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).render('error', { message: '更新项目失败' });
  }
});

router.post('/projects/:id/delete', requireAuth, async (req, res) => {
  try {
    await db.deleteProject(req.params.id);
    res.redirect('/admin/projects');
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).render('error', { message: '删除项目失败' });
  }
});

// 联系记录
router.get('/contacts', requireAuth, async (req, res) => {
  try {
    const contacts = await db.getContacts(100);
    res.render('admin/contacts', { user: req.session.user, contacts });
  } catch (error) {
    console.error('Contacts error:', error);
    res.status(500).render('error', { message: '服务器错误' });
  }
});

// 设置
router.get('/settings', requireAuth, (req, res) => {
  res.render('admin/settings', { user: req.session.user, message: null });
});

router.post('/settings/password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await db.getUserByUsername(req.session.user.username);
    
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.render('admin/settings', { 
        user: req.session.user, 
        message: { type: 'error', text: '当前密码错误' }
      });
    }
    
    // 更新密码（这里需要添加方法到 database.js）
    // 暂时简化处理
    res.render('admin/settings', { 
      user: req.session.user, 
      message: { type: 'success', text: '密码更新功能开发中' }
    });
  } catch (error) {
    console.error('Password update error:', error);
    res.render('admin/settings', { 
      user: req.session.user, 
      message: { type: 'error', text: '更新密码失败' }
    });
  }
});

module.exports = router;
