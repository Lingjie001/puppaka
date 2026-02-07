const express = require('express');
const router = express.Router();
const Database = require('../database');
const db = new Database();

// 获取所有文章（公开API）
router.get('/posts', (req, res) => {
  try {
    const posts = db.getPosts(100);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个文章
router.get('/posts/:slug', (req, res) => {
  try {
    const post = db.getPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取所有项目
router.get('/projects', (req, res) => {
  try {
    const projects = db.getProjects(100);
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个项目
router.get('/projects/:slug', (req, res) => {
  try {
    const project = db.getProjectBySlug(req.params.slug);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;