const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const Database = require('../database');

const router = express.Router();
const db = new Database();

// 配置上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
    const user = db.getUserByUsername(username);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render('admin/login', { error: 'Invalid credentials' });
    }
    
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.render('admin/login', { error: 'Login failed' });
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
    const stats = {
      posts: db.getPostCount(),
      projects: db.getProjects(1000).length,
      contacts: db.getContacts(1000).length
    };
    res.render('admin/dashboard', { user: req.session.user, stats });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

// 文章管理
router.get('/posts', requireAuth, async (req, res) => {
  try {
    const posts = db.db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    res.render('admin/posts', { user: req.session.user, posts });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

router.get('/posts/new', requireAuth, (req, res) => {
  res.render('admin/post-form', { user: req.session.user, post: null });
});

router.post('/posts', requireAuth, upload.single('featured_image'), async (req, res) => {
  try {
    const post = {
      ...req.body,
      featured_image: req.file ? '/uploads/' + req.file.filename : null
    };
    db.createPost(post);
    res.redirect('/admin/posts');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to create post' });
  }
});

router.get('/posts/:id/edit', requireAuth, async (req, res) => {
  try {
    const post = db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { message: 'Post not found' });
    }
    res.render('admin/post-form', { user: req.session.user, post });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

router.post('/posts/:id', requireAuth, upload.single('featured_image'), async (req, res) => {
  try {
    const post = {
      ...req.body,
      featured_image: req.file ? '/uploads/' + req.file.filename : req.body.existing_image
    };
    db.updatePost(req.params.id, post);
    res.redirect('/admin/posts');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to update post' });
  }
});

router.post('/posts/:id/delete', requireAuth, async (req, res) => {
  try {
    db.deletePost(req.params.id);
    res.redirect('/admin/posts');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to delete post' });
  }
});

// 项目管理
router.get('/projects', requireAuth, async (req, res) => {
  try {
    const projects = db.db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    res.render('admin/projects', { user: req.session.user, projects });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

router.get('/projects/new', requireAuth, (req, res) => {
  res.render('admin/project-form', { user: req.session.user, project: null });
});

router.post('/projects', requireAuth, upload.single('featured_image'), async (req, res) => {
  try {
    const project = {
      ...req.body,
      featured_image: req.file ? '/uploads/' + req.file.filename : null
    };
    db.createProject(project);
    res.redirect('/admin/projects');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to create project' });
  }
});

router.get('/projects/:id/edit', requireAuth, async (req, res) => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found' });
    }
    res.render('admin/project-form', { user: req.session.user, project });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

router.post('/projects/:id', requireAuth, upload.single('featured_image'), async (req, res) => {
  try {
    const project = {
      ...req.body,
      featured_image: req.file ? '/uploads/' + req.file.filename : req.body.existing_image
    };
    db.updateProject(req.params.id, project);
    res.redirect('/admin/projects');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to update project' });
  }
});

router.post('/projects/:id/delete', requireAuth, async (req, res) => {
  try {
    db.deleteProject(req.params.id);
    res.redirect('/admin/projects');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Failed to delete project' });
  }
});

// 联系记录
router.get('/contacts', requireAuth, async (req, res) => {
  try {
    const contacts = db.getContacts(100);
    res.render('admin/contacts', { user: req.session.user, contacts });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
});

// 设置
router.get('/settings', requireAuth, (req, res) => {
  res.render('admin/settings', { user: req.session.user, message: null });
});

router.post('/settings/password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = db.getUserByUsername(req.session.user.username);
    
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.render('admin/settings', { 
        user: req.session.user, 
        message: { type: 'error', text: 'Current password is incorrect' }
      });
    }
    
    const hashedPassword = bcrypt.hashSync(new_password, 10);
    db.updateUserPassword(req.session.user.username, hashedPassword);
    
    res.render('admin/settings', { 
      user: req.session.user, 
      message: { type: 'success', text: 'Password updated successfully' }
    });
  } catch (error) {
    console.error(error);
    res.render('admin/settings', { 
      user: req.session.user, 
      message: { type: 'error', text: 'Failed to update password' }
    });
  }
});

module.exports = router;